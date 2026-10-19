<?php

use App\Http\Controllers\API\AuthController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'Auth/Login')->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');
Route::inertia('/dashboard', 'Dashboard')->name('dashboard')->middleware('auth');
