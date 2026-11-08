<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AbsenceRequest;
use App\Models\Approval;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ApprovalController extends Controller
{
    /**
     * Get pending approvals for the authenticated user.
     */
    public function pending(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user can approve (manager, RH, or admin)
        if (! $user->isManager() && ! $user->isRh() && ! $user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        // Get pending approvals where the user is the approver
        $approvals = Approval::where('approver_id', $user->id)
            ->whereNull('status') // Pending approvals have no status yet
            ->with(['absenceRequest.employee', 'absenceRequest.absenceType'])
            ->get();

        return response()->json($approvals);
    }

    /**
     * Approve an absence request.
     */
    public function approve(Request $request, Approval $approval): JsonResponse
    {
        $user = $request->user();

        // Only managers can decide (approve/reject) absence requests
        if (! $user->isManager()) {
            abort(403, 'Unauthorized');
        }

        // Verify the approver matches the authenticated user
        if ($approval->approver_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        // Check if approval is still pending
        /** @var ?string $approvalStatus */
        $approvalStatus = $approval->status;
        if ($approvalStatus !== null) {
            throw ValidationException::withMessages([
                'status' => ['This approval has already been processed.'],
            ]);
        }

        $absenceRequest = $approval->absenceRequest;

        if (! $absenceRequest) {
            abort(404, 'Absence request not found');
        }

        $reason = $request->input('reason');

        // Delegate to the model's hierarchical decision logic
        $absenceRequest->decide($user, 'approve', $reason);

        $approval->refresh();
        $approval->load(['absenceRequest.employee', 'absenceRequest.absenceType']);

        return response()->json($approval);
    }

    /**
     * Reject an absence request.
     */
    public function reject(Request $request, Approval $approval): JsonResponse
    {
        $user = $request->user();

        // Only managers can decide (approve/reject) absence requests
        if (! $user->isManager()) {
            abort(403, 'Unauthorized');
        }

        // Verify the approver matches the authenticated user
        if ($approval->approver_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        // Check if approval is still pending
        /** @var ?string $approvalStatus */
        $approvalStatus = $approval->status;
        if ($approvalStatus !== null) {
            throw ValidationException::withMessages([
                'status' => ['This approval has already been processed.'],
            ]);
        }

        $absenceRequest = $approval->absenceRequest;

        if (! $absenceRequest) {
            abort(404, 'Absence request not found');
        }

        $reason = $request->input('reason');

        // Delegate to the model's hierarchical decision logic
        $absenceRequest->decide($user, 'reject', $reason);

        $approval->refresh();
        $approval->load(['absenceRequest.employee', 'absenceRequest.absenceType']);

        return response()->json($approval);
    }

}
