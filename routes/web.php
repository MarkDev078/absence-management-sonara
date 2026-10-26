<?php

use App\Http\Controllers\AbsenceRequestShowController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/login', 'Auth/Login')->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.store');
Route::inertia('/dashboard', 'Dashboard')->name('dashboard')->middleware('auth');
Route::inertia('/absence-requests', 'Historique')->name('absence-requests.index')->middleware('auth');
Route::inertia('/absence-types', 'AbsenceType/Index')->name('absence-types.index')->middleware('auth');
Route::inertia('/approvals', 'Approval/Index')->name('approvals.index')->middleware('auth');
Route::inertia('/nouvelle-demande', 'NouvelleDemande')->name('nouvelle-demande')->middleware('auth');
Route::inertia('/historique', 'Historique')->name('historique')->middleware('auth');
Route::get('/absence-requests/{absenceRequest}', AbsenceRequestShowController::class)->name('absence-requests.show')->middleware('auth');
