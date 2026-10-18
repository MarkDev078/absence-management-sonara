<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        //
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  Request  $request
     * @return Response
     */
    public function render($request, Throwable $e)
    {
        return parent::render($request, $e);
    }

    /**
     * Convert an authentication exception into an unauthenticated response.
     *
     * @param  Request  $request
     * @return Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // Debug: let's see if we are here and what the request path is
        // die('Unauthenticated handler called. Path: '.$request->path());
        error_log('Handler unauthenticated called for path: '.$request->path().'. Expects JSON: '.($request->expectsJson() ? 'true' : 'false').'. Is api/*: '.($request->is('api/*') ? 'true' : 'false').'. shouldReturnJson: '.($this->shouldReturnJson($request, $exception) ? 'true' : 'false'));

        if ($this->shouldReturnJson($request, $exception) || $request->is('api/*')) {
            error_log('Returning JSON response');

            return response()->json(['message' => $exception->getMessage()], 401);
        }

        error_log('Returning redirect to login');

        return redirect()->guest(route('login'));
    }
}
