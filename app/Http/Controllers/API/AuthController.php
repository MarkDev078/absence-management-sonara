<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and redirect to dashboard.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'matricule' => 'required|integer',
            'password' => 'required|string',
        ]);

        $user = User::where('matricule', $request->matricule)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'matricule' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->intended('/dashboard');
    }

    /**
     * Logout user (invalidate session).
     *
     * @return RedirectResponse
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    /**
     * Get the authenticated user.
     *
     * @return JsonResponse
     */
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}
