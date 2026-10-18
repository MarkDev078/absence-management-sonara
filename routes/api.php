<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\AbsenceTypeController;
use App\Http\Controllers\API\AbsenceRequestController;
use App\Http\Controllers\API\ApprovalController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| are stateless, meaning they are not protected by session state.
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Absence Types (accessible based on role)
    Route::apiResource('absence-types', AbsenceTypeController::class)
        ->only(['index', 'show']); // Employees can view, managers/RH/Admin can manage

    // Absence Requests
    Route::apiResource('absence-requests', AbsenceRequestController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);

    // Specific absence request actions
    Route::post('absence-requests/{absenceRequest}/submit', [AbsenceRequestController::class, 'submit'])
        ->middleware('role:employee');
    Route::post('absence-requests/{absenceRequest}/cancel', [AbsenceRequestController::class, 'cancel'])
        ->middleware('role:employee');

    // Approvals (for managers, RH, admin)
    Route::get('approvals/pending', [ApprovalController::class, 'pending'])
        ->middleware('role:manager|rh|admin');
    Route::post('approvals/{approval}/approve', [ApprovalController::class, 'approve'])
        ->middleware('role:manager|rh|admin');
    Route::post('approvals/{approval}/reject', [ApprovalController::class, 'reject'])
        ->middleware('role:manager|rh|admin');

    // My team's absence requests (for managers)
    Route::get('my-team/absence-requests', [AbsenceRequestController::class, 'teamRequests'])
        ->middleware('role:manager');
});