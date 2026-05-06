<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Listing;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request, ?string $filter = null)
    {
        // prefer explicit inputs: query param 'searchterm' or route param 'searchterm'
        $searchTerm = $request->input('searchterm') ?? $request->route('searchterm') ?? null;

        // category filter can come from the route param ($filter) or query string 'filter'
        $categoryFilter = $filter ?? $request->route('filter') ?? $request->input('filter') ?? null;

        // build query and exclude rented listings
        $query = Listing::with('seller')->where('rented', false)->orderBy('created_at', 'desc');

        // If the user is authenticated, exclude their own listings from the feed
        $userId = auth()->id();
        if ($userId) {
            $query->where('seller_id', '!=', $userId);
        }

        if ($searchTerm) {
            $query->where(function($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($categoryFilter) {
            $query->where('category', $categoryFilter);
        }

        $items = $query->get();

        // debug: log and return current user id to the frontend
        \Log::info('HomeController:index called', ['auth_id' => auth()->id()]);
        $openChat = $request->query('open_chat');

        return Inertia::render('Home', [
            'items' => $items,
            'open_chat' => $openChat ? (int) $openChat : null,
            'current_user_id' => auth()->id(),
        ]);
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