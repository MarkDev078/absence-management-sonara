<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string $role
 * @property int $matricule
 * @property string|null $first_name
 * @property string $last_name
 * @property string|null $position
 * @property string|null $department
 * @property string $status
 * @property int|null $manager_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'email',
    'password',
    'role',
    'matricule',
    'first_name',
    'last_name',
    'position',
    'department_id',
    'status',
    'manager_id',
])]
#[Hidden([
    'password',
    'remember_token',
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if the user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if the user has any of the given roles.
     *
     * @param  string[]  $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        return (bool) count(array_intersect($roles, [$this->role]));
    }

    /**
     * Determine if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Determine if the user is RH (Human Resources).
     */
    public function isRh(): bool
    {
        return $this->hasRole('rh');
    }

    /**
     * Determine if the user is a manager.
     */
    public function isManager(): bool
    {
        return $this->hasRole('manager');
    }

    /**
     * Determine if the user is an employee.
     */
    public function isEmployee(): bool
    {
        return $this->hasRole('employee');
    }

    /**
     * Get the manager that the user reports to.
     *
     * @return BelongsTo<User, $this>
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the department or service the user belongs to.
     *
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get the subordinates of the user.
     *
     * @return HasMany<User, $this>
     */
    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Get the absence requests made by the user (as employee).
     *
     * @return HasMany<AbsenceRequest, $this>
     */
    public function absenceRequests(): HasMany
    {
        return $this->hasMany(AbsenceRequest::class, 'employee_id');
    }

    /**
     * Get the absence requests where the user is a manager (through subordinates).
     *
     * @return HasManyThrough<AbsenceRequest, User, $this>
     */
    public function managedAbsenceRequests(): HasManyThrough
    {
        return $this->hasManyThrough(
            AbsenceRequest::class,
            User::class,
            'id',          // Manager's id
            'employee_id', // User's employee_id on absence_requests
            'id',          // Manager's id on users table (again)
            'employee_id'  // AbsenceRequest's employee_id
        );
    }
}
