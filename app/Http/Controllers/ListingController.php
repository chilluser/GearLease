<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{

    public function show($id)
    {
        $listing = Listing::with('seller')->findOrFail($id);
        return Inertia::render('ListingDetails', ['item' => $listing]);
    }


    public function showall()
    {
        // don't show rented listings on home
        $items = Listing::with('seller')->where('rented', false)->orderBy('created_at','desc')->get();
        return Inertia::render('Home', ['items' => $items]);
    }

    public function create()
    {
        return Inertia::render('CreateListing');
    }
    public function storelisting(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'price_per_day' => 'required|numeric',
            'image_url' => 'required|image|max:2048',
        ]);   

        if ($request->hasFile('image_url')) {
            $path = $request->file('image_url')->store('listings', 'public'); // stores in storage/app/public/listings
            // use Storage::url to get /storage/...
            $data['image_url'] = Storage::url($path);
        }
        
        $data['seller_id'] = auth()->id();
        Listing::create($data);
        return redirect()->route('Home');
    }
    public function delete(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);
        if ($listing->seller_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        $listing->delete();
        return redirect()->route('profile.edit')->with('success', 'Listing deleted.');
    }
    public function edit($id)
    {
        $listing = Listing::findOrFail($id);
        if ($listing->seller_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }
        return Inertia::render('EditListing', ['listing' => $listing]);
    }

    public function update(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);
        if ($listing->seller_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'price_per_day' => 'required|numeric',
            'image_url' => 'required|string'
        ]);

        $listing->update($data);
        return redirect()->route('profile.edit')->with('success', 'Listing updated.');
    }

    public function myRentals()
    {
        $userId = auth()->id();
        $rentals = Listing::where('renter_id', $userId)
            ->where('rented', true)
            ->get()
            ->map(function ($l) {
                $daysLeft = null;
                if ($l->rented_at && $l->rented_days) {
                    $expires = $l->rented_at->copy()->addDays($l->rented_days);
                    $daysLeft = max(0, now()->diffInDays($expires));
                }
                return [
                    'id' => $l->id,
                    'title' => $l->title,
                    'rented_at' => $l->rented_at ? $l->rented_at->toDateTimeString() : null,
                    'rented_days' => $l->rented_days,
                    'days_left' => $daysLeft,
                    'image_url' => $l->image ?? $l->image_url ?? null,
                ];
        });

        return response()->json($rentals->values());
    }

}