<?php

namespace App\Http;

use App\Http\Middleware\Authenticate;
use App\Http\Middleware\CheckRole;
use App\Http\Middleware\EncryptCookies;
use App\Http\Middleware\PreventRequestsDuringMaintenance;
use App\Http\Middleware\RedirectIfAuthenticated;
use App\Http\Middleware\TrimStrings;
use App\Http\Middleware\TrustProxies;
use Fruitcake\Cors\HandleCors;
use Illuminate\Auth\Middleware\AuthenticateWith;
use Illuminate\Auth\Middleware\Authorize;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Auth\Middleware\VerifyEmail;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Foundation\Http\Kernel as HttpKernel;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\ValidatePostSize;
use Illuminate\Http\Middleware\CacheHeaders;
use Illuminate\Http\Middleware\Precognitive;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Routing\Middleware\ValidateSignature;
use Illuminate\Routing\Router;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Session\Middleware\VerifyCsrfToken;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to the application.
     *
     * @var array<int, class-string|string>
     */
    protected $middleware = [
        // \App\Http\Middleware\TrustHosts::class,
        TrustProxies::class,
        HandleCors::class,
        PreventRequestsDuringMaintenance::class,
        ValidatePostSize::class,
        TrimStrings::class,
        ConvertEmptyStringsToNull::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array<string, array<int, class-string|string>>
     */
    protected $middlewareGroups = [
        'web' => [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            // \Illuminate\Session\Middleware\HandleSessionExpired::class,
            VerifyCsrfToken::class,
            SubstituteBindings::class,
        ],

        'api' => [
            EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
            SubstituteBindings::class,
        ],
    ];

    /**
     * The application's route middleware aliases.
     *
     * These middleware may be assigned to groups or used individually.
     *
     * @var array<string, class-string|string>
     */
    protected $routeMiddleware = [
        'auth' => Authenticate::class,
        'auth.basic' => AuthenticateWith::class,
        'auth.session' => \Illuminate\Session\Middleware\Authenticate::class,
        'cache' => CacheHeaders::class,
        'can' => Authorize::class,
        'guest' => RedirectIfAuthenticated::class,
        'password.confirm' => RequirePassword::class,
        'precognitive' => Precognitive::class,
        'signed' => ValidateSignature::class,
        'throttle' => ThrottleRequests::class,
        'verified' => VerifyEmail::class,
        'role' => CheckRole::class,
    ];

    // Debug: let's see if this kernel is being loaded
    public function __construct(Application $app, Router $router)
    {
        error_log('CUSTOM KERNEL __CONSTRUCT CALLED');
        parent::__construct($app, $router);
    }
}
