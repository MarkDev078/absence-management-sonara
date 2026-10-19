<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnToWork extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'return_to_work';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'absence_request_id',
        'planned_return_date',
        'actual_return_date',
        'medical_visit_required',
        'medical_visit_date',
        'medical_visit_comment',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'planned_return_date' => 'date',
        'actual_return_date' => 'date',
        'medical_visit_required' => 'boolean',
        'medical_visit_date' => 'date',
    ];

    /**
     * Get the absence request that owns the return to work record.
     *
     * @return BelongsTo<AbsenceRequest, $this>
     */
    public function absenceRequest(): BelongsTo
    {
        return $this->belongsTo(AbsenceRequest::class);
    }
}
