<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AbsenceRequest extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'absence_type_id',
        'start_date',
        'start_time_slot',
        'end_date',
        'end_time_slot',
        'reason',
        'contact_phone',
        'status',
        'current_approval_level',
        'current_approver_id',
        'rh_acknowledged_at',
        'rh_acknowledged_by_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'current_approval_level' => 'integer',
        'current_approver_id' => 'integer',
        'rh_acknowledged_by_id' => 'integer',
    ];

    /**
     * Get the employee that owns the absence request.
     *
     * @return BelongsTo<User, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    /**
     * Get the absence type for the request.
     *
     * @return BelongsTo<AbsenceType, $this>
     */
    public function absenceType(): BelongsTo
    {
        return $this->belongsTo(AbsenceType::class, 'absence_type_id');
    }

    /**
     * Get the approvals for the absence request.
     *
     * @return HasMany<Approval, $this>
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }

    /**
     * Get the return to work record for the absence request.
     *
     * @return HasOne<ReturnToWork, $this>
     */
    public function returnToWork(): HasOne
    {
        return $this->hasOne(ReturnToWork::class);
    }

    /**
     * Get the current approver of the absence request.
     *
     * @return BelongsTo<User, $this>
     */
    public function currentApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'current_approver_id');
    }

    /**
     * Get the RH user who acknowledged the absence request.
     *
     * @return BelongsTo<User, $this>
     */
    public function rhAcknowledger(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rh_acknowledged_by_id');
    }

    /**
     * Determine if the given user can view this absence request.
     */
    public function canView(User $user): bool
    {
        if ($this->employee_id === $user->id) {
            return true;
        }

        if ($user->hasRole('rh') || $user->hasRole('admin')) {
            return true;
        }

        if ($user->isManager()) {
            $employee = $this->employee;

            return $employee ? $employee->isSubordinateOf($user) : false;
        }

        return false;
    }

    /**
     * Determine if the given user can decide (approve/reject) this absence request.
     */
    public function canDecide(User $user): bool
    {
        if ($this->status !== 'pending') {
            return false;
        }

        if ($this->current_approver_id !== $user->id) {
            return false;
        }

        if (! $user->isManager()) {
            return false;
        }

        $employee = $this->employee;

        return $employee ? $employee->isSubordinateOf($user) : false;
    }

    /**
     * Determine if the given RH user can acknowledge this absence request.
     */
    public function canAcknowledgeRh(User $user): bool
    {
        return $this->status === 'approved' && $user->hasRole('rh');
    }

    /**
     * Record a decision (approve or reject) on this absence request by a manager in the chain.
     */
    public function decide(User $decider, string $kind, ?string $reason = null): void
    {
        if (! $this->canDecide($decider)) {
            throw ValidationException::withMessages([
                'decision' => ['Vous n\'êtes pas autorisé à prendre une décision sur cette demande.'],
            ]);
        }

        // Met à jour l'enregistrement d'approbation en attente du décideur.
        $this->approvals()
            ->where('approver_id', $decider->id)
            ->whereNull('status')
            ->update([
                'status' => $kind === 'approve' ? 'approved' : 'rejected',
                'kind' => $kind,
                'comment' => $reason,
                'approved_at' => now(),
            ]);

        if ($kind === 'reject') {
            $this->update([
                'status' => 'rejected',
                'current_approver_id' => null,
            ]);

            return;
        }

        // Le prochain approbateur est le manager du décideur (chaîne hiérarchique dynamique).
        $nextApproverId = $decider->manager_id;

        if ($nextApproverId) {
            $this->update([
                'status' => 'pending',
                'current_approval_level' => $this->current_approval_level + 1,
                'current_approver_id' => $nextApproverId,
            ]);

            $this->approvals()->create([
                'approver_id' => $nextApproverId,
                'step' => $this->current_approval_level,
                'kind' => null,
                'comment' => null,
                'approved_at' => null,
            ]);
        } else {
            $this->update([
                'status' => 'approved',
                'current_approver_id' => null,
            ]);
        }
    }

    /**
     * Record that an RH user has taken knowledge of this approved absence request.
     */
    public function acknowledgeRh(User $rhUser): void
    {
        if (! $this->canAcknowledgeRh($rhUser)) {
            throw ValidationException::withMessages([
                'acknowledge' => ['Vous n\'êtes pas autorisé à prendre connaissance de cette demande.'],
            ]);
        }

        $this->update([
            'rh_acknowledged_at' => now(),
            'rh_acknowledged_by_id' => $rhUser->id,
        ]);
    }
}
