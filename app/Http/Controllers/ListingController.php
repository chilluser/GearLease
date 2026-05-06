<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;


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
        $isApi = $request->expectsJson() || $request->isJson();

        $rules = [
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'price_per_day' => 'required|numeric',
            'image_url' => $isApi ? 'nullable|string' : 'nullable|image|max:2048'
        ];

        $validatedData = $request->validate($rules);

        if (!$isApi && $request->hasFile('image_url')) {
            $path = $request->file('image_url')->store('listings', 'public');
            $validatedData['image_url'] = Storage::url($path);
        } 
        else {
            $imageSourceUrl = null;

            if (!empty($validatedData['image_url']) && filter_var($validatedData['image_url'], FILTER_VALIDATE_URL)) {
                $imageSourceUrl = $validatedData['image_url'];
            } else {
                // PIXABAY INTEGRATION
                $apiKey = 'You_dont_need_to_know.'; // Replace with your real key
                $query = preg_replace('/\b(for|cheap|sale|rent|urgent|fast|buy|price)\b/i', '', $validatedData['title']);
                $pixabayUrl = "https://pixabay.com/api/?key={$apiKey}&q=" . urlencode(trim($query)) . "&image_type=photo&per_page=3";

                try {
                    $resp = Http::withoutVerifying()->timeout(5)->get($pixabayUrl);
                    $apiData = $resp->json();

                    if (!empty($apiData['hits'][0]['largeImageURL'])) {
                        // Pixabay provides several sizes; largeImageURL or webformatURL are usually best
                        $imageSourceUrl = $apiData['hits'][0]['largeImageURL'];
                    } else {
                        // Fallback to LoremFlickr if Pixabay has no hits
                        $category = urlencode($validatedData['category'] ?? 'item');
                        $imageSourceUrl = "https://loremflickr.com/640/480/{$category}";
                    }
                } catch (\Exception $e) {
                    $imageSourceUrl = "https://loremflickr.com/640/480/" . urlencode($validatedData['category'] ?? 'item');
                }
            }

            // Keep your existing "Local Download" logic to fulfill the DB persistence requirement
            if (!empty($imageSourceUrl)) {
                try {
                    $res = Http::withoutVerifying()->timeout(10)->get($imageSourceUrl);

                    if ($res->ok() && str_contains(strtolower($res->header('Content-Type', '')), 'image')) {
                        $content = $res->body();
                        $ct = $res->header('Content-Type', '');
                        
                        $ext = 'jpg';
                        if (preg_match('#image/([a-z0-9+.-]+)#i', $ct, $m)) {
                            $ext = $m[1] === 'jpeg' ? 'jpg' : $m[1];
                        }

                        $filename = 'listings/' . now()->format('YmdHis') . '_' . uniqid() . '.' . $ext;
                        Storage::disk('public')->put($filename, $content);
                        $validatedData['image_url'] = Storage::url($filename);
                    } else {
                        $validatedData['image_url'] = $imageSourceUrl;
                    }
                } catch (\Exception $e) {
                    $validatedData['image_url'] = $imageSourceUrl;
                }
            }
        }

        $validatedData['seller_id'] = auth()->id();
        $listing = Listing::create($validatedData);

        return $request->header('X-Inertia') 
            ? redirect()->route('Home') 
            : ($isApi ? response()->json(['success' => true, 'listing' => $listing], 201) : redirect()->route('Home'));
    }

    public function delete(Request $request, $id)
    {
        $isInertia = $request->header('X-Inertia');
        $isApi = ($request->expectsJson() || $request->isJson()) && !$isInertia;

        $listing = Listing::findOrFail($id);
        if ($listing->seller_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $listing->delete();

        if ($isApi) {
            return response()->json(['success' => true]);
        }

        return redirect()->route('profile.edit')->with('success', 'Listing deleted.');
    }

    public function edit($id)
    {
        $listing = Listing::findOrFail($id);
        
        if ($listing->seller_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Always render the component for web users
        return Inertia::render('EditListing', ['listing' => $listing]);
    }

    public function update(Request $request, $id)
    {
        $listing = Listing::findOrFail($id);

        if ($listing->seller_id !== auth()->id()) {
            abort(403);
        }

        $isInertia = $request->header('X-Inertia');
        $isApi = ($request->expectsJson() || $request->isJson()) && !$isInertia;

        $validatedData = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'price_per_day' => 'required|numeric',
            'image_url' => 'nullable|string'
        ]);

        // Only fetch a new image if the user cleared the URL or left it empty
        if (empty($validatedData['image_url'])) {
            $apiKey = '55737893-6b2c8b4f86f6c6868b87b42c1'; 
            $query = preg_replace('/\b(for|cheap|sale|rent|urgent|fast|buy|price)\b/i', '', $validatedData['title']);
            $pixabayUrl = "https://pixabay.com/api/?key={$apiKey}&q=" . urlencode(trim($query)) . "&image_type=photo&per_page=1";

            $imageSourceUrl = null;
            try {
                $resp = Http::withoutVerifying()->timeout(5)->get($pixabayUrl);
                $apiData = $resp->json();

                if (!empty($apiData['hits'][0]['largeImageURL'])) {
                    $imageSourceUrl = $apiData['hits'][0]['largeImageURL'];
                } else {
                    // Better dynamic fallback than a static Porsche link
                    $imageSourceUrl = "https://loremflickr.com/640/480/" . urlencode($validatedData['category'] ?? 'item');
                }
            } catch (\Throwable $e) {
                $imageSourceUrl = "https://loremflickr.com/640/480/" . urlencode($validatedData['category'] ?? 'item');
            }

            // Download and store locally to maintain your DB requirement
            if (!empty($imageSourceUrl)) {
                try {
                    $res = Http::withoutVerifying()->timeout(10)->get($imageSourceUrl);
                    if ($res->ok()) {
                        $content = $res->body();
                        $ct = $res->header('Content-Type', '');
                        $ext = str_contains($ct, 'png') ? 'png' : 'jpg';
                        
                        $filename = 'listings/' . now()->format('YmdHis') . '_' . uniqid() . '.' . $ext;
                        Storage::disk('public')->put($filename, $content);
                        $validatedData['image_url'] = Storage::url($filename);
                    }
                } catch (\Throwable $e) {
                    $validatedData['image_url'] = $imageSourceUrl;
                }
            }
        }

        $listing->update($validatedData);

        if ($isInertia) {
            return redirect()->route('profile.edit')->with('success', 'Listing updated!');
        }

        if ($isApi) {
            return response()->json(['success' => true, 'listing' => $listing]);
        }

        return redirect()->route('profile.edit')->with('success', 'Listing updated!');
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

    public function apiIndex(Request $request)
    {
        // Query params: searchterm (string), filter (category)
        $searchTerm = $request->query('searchterm');
        $categoryFilter = $request->query('filter');

        $query = Listing::with('seller')->where('rented', false)->orderBy('created_at', 'desc');

        // If API caller is authenticated, exclude their own listings (same behavior as web)
        if ($request->user()) {
            $query->where('seller_id', '!=', $request->user()->id);
        }

        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($categoryFilter) {
            $query->where('category', $categoryFilter);
        }

        $items = $query->get();

        return response()->json(['data' => $items], 200);
    }

    public function getExternalInfo()
    {
        try {
            $response = Http::withoutVerifying()->get('https://raw.githubusercontent.com/laravel/laravel/master/README.md');
            $body = $response->body();
            $cleanText = strip_tags($body);
            $cleanText = preg_replace('/[#*\[\]\(\)]/','', $cleanText);
            $pos = stripos($cleanText, 'About Laravel');
            $snippet = $pos !== false ? substr($cleanText, $pos, 400) : substr($cleanText, 0, 400);
            return response()->json(['info' => trim($snippet)]);
        } catch (\Throwable $e) {
            Log::error('getExternalInfo failed: '.$e->getMessage());
            return response()->json(['error' => 'external fetch failed'], 500);
        }
    }

}