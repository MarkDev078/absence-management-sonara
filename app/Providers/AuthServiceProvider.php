<?php

namespace App\Providers;

use App\Models\AbsenceRequest;
use App\Policies\AbsenceRequestPolicy;
use Illuminate\Auth\AuthServiceProvider as BaseAuthServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends BaseAuthServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        AbsenceRequest::class => AbsenceRequestPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
