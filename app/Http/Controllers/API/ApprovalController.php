<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Approval;
use App\Models\AbsenceRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ApprovalController extends Controller
{
    /**
     * Get pending approvals for the authenticated user.
     */
    public function pending(Request $request)
    {
        $user = $request->user();

        # Check if user can approve (manager, RH, or admin)
        if (!$user->isManager() && !$user->isRh() && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        # Get pending approvals where the user is the approver
        $approvals = Approval::where('approver_id', $user->id)
            ->whereNull('status') # Pending approvals have no status yet
            ->with(['absenceRequest.employee', 'absenceRequest.absenceType'])
            ->get();

        return response()->json($approvals);
    }

    /**
     * Approve an absence request at the current level.
     */
    public function approve(Request $request, Approval $approval)
    {
        $user = $request->user();

        # Check if user can approve this request
        if (!$user->isManager() && !$user->isRh() && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        # Verify the approver matches the authenticated user
        if ($approval->approver_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        # Check if approval is still pending
        if ($approval->status !== null) {
            throw ValidationException::withMessages([
                'status' => ['This approval has already been processed.']
            ]);
        }

        $absenceRequest = $approval->absenceRequest;

        # Check if this is the correct level for the user's role
        $expectedLevel = $this->getExpectedApprovalLevel($user);
        if ($approval->step !== $expectedLevel) {
            abort(403, 'Unauthorized for this approval level');
        }

        # Check if previous levels are approved
        if (!$this->arePreviousLevelsApproved($absenceRequest, $approval->step)) {
            throw ValidationException::withMessages([
                'step' => ['Previous approval levels must be completed first.']
            ]);
        }

        # Approve this level
        $approval->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        # Move to next level or mark as fully approved
        $this->processApprovalWorkflow($absenceRequest, $approval->step);

        $approval->load(['absenceRequest.employee', 'absenceRequest.absenceType']);

        return response()->json($approval);
    }

    /**
     * Reject an absence request.
     */
    public function reject(Request $request, Approval $approval)
    {
        $user = $request->user();

        # Check if user can approve this request
        if (!$user->isManager() && !$user->isRh() && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        # Verify the approver matches the authenticated user
        if ($approval->approver_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        # Check if approval is still pending
        if ($approval->status !== null) {
            throw ValidationException::withMessages([
                'status' => ['This approval has already been processed.']
            ]);
        }

        $absenceRequest = $approval->absenceRequest;

        # Check if this is the correct level for the user's role
        $expectedLevel = $this->getExpectedApprovalLevel($user);
        if ($approval->step !== $expectedLevel) {
            abort(403, 'Unauthorized for this approval level');
        }

        # Reject the request
        $approval->update([
            'status' => 'rejected',
            'approved_at' => now(),
        ]);

        # Update absence request status to rejected
        $absenceRequest->update([
            'status' => 'rejected',
            'current_approval_level' => $approval->step,
        ]);

        $approval->load(['absenceRequest.employee', 'absenceRequest.absenceType']);

        return response()->json($approval);
    }

    /**
     * Get the expected approval level for a user's role.
     */
    private function getExpectedApprovalLevel(User $user): int
    {
        if ($user->isManager()) {
            return 1; # Manager is first level
        } elseif ($user->isRh()) {
            return 2; # RH is second level
        } elseif ($user->isAdmin()) {
            return 3; # Admin is third level
        }

        return 0;
    }

    /**
     * Check if all previous approval levels are approved.
     */
    private function arePreviousLevelsApproved(AbsenceRequest $absenceRequest, int $currentLevel): bool
    {
        # For level 1 (manager), there are no previous levels
        if ($currentLevel <= 1) {
            return true;
        }

        # Check if all previous levels are approved
        $previousApprovals = $absenceRequest->approvals()
            ->where('step', '<', $currentLevel)
            ->where('status', 'approved')
            ->count();

        return $previousApprovals >= ($currentLevel - 1);
    }

    /**
     * Process the approval workflow after an approval is made.
     */
    private function processApprovalWorkflow(AbsenceRequest $absenceRequest, int $approvedLevel): void
    {
        # Count how many levels are approved
        $approvedCount = $absenceRequest->approvals()
            ->where('status', 'approved')
            ->count();

        # Define total levels (can be made configurable)
        $totalLevels = 3; # Manager, RH, Admin

        if ($approvedCount >= $totalLevels) {
            # All levels approved
            $absenceRequest->update([
                'status' => 'approved',
            ]);
        } else {
            # Move to next level - create approval record for next level
            $nextLevel = $approvedLevel + 1;
            $absenceRequest->update([
                'current_approval_level' => $nextLevel,
            ]);

            # Create approval record for the next level
            $nextApproverId = $this->getApproverIdForLevel($absenceRequest, $nextLevel);
            if ($nextApproverId) {
                Approval::create([
                    'absence_request_id' => $absenceRequest->id,
                    'approver_id' => $nextApproverId,
                    'step' => $nextLevel,
                    // status defaults to NULL (pending)
                    // approved_at defaults to NULL
                    // comment defaults to NULL
                ]);
            }
        }
    }

    /**
     * Get the approver ID for a specific approval level.
     */
    private function getApproverIdForLevel(AbsenceRequest $absenceRequest, int $level): ?int
    {
        $employee = $absenceRequest->employee;

        return match ($level) {
            1 => $employee->manager_id, // Manager level
            2 => $this->getRhApproverId($employee), // RH level
            3 => $this->getAdminApproverId(), // Admin level
            default => null,
        };
    }

    /**
     * Get RH approver ID (for simplicity, using a fixed RH user).
     * In a real system, this might be based on department, etc.
     */
    private function getRhApproverId(User $employee): ?int
    {
        // For now, we'll use the first RH user we find
        $rhUser = User::where('role', 'rh')->first();
        return $rhUser ? $rhUser->id : null;
    }

    /**
     * Get Admin approver ID (for simplicity, using a fixed admin user).
     */
    private function getAdminApproverId(): ?int
    {
        // For now, we'll use the first admin user we find
        $adminUser = User::where('role', 'admin')->first();
        return $adminUser ? $adminUser->id : null;
    }
}