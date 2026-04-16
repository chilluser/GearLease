<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = auth()->user()->load('listings');
        return Inertia::render('Profile', [
            'auth' => [
                'user' => $user,
            ],
            'userListings' => $user->listings,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'age' => 'nullable|integer|min:0|max:150',
            'password' => 'nullable|string|min:8|confirmed', // if you want confirmation add a password_confirmation field on the form
            'profile_picture' => 'nullable|image|max:4096',
        ]);

        if ($request->filled('password')) {
            $user->password = Hash::make($request->input('password'));
        }

        if ($request->hasFile('profile_picture')) {
            // delete old file if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }
            $path = $request->file('profile_picture')->store('avatars', 'public'); // saved as avatars/xxx.png
            $user->profile_picture = $path;
        }

        // always persist phone and other fields
        $user->name = $data['name'] ?? $user->name;
        $user->phone = $data['phone'] ?? $user->phone;
        $user->address = $data['address'] ?? $user->address;
        $user->city = $data['city'] ?? $user->city;
        $user->country = $data['country'] ?? $user->country;
        $user->age = $data['age'] ?? $user->age;

        $user->save();

        return redirect()->route('profile.edit')->with('success', 'Profile updated.');
    }
}