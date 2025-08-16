<?php
// app/Http/Controllers/AuctionController.php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use App\Models\Auction;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuctionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'auction_logo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'auction_name' => 'required|string',
            'auction_season' => 'required|string',
            'auction_date' => 'required|date',
            'auction_time' => 'required|date_format:H:i',
            'points_per_team' => 'required|integer',
            'base_bid' => 'required|integer',
            'bid_increase_by' => 'required|integer',
            'max_players_per_team' => 'required|integer',
            'min_players_per_team' => 'required|integer',
        ]);

        // Generate a unique auction code
        $auctionCode = strtoupper(Str::random(8));

        // Ensure it's unique
        while (Auction::where('auction_code', $auctionCode)->exists()) {
            $auctionCode = strtoupper(Str::random(8)); // Retry if the code already exists
        }

        $logoPath = null;
        if ($request->hasFile('auction_logo')) {
            $path = $request->file('auction_logo')->store('auction_logos', 'public');
            $logoPath = 'auction_logos/' . basename($path);
        }

        // Create the auction with the generated code
        $auction = Auction::create(array_merge($request->except('auction_logo'), [
            'user_id' => auth()->id(),
            'auction_logo' => $logoPath,
            'auction_code' => $auctionCode,
        ]));

        return response()->json(['message' => 'Auction created successfully!', 'auction' => $auction], 200);

        if ($request->amount_available > $auction->points_per_team) {
       return response()->json(['error' => 'Amount available cannot exceed points per team'], 422);
}

    }

    public function index()
    {
        $auctions = Auction::where('user_id', auth()->id())->get()->map(function ($auction) {
            $auction->auction_logo = $auction->auction_logo ? asset('storage/' . $auction->auction_logo) : null;

            // Check if there is any player with non-default selling fields
            $hasProgress = Player::where('auction_id', $auction->id)
                ->where(function ($query) {
                    $query->where('is_sold', true)
                        ->orWhereNotNull('sold_price')
                        ->orWhereNotNull('sold_team_id')
                        ->orWhereNotNull('sold_status');
                })->exists();

            $auction->can_continue = $hasProgress; // add a custom field to auction

            return $auction;
        });

        return response()->json(['auctions' => $auctions], 200);
    }

    public function show($id)
    {
        $auction = Auction::findOrFail($id);
        $auction->auction_logo = $auction->auction_logo ? asset('storage/' . $auction->auction_logo) : null;

        return response()->json(['auction' => $auction], 200);
    }

    public function showByCode($auction_code)
    {
        // Find the auction by its code
        $auction = Auction::where('auction_code', $auction_code)->first();

        if (!$auction) {
            return response()->json(['message' => 'Auction not found!'], 404);
        }

        $auction->auction_logo = $auction->auction_logo ? asset('storage/' . $auction->auction_logo) : null;

        return response()->json(['auction' => $auction], 200);
    }

    public function publicAuctions()
{
    $auctions = Auction::latest()->take(10)->get(); // Customize logic for “public/live” auctions
    return response()->json($auctions);
}


    public function update(Request $request, $id)
    {
        $auction = Auction::findOrFail($id);

        $request->validate([
            'auction_name' => 'required|string',
            'auction_season' => 'required|string',
            'auction_date' => 'required|date',
            'auction_time' => 'required|date_format:H:i',
            'points_per_team' => 'required|integer',
            'base_bid' => 'required|integer',
            'bid_increase_by' => 'required|integer',
            'max_players_per_team' => 'required|integer',
            'min_players_per_team' => 'required|integer',
        ]);

        if ($request->hasFile('auction_logo')) {
            if ($auction->auction_logo) {
                Storage::delete('public/' . $auction->auction_logo);
            }

            $path = $request->file('auction_logo')->store('auction_logos', 'public');
            $auction->auction_logo = 'auction_logos/' . basename($path);
        }

        $auction->update($request->except('auction_logo') + ['auction_logo' => $auction->auction_logo]);

        return response()->json(['message' => 'Auction updated successfully!'], 200);

        if ($request->amount_available > $auction->points_per_team) {
          return response()->json(['error' => 'Amount available cannot exceed points per team'], 422);
        }

    }

    public function destroy($id)
    {
        $auction = Auction::findOrFail($id);

        if ($auction->auction_logo) {
            Storage::delete('public/' . $auction->auction_logo);
        }

        $auction->delete();

        return response()->json(['message' => 'Auction deleted successfully!'], 200);
    }
    
    public function restartAuction($auction_id)
    {
        // Reset sold/unsold status for all players
        Player::where('auction_id', $auction_id)
            ->update([
                'is_sold' => false,
                'sold_price' => null,
                'sold_team_id' => null,
                'sold_status' => null,
            ]);

        return response()->json(['message' => 'Auction restarted successfully.'], 200);
    }

public function playerReauction($player_id)
{
    $player = Player::find($player_id);

    if (!$player) {
        return response()->json(['error' => 'Player not found.'], 404);
    }

    // Reset sold status fields directly
    $player->is_sold = false;
    $player->sold_price = null;
    $player->sold_team_id = null;
    $player->sold_status = null;
    $player->save();

    return response()->json(['message' => 'Player reauctioned successfully.', 'player' => $player], 200);
}


    public function validateAuctionSetup($auction_id)
    {
        $teams = \App\Models\Team::where('auction_id', $auction_id)->get();
        $players = \App\Models\Player::where('auction_id', $auction_id)->get();

        $hasTeams = $teams->count() > 0;
        $hasPlayers = $players->count() > 0;

        return response()->json([
            'is_valid' => $hasTeams && $hasPlayers,
            'has_teams' => $hasTeams,
            'has_players' => $hasPlayers,
        ]);
    }

 public function upcomingAuctions()
{
    $today = now()->toDateString();

    $upcomingAuctions = Auction::where('auction_date', '>=', $today) // ✅ include today
        ->orderBy('auction_date', 'asc')
        ->get()
        ->map(function ($auction) {
            $auction->auction_logo = $auction->auction_logo ? asset('storage/' . $auction->auction_logo) : null;
            return $auction;
        });

    return response()->json([
        'message' => 'Upcoming auctions fetched successfully.',
        'upcoming_auctions' => $upcomingAuctions,
    ], 200);
}


}

