<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Approval extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'absence_request_id',
        'approver_id',
        'step',
        'status',
        'comment',
        'approved_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'step' => 'integer',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the absence request that owns the approval.
     */
    public function absenceRequest(): BelongsTo
    {
        return $this->belongsTo(AbsenceRequest::class);
    }

    /**
     * Get the user who is the approver.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
