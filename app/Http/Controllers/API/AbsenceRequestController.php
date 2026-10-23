<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AbsenceRequest;
use App\Models\AbsenceType;
use App\Models\Approval;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AbsenceRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Based on role, show different requests
        if ($user->isEmployee()) {
            // Employees see their own requests
            $requests = $user->absenceRequests()->with(['absenceType', 'employee', 'approvals.approver'])->get();
        } elseif ($user->isManager()) {
            // Managers see their team's requests
            $requests = $user->managedAbsenceRequests()->with(['absenceType', 'employee', 'approvals.approver'])->get();
        } elseif ($user->isRh() || $user->isAdmin()) {
            // RH and Admin see all requests
            $requests = AbsenceRequest::with(['absenceType', 'employee', 'approvals.approver'])->get();
        } else {
            $requests = collect();
        }

        return response()->json($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Employees can create absence requests
        if (! $user->isEmployee()) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'absence_type_id' => 'required|exists:absence_types,id',
            'start_date' => 'required|date|after_or_equal:today',
            'start_time_slot' => 'nullable|in:matin-P,soir-P,matin-Q,apres-midi-Q,nuit-Q',
            'end_date' => 'required|date|after_or_equal:start_date',
            'end_time_slot' => 'nullable|in:matin-P,soir-P,matin-Q,apres-midi-Q,nuit-Q',
            'reason' => 'required|string',
            'contact_phone' => 'nullable|string|max:20',
        ]);

        // Check if the absence type requires medical visit for long durations
        $absenceType = AbsenceType::findOrFail($request->absence_type_id);
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        $duration = $endDate->diffInDays($startDate) + 1;

        /** @var AbsenceType $absenceType */
        if ($absenceType->max_duration_days && $duration > $absenceType->max_duration_days) {
            throw ValidationException::withMessages([
                'end_date' => ['The duration exceeds the maximum allowed for this absence type.'],
            ]);
        }

        $absenceRequest = AbsenceRequest::create([
            'employee_id' => $user->id,
            'absence_type_id' => $request->absence_type_id,
            'start_date' => $request->start_date,
            'start_time_slot' => $request->start_time_slot,
            'end_date' => $request->end_date,
            'end_time_slot' => $request->end_time_slot,
            'reason' => $request->reason,
            'contact_phone' => $request->contact_phone,
            'status' => 'draft',
            'current_approval_level' => 0,
        ]);

        // Load relationships for response
        $absenceRequest->load('absenceType', 'employee');

        return response()->json($absenceRequest, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(AbsenceRequest $absenceRequest): JsonResponse
    {
        $user = Auth::user();

        // Check if user can view this request
        if ($user->isEmployee() && $absenceRequest->employee_id !== $user->id) {
            // Employee can only see their own requests
            abort(403, 'Unauthorized');
        } elseif ($user->isManager() && ! $user->managedAbsenceRequests()->where('id', $absenceRequest->id)->exists()) {
            // Manager can only see their team's requests
            abort(403, 'Unauthorized');
        }
        // RH and Admin can see all

        $absenceRequest->load(['absenceType', 'employee', 'approvals.approver', 'returnToWork']);

        return response()->json($absenceRequest);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AbsenceRequest $absenceRequest): JsonResponse
    {
        $user = $request->user();

        // Only employees can update their own draft requests
        if ($user->isEmployee() && $absenceRequest->employee_id === $user->id && $absenceRequest->status === 'draft') {
            $request->validate([
                'absence_type_id' => 'sometimes|required|exists:absence_types,id',
                'start_date' => 'sometimes|required|date|after_or_equal:today',
                'start_time_slot' => 'sometimes|nullable|in:matin-P,soir-P,matin-Q,apres-midi-Q,nuit-Q',
                'end_date' => 'sometimes|required|date|after_or_equal:start_date',
                'end_time_slot' => 'sometimes|nullable|in:matin-P,soir-P,matin-Q,apres-midi-Q,nuit-Q',
                'reason' => 'sometimes|required|string',
                'contact_phone' => 'sometimes|nullable|string|max:20',
            ]);

            // Check duration constraints if dates changed
            if ($request->has('start_date') || $request->has('end_date')) {
                $absenceType = AbsenceType::findOrFail(
                    $request->absence_type_id ?? $absenceRequest->absence_type_id
                );
                $startDate = Carbon::parse($request->input('start_date', $absenceRequest->start_date));
                $endDate = Carbon::parse($request->input('end_date', $absenceRequest->end_date));
                $duration = $endDate->diffInDays($startDate) + 1;

                /** @var AbsenceType $absenceType */
                if ($absenceType->max_duration_days && $duration > $absenceType->max_duration_days) {
                    throw ValidationException::withMessages([
                        'end_date' => ['The duration exceeds the maximum allowed for this absence type.'],
                    ]);
                }
            }

            $absenceRequest->update($request->all());
            $absenceRequest->load('absenceType', 'employee');

            return response()->json($absenceRequest);
        }

        abort(403, 'Unauthorized');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, AbsenceRequest $absenceRequest): JsonResponse
    {
        $user = $request->user();

        // Only employees can delete their own draft requests
        if ($user->isEmployee() && $absenceRequest->employee_id === $user->id && $absenceRequest->status === 'draft') {
            $absenceRequest->delete();

            return response()->json(null, 204);
        }

        abort(403, 'Unauthorized');
    }

    /**
     * Submit an absence request for approval.
     */
    public function submit(Request $request, AbsenceRequest $absenceRequest): JsonResponse
    {
        $user = $request->user();

        // Only employees can submit their own draft requests
        if ($user->isEmployee() && $absenceRequest->employee_id === $user->id && $absenceRequest->status === 'draft') {
            // Change status to pending and set to first approval level
            $absenceRequest->update([
                'status' => 'pending',
                'current_approval_level' => 1, // First level is manager
            ]);

            // Create approval record for the first level (manager)
            $employee = $absenceRequest->employee;
            /** @var User $employee */
            $managerId = $employee->manager_id;

            if ($managerId) {
                Approval::create([
                    'absence_request_id' => $absenceRequest->id,
                    'approver_id' => $managerId,
                    'step' => 1, // First level is manager
                    // status defaults to NULL (pending)
                    // approved_at defaults to NULL
                    // comment defaults to NULL
                ]);
            }

            $absenceRequest->load('absenceType', 'employee');

            return response()->json($absenceRequest);
        }

        abort(403, 'Unauthorized');
    }

    /**
     * Cancel an absence request.
     */
    public function cancel(Request $request, AbsenceRequest $absenceRequest): JsonResponse
    {
        $user = $request->user();

        // Only employees can cancel their own pending requests
        if ($user->isEmployee() && $absenceRequest->employee_id === $user->id && in_array($absenceRequest->status, ['pending', 'approved'])) {
            // Check if it's already been approved at all levels
            if ($absenceRequest->approvals()->where('status', 'approved')->count() >= 3) { // Assuming 3 levels
                abort(403, 'Cannot cancel fully approved request');
            }

            $absenceRequest->update([
                'status' => 'cancelled',
            ]);

            return response()->json($absenceRequest);
        }

        abort(403, 'Unauthorized');
    }

    /**
     * Get absence requests for the authenticated user's team (managers only).
     */
    public function teamRequests(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->isManager()) {
            abort(403, 'Unauthorized');
        }

        $requests = $user->managedAbsenceRequests()
            ->with(['absenceType', 'employee', 'approvals.approver'])
            ->get();

        return response()->json($requests);
    }
}
