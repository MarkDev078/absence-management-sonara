<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string $role
 * @property string|null $matricule
 * @property string|null $first_name
 * @property string|null $last_name
 * @property string|null $position
 * @property string|null $department
 * @property string $status
 * @property int|null $manager_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'password',
    'role',
    'matricule',
    'first_name',
    'last_name',
    'position',
    'department',
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
    use HasFactory, Notifiable, HasApiTokens;

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
     */
    public function hasAnyRole(array $roles): bool
    {
        return !! count(array_intersect($roles, [$this->role]));
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
     */
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get the subordinates of the user.
     */
    public function subordinates()
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    /**
     * Get the absence requests made by the user (as employee).
     */
    public function absenceRequests()
    {
        return $this->hasMany(AbsenceRequest::class, 'employee_id');
    }

    /**
     * Get the absence requests where the user is a manager (through subordinates).
     */
    public function managedAbsenceRequests()
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