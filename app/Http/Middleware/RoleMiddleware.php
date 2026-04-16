<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = $request->user();
        if (! $user) {
            return redirect()->route('login');
        }

        if ($role === 'admin' && (int) $user->user_role !== 1) {
            abort(403);
        }

        return $next($request);
    }
}