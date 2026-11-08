<?php

namespace App\Policies;

use App\Models\AbsenceRequest;
use App\Models\User;

class AbsenceRequestPolicy
{
    /**
     * Determine if the user can view the absence request.
     */
    public function view(User $user, AbsenceRequest $absenceRequest): bool
    {
        return $absenceRequest->canView($user);
    }

    /**
     * Determine if the user can decide (approve/reject) the absence request.
     */
    public function decide(User $user, AbsenceRequest $absenceRequest): bool
    {
        return $absenceRequest->canDecide($user);
    }

    /**
     * Determine if the user can acknowledge the absence request (RH prise de connaissance).
     */
    public function acknowledgeRh(User $user, AbsenceRequest $absenceRequest): bool
    {
        return $absenceRequest->canAcknowledgeRh($user);
    }
}
