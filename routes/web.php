<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'Auth/Login')->name('login');
Route::inertia('/dashboard', 'Dashboard')->name('dashboard')->middleware('auth:sanctum');
