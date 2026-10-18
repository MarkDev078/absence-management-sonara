<?php

use App\Providers\AppServiceProvider;
use Illuminate\Auth\AuthServiceProvider;
use Laravel\Sanctum\SanctumServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    SanctumServiceProvider::class,
];
