<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\LogInController;
use App\Models\Listing;
use Illuminate\Support\Facades\Http;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [LogInController::class, 'apiLogin']);


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/store-listing', [ListingController::class, 'storelisting']);
    Route::put('/update-listing/{id}', [ListingController::class, 'update']);
    Route::delete('/delete-listing/{id}', [ListingController::class, 'delete']);
    Route::post('/logout', [LogInController::class, 'apiLogout']);
    Route::get('/listings', [ListingController::class, 'apiIndex']);

    Route::get('/returnpage/home', function() {
        
        $path = resource_path('js/pages/Home.tsx');

        if (!File::exists($path)) {
            return response()->json(['error' => 'Template not found'], 404);
        }
        
        $content = File::get($path);

        return response($content, 200)
            ->header('Content-Type', 'text/plain');
    });
    Route::get('/returnpage/profile', function() {
        
        $path = resource_path('js/pages/Profile.tsx');

        if (!File::exists($path)) {
            return response()->json(['error' => 'Template not found'], 404);
        }
        
        $content = File::get($path);

        return response($content, 200)
            ->header('Content-Type', 'text/plain');
    });
    Route::get('/listings/convert/{currency}', function($currency) {
        $response = Http::withoutVerifying()->get("https://open.er-api.com/v6/latest/USD");
        $rates = $response->json()['rates'];
        
        $rate = $rates[strtoupper($currency)] ?? 1;

        $listings = Listing::with('seller')->where('rented', false)->get();

        $convertedListings = $listings->map(function ($listing) use ($rate, $currency) {
            $listing->price_per_day = round($listing->price_per_day * $rate, 2);
            $listing->currency_label = strtoupper($currency);
            return $listing;
        });

        return response()->json([
            'status' => 'success',
            'exchange_rate' => $rate,
            'target_currency' => strtoupper($currency),
            'data' => $convertedListings
        ]);
    });
});