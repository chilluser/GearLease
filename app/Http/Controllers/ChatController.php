<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;
use App\Models\Listing;

class ChatController extends Controller {
    // Return brief conversation list for current user
    public function index(Request $r) {
        $userId = auth()->id();

        $convs = Conversation::where('seller_id', $userId)
            ->orWhere('renter_id', $userId)
            ->with(['seller', 'renter', 'messages' => function($q) { $q->latest()->limit(1); }])
            ->orderByDesc('last_message_at')
            ->get();

        $payload = $convs->map(function($c) use ($userId) {
            $other = $c->seller_id === $userId ? $c->renter : $c->seller;
            return [
                'id' => $c->id,
                'name' => $other?->name ?? 'Conversation',
                'last' => optional($c->messages->first())->text ?? '',
            ];
        });

        return response()->json($payload);
    }

    // Return messages for a conversation (ensure user is a participant)
    public function messages(Request $r, $id) {
        $conv = Conversation::findOrFail($id);
        $userId = auth()->id();
        if ($conv->seller_id !== $userId && $conv->renter_id !== $userId) {
            abort(403);
        }

        $msgs = $conv->messages()->orderBy('created_at')->get();

        $payload = $msgs->map(function($m) use ($userId) {
            return [
                'id' => $m->id,
                'text' => $m->text,
                'from_me' => $m->user_id === $userId,
                'created_at' => $m->created_at,
            ];
        });

        return response()->json($payload);
    }

    // Send a message to a conversation (API endpoint)
    public function send(Request $r, $id) {
        $r->validate(['text' => 'required|string']);

        $conv = Conversation::findOrFail($id);
        $userId = auth()->id();
        if ($conv->seller_id !== $userId && $conv->renter_id !== $userId) {
            abort(403);
        }

        $msg = $conv->messages()->create([
            'text' => $r->input('text'),
            'user_id' => $userId,
        ]);

        // update conversation metadata
        $conv->increment('message_count');
        $conv->last_message_at = $msg->created_at;
        $conv->save();

        
        return response()->json([
            'id' => $msg->id,
            'text' => $msg->text,
            'from_me' => true,
            'created_at' => $msg->created_at,
        ]);
    }

    // Create or find a conversation between seller and current user, then redirect home with open_chat
    public function messageSeller(Request $request, $sellerId)
    {
        $me = auth()->id();

        // find or create conversation between seller and renter
        $conv = Conversation::firstOrCreate([
            'seller_id' => $sellerId,
            'renter_id' => $me,
        ], [
            'message_count' => 0,
            'last_message_at' => now(),
        ]);

        if ($request->filled('rent_days') && $request->filled('listing_id')) {
            $days = intval($request->input('rent_days'));
            $listingId = intval($request->input('listing_id'));
            $total = $request->input('total') ?? null;
            $listing = Listing::find($listingId);

            $text = "Hi, I would like to rent: " . ($listing ? $listing->title : 'listing') .
                    " for {$days} days in total being {$total}";

            $msg = $conv->messages()->create([
                'text' => $text,
                'user_id' => $me,
                'type' => 'rent_request',
                'rent_listing_id' => $listingId,
                'rent_days' => $days,
                'rent_total' => $total,
            ]);

            $conv->increment('message_count');
            $conv->last_message_at = $msg->created_at;
            $conv->save();

            // If this was an AJAX/fetch request (explicit X-Requested-With or Accept JSON),
            // return JSON instead of redirecting to an HTML page.
            $isAjax = $request->header('X-Requested-With') === 'XMLHttpRequest'
                || str_contains((string)$request->header('Accept'), 'application/json')
                || $request->expectsJson();

            if ($isAjax) {
                return response()->json([
                    'success' => true,
                    'conversation_id' => $conv->id,
                    'message_id' => $msg->id,
                ], 200);
            }
        } else {
            // standard message handling...
        }

        return redirect()->route('Home', ['open_chat' => $conv->id]);
    }

    public function approveRequest(Request $request, $messageId)
    {
        $ownerId = auth()->id();

        $msg = Message::findOrFail($messageId);
        $conv = $msg->conversation;

        // ensure current user is the seller for this conversation
        if ($conv->seller_id !== $ownerId) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($msg->type !== 'rent_request' || !$msg->rent_listing_id) {
            return response()->json(['error' => 'Not a rent request'], 400);
        }

        $listing = Listing::find($msg->rent_listing_id);
        if (!$listing) {
            return response()->json(['error' => 'Listing not found'], 404);
        }

        // mark listing rented
        $listing->rented = true;
        $listing->renter_id = $conv->renter_id;
        $listing->rented_at = now();
        $listing->rented_days = $msg->rent_days ?? null;
        $listing->save();

        $listingKey = $listing->getKey();

        // send a system message to renter confirming approval
        $systemText = "Rental request approved for '{$listing->title}'. Rent period: {$listing->rented_days} days.";
        $systemMsg = $conv->messages()->create([
            'text' => $systemText,
            'user_id' => $ownerId,
            'type' => 'system',
        ]);

        // update conv metadata
        $conv->increment('message_count');
        $conv->last_message_at = $systemMsg->created_at;
        $conv->save();

        // ensure we use the model PK value (handles non-standard PK names)
        $listingKey = $listing->getKey();

        // mark the approved request message so it won't be considered active
        $msg->type = 'approved';
        $msg->save();

        // Cancel/notify other pending rent requests for this listing
        $otherRequests = Message::where('rent_listing_id', $listingKey)
            ->where('type', 'rent_request')
            ->where('id', '!=', $msg->id)
            ->get();

        foreach ($otherRequests as $or) {
            $otherConv = $or->conversation;
            $declineText = "The listing '{$listing->title}' was rented to another user and is no longer available.";
            $otherConv->messages()->create([
                'text' => $declineText,
                'user_id' => $ownerId,
                'type' => 'system',
            ]);
            $otherConv->increment('message_count');
            $otherConv->last_message_at = now();
            $otherConv->save();

            // mark original request as cancelled so it won't show as active
            $or->type = 'cancelled';
            $or->save();
        }

        return response()->json([
            'success' => true,
            'listing_id' => $listingKey,
        ]);
    }

    public function rentRequests()
    {
        $userId = auth()->id();

        $convs = Conversation::where('seller_id', $userId)
            ->with(['renter', 'messages'])
            ->get();

        $requests = collect();

        foreach ($convs as $conv) {
            foreach ($conv->messages as $msg) {
                // Only consider messages explicitly typed as rent_request
                if (!isset($msg->type) || $msg->type !== 'rent_request') {
                    continue;
                }

                $requests->push([
                    'id' => $msg->id,
                    'renter_name' => $conv->renter->name ?? 'Unknown',
                    'text' => is_string($msg->text) ? $msg->text : '',
                    'rent_listing_id' => $msg->rent_listing_id ?? null,
                    'rent_days' => $msg->rent_days ?? null,
                    'rent_total' => $msg->rent_total ?? null,
                ]);
            }
        }

        return response()->json($requests->values());
    }

}