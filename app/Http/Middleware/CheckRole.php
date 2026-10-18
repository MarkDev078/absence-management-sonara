<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     * @param  string[]  ...$roles
     * @return Response
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // If no roles specified, allow access
        if (empty($roles)) {
            return $next($request);
        }

        // Check if user has any of the specified roles
        foreach ($roles as $role) {
            if ($this->hasRole($user, $role)) {
                return $next($request);
            }
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }

    /**
     * Check if user has a specific role.
     *
     * @param  Request  $request
     * @param  string  $role
     */
    protected function hasRole($user, $role): bool
    {
        // Handle role strings with pipe separator (e.g., "manager|rh|admin")
        if (strpos($role, '|') !== false) {
            $roles = explode('|', $role);
            foreach ($roles as $r) {
                if ($this->checkRoleMatch($user, trim($r))) {
                    return true;
                }
            }

            return false;
        }

        return $this->checkRoleMatch($user, $role);
    }

    /**
     * Check if user role matches the given role.
     *
     * @param  mixed  $user
     * @param  string  $role
     */
    protected function checkRoleMatch($user, $role): bool
    {
        // Support for both string role and hasRole method
        if (method_exists($user, 'hasRole')) {
            return $user->hasRole($role);
        }

        // Fallback to direct property comparison
        return isset($user->role) && $user->role === $role;
    }
}
