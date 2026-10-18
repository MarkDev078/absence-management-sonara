<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Contracts\Auth\Factory as Auth;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Create a new middleware instance.
     *
     * @return void
     */
    public function __construct(Auth $auth)
    {
        error_log('=== CUSTOM AUTHENTICATE MIDDLEWARE CONSTRUCTED ===');
        parent::__construct($auth);
    }

    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Debug: let's see if this middleware is being called
        error_log('=== CUSTOM AUTHENTICATE MIDDLEWARE CALLED ===');
        error_log('Path: '.$request->path());
        error_log('Expects JSON: '.$request->expectsJson());
        error_log('Is api/*: '.$request->is('api/*'));

        // For API requests, return null to prevent redirect (will trigger JSON response)
        if ($request->expectsJson() || $request->is('api/*')) {
            error_log('=== RETURNING NULL FOR API REQUEST ===');

            return null;
        }

        // For web requests, try to use the redirect route if named route exists
        if ($request->expectsJson() === false && ! $request->is('api/*')) {
            // Try to get the login route if it exists
            if (method_exists($this, 'redirectTo') && ! isset(static::$redirectToCallback)) {
                // Call parent redirectTo if no callback is set
                return parent::redirectTo($request);
            }

            // If we have a callback set, it might be trying to call route('login')
            // Let's check if we can safely call route('login') without error
            if (static::$redirectToCallback) {
                $redirect = call_user_func(static::$redirectToCallback, $request);
                if (is_string($redirect)) {
                    // Check if this is a route name that exists
                    if ($this->routeExists($redirect)) {
                        error_log('=== RETURNING REDIRECT FROM CALLBACK: '.$redirect.' ===');

                        return $redirect;
                    }
                }
            }
        }

        error_log('=== RETURNING NULL (NO REDIRECT) ===');

        return null;
    }

    /**
     * Check if a route exists by name.
     */
    protected function routeExists(string $name): bool
    {
        if (! method_exists($this, 'routes')) {
            return false;
        }

        try {
            $routes = $this->routes()->getRoutes();
            foreach ($routes as $route) {
                if ($route->getName() === $name) {
                    return true;
                }
            }
        } catch (\Exception $e) {
            // If we can't check routes, assume it doesn't exist to be safe
            return false;
        }

        return false;
    }
}
