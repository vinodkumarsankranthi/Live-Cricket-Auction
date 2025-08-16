<?php

namespace App\Http\Controllers;

use App\Models\Player;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PlayerController extends Controller
{
    public function index($auction_id)
    {
        return Player::where('auction_id', $auction_id)->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'mobile' => 'required|string',
            'age' => 'required|integer',
            'jersey_name' => 'nullable|string',
            'jersey_number' => 'nullable|string',
            'jersey_style' => 'nullable|string',
            'jersey_size' => 'nullable|string',
            'batting_style' => 'nullable|string',
            'bowling_style' => 'nullable|string',
            'playing_style' => 'nullable|string',
            'base_price' => 'required|numeric',
            'image' => 'nullable|image',
            'auction_id' => 'required|integer',
        ]);

        $player = new Player($request->except('image'));

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('players', 'public');
            $player->image = $path;
        }

        $player->save();

        return response()->json(['message' => 'Player created successfully', 'player' => $player]);
    }

    public function show($id)
    {
        return Player::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $player = Player::findOrFail($id);
    
        $request->validate([
            'name' => 'required|string',
            'mobile' => 'nullable|string',
            'age' => 'nullable|integer',
            'jersey_name' => 'nullable|string',
            'jersey_number' => 'nullable|string',
            'jersey_style' => 'nullable|string',
            'jersey_size' => 'nullable|string',
            'base_price' => 'nullable|numeric',
            'batting_style' => 'nullable|string',
            'bowling_style' => 'nullable|string',
            'playing_style' => 'nullable|string',
        ]);
    
        if ($request->hasFile('image')) {
            // Delete the old image if exists
            if ($player->image) {
                Storage::delete('public/' . $player->image);
            }
    
            // Save the new image
            $path = $request->file('image')->store('player_images', 'public');
            $player->image = 'player_images/' . basename($path);
        }
    
        // Update other fields
        $player->update($request->except('image') + ['image' => $player->image]);
    
        return response()->json(['message' => 'Player updated successfully!'], 200);
    }
    

    public function destroy($id)
    {
        $player = Player::findOrFail($id);

        if ($player->image) {
            Storage::disk('public')->delete($player->image);
        }

        $player->delete();

        return response()->json(['message' => 'Player deleted successfully']);
    }
    public function sellPlayer(Request $request)
{
    $player = Player::findOrFail($request->player_id);
    $player->team_id = $request->team_id;
    $player->sold_price = $request->sold_price;
    $player->is_sold = 1; 
    $player->save();

    // Only show unsold players
$players = Player::where('is_sold', 0)->get();


    return response()->json(['message' => 'Player sold successfully']);
}

public function markAsSold(Request $request, $id)
{
    $request->validate([
        'team_id' => 'required|exists:teams,id',
        'sold_price' => 'required|numeric|min:1',
    ]);

    try {
        $player = Player::findOrFail($id);

        if ($player->is_sold) {
            return response()->json([
                'error' => 'Player already sold to another team!',
                'team_id' => $player->team_id,
                'team_name' => $player->team->team_name ?? null, // optional if relation exists
            ], 400);
        }

        $player->team_id = $request->input('team_id');
        $player->sold_price = $request->input('sold_price');
        $player->is_sold = 1;
        $player->sold_status = 'sold';
        $player->sold_team_id = $request->team_id;
        $player->save();

        return response()->json(['message' => 'Player marked as sold successfully.']);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
    }
}


public function markAsUnsold($id)
{
    try {
        $player = Player::findOrFail($id);

        $player->team_id = null;
        $player->sold_price = null;
        $player->is_sold = 0;
        $player->sold_status = 'unsold';
        $player->save();

        return response()->json(['message' => 'Player marked as unsold successfully.']);
    } catch (\Exception $e) {
        return response()->json(['error' => 'Something went wrong: ' . $e->getMessage()], 500);
    }
}


}
