<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AbsenceType extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'label',
        'requires_medical_visit',
        'max_duration_days',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'requires_medical_visit' => 'boolean',
        'max_duration_days' => 'integer',
    ];

    /**
     * Get the absence requests for this absence type.
     */
    public function absenceRequests(): HasMany
    {
        return $this->hasMany(AbsenceRequest::class);
    }
}
