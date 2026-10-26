<?php

namespace App\Http\Controllers;

use App\Models\AbsenceRequest;
use Illuminate\Http\Request;

class AbsenceRequestShowController extends Controller
{
    public function __invoke(Request $request, AbsenceRequest $absenceRequest)
    {
        $user = $request->user();

        // Check if user can view this request
        if ($user->isEmployee() && $absenceRequest->employee_id !== $user->id) {
            abort(403, 'Unauthorized');
        } elseif ($user->isManager() && ! $user->managedAbsenceRequests()->where('id', $absenceRequest->id)->exists()) {
            abort(403, 'Unauthorized');
        }

        $absenceRequest->load(['absenceType', 'employee']);

        return inertia('DemandeDetail', [
            'absenceRequest' => $absenceRequest,
        ]);
    }
}
