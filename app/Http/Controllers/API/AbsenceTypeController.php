<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AbsenceType;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsenceTypeController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        // Only active absence types or based on role
        $query = AbsenceType::query();

        // Employees can see all absence types (they need to know what's available)
        // Managers/RH/Admin might want to see all including inactive ones if we had that field
        $absenceTypes = $query->get();

        return response()->json($absenceTypes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Only RH and Admin can create absence types
        $this->authorize('create', AbsenceType::class);

        $request->validate([
            'label' => 'required|string|max:100|unique:absence_types,label',
            'requires_medical_visit' => 'sometimes|boolean',
            'max_duration_days' => 'sometimes|integer|min:1',
            'description' => 'sometimes|string',
        ]);

        $absenceType = AbsenceType::create($request->all());

        return response()->json($absenceType, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(AbsenceType $absenceType): JsonResponse
    {
        return response()->json($absenceType);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AbsenceType $absenceType): JsonResponse
    {
        // Only RH and Admin can update absence types
        $this->authorize('update', $absenceType);

        $request->validate([
            'label' => 'sometimes|required|string|max:100|unique:absence_types,label,'.$absenceType->id,
            'requires_medical_visit' => 'sometimes|boolean',
            'max_duration_days' => 'sometimes|integer|min:1',
            'description' => 'sometimes|string',
        ]);

        $absenceType->update($request->all());

        return response()->json($absenceType);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AbsenceType $absenceType): JsonResponse
    {
        // Only RH and Admin can delete absence types
        $this->authorize('delete', $absenceType);

        // Check if absence type is in use
        if ($absenceType->absenceRequests()->exists()) {
            return response()->json([
                'message' => 'Cannot delete absence type that is in use',
            ], 409);
        }

        $absenceType->delete();

        return response()->json(null, 204);
    }
}
