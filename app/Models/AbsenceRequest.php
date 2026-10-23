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
}
