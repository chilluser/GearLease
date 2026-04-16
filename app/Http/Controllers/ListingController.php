<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    public function showall()
    {
        $items = Listing::with('seller')->orderBy('created_at','desc')->get();
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
}