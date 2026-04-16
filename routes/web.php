<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Laravel\Fortify\Features;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LogInController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ListingController;

Route::middleware(['auth'])->group(function(){
    Route::get('/', [HomeController::class, 'index'])->name('Home');
    Route::get('/search/{searchterm}', [HomeController::class, 'index'])->name('Home.search');
    Route::post('/listings', [HomeController::class, 'store'])->name('listings.store');
    Route::get('/category/{filter}', [HomeController::class, 'index'])->name('Home.filter');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('/create-listing', [ListingController::class, 'create'])->name('create.listing');
    Route::post('/store-listing', [ListingController::class, 'storelisting'])->name('store.listing');
    Route::delete('/delete-listing/{id}', [ListingController::class, 'delete'])->name('delete.listing');
    Route::get('/edit-listing/{id}', [ListingController::class, 'edit'])->name('edit.listing');
    Route::put('/update-listing/{id}', [ListingController::class, 'update'])->name('update.listing');
    // we dont have an update function yet.
});

Route::fallback(function(){
    return redirect()->route('login');
}); 


Route::get('/login', [LogInController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LogInController::class, 'login'])->name('login.post');
Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register'])->name('register.post');


require __DIR__.'/settings.php';
