<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Listing;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request, ?string $filter = null)
    {
        $items = Listing::with('seller')->orderBy('created_at','desc');
        // how do we know when its a search term and when filter? Answer: We can check if the request has a search term parameter. If it does, we can use that to filter the listings. If it doesn't, we can check for a category filter parameter and use that instead.
        if ($request->has('searchterm')) {
            $searchTerm = $request->input('searchterm');
            $items->where(function($query) use ($searchTerm) {
                $query->where('title', 'like', "%{$searchTerm}%")
                      ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($filter) {
            $items->where('category', $filter);
        }

        return Inertia::render('Home', ['items' => $items->get()]);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'price_per_day' => 'required|numeric',
            'image_url' => 'required|string'
        ]);
        $data['seller_id'] = auth()->id();
        Listing::create($data);
        return redirect()->route('Home');
    }
}