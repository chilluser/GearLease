<?php

use App\Http\Controllers\ChatController;

Route::middleware('auth:sanctum')->get('/rent-requests', [ChatController::class, 'rentRequests']);