<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\Player; 

class TeamController extends Controller
{
    public function getTeamsByAuction($auction_id)
    {
    $teams = \App\Models\Team::where('auction_id', $auction_id)->get();
    return response()->json(['teams' => $teams]);
    }

    public function addTeam(Request $request)
    {
        $request->validate([
            'team_name' => 'required',
            'team_short_name' => 'required',
            'owner_name' => 'required',
            'owner_contact' => 'required',
            'amount_available' => 'required|integer',
            'auction_id' => 'required|exists:auctions,id',
        ]);

        $team = new Team();
        if ($request->hasFile('team_logo')) {
            $file = $request->file('team_logo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('team_logos'), $filename);
            $team->team_logo = '/team_logos/'.$filename;
        }

        $team->team_name = $request->team_name;
        $team->team_short_name = $request->team_short_name;
        $team->owner_name = $request->owner_name;
        $team->owner_contact = $request->owner_contact;
        $team->amount_available = $request->amount_available;
        $team->details = $request->details;
        $team->auction_id = $request->auction_id;
        $team->save();

        return response()->json(['message' => 'Team added successfully!']);
    }
    public function show($auction_id, $team_id)
{
    $team = Team::where('auction_id', $auction_id)->findOrFail($team_id);
    return response()->json(['team' => $team]);
}

public function update(Request $request, $auction_id, $team_id)
{
    $team = Team::where('auction_id', $auction_id)->findOrFail($team_id);

    $team->team_name = $request->team_name;
    $team->team_short_name = $request->team_short_name;
    $team->owner_name = $request->owner_name;
    $team->owner_contact = $request->owner_contact;
    $team->amount_available = $request->amount_available;
    $team->details = $request->details;

    if ($request->hasFile('team_logo')) {
        $file = $request->file('team_logo');
        $path = $file->store('uploads/teams', 'public');
        $team->team_logo = '/storage/' . $path;
    }

    $team->save();

    return response()->json(['message' => 'Team updated successfully']);
}
public function destroy($auction_id, $team_id)
{
    $team = Team::where('auction_id', $auction_id)->findOrFail($team_id);
    $team->delete();

    return response()->json(['message' => 'Team deleted successfully']);
}

public function teamPlayers($auctionId, $teamId)
{
    $players = Player::where('auction_id', $auctionId)
        ->where('team_id', $teamId)
        ->where('is_sold', 1) // Only sold players
        
        ->get();

    $team = Team::findOrFail($teamId);

    return response()->json([
        'players' => $players,
        'team_name' => $team->team_name,
    ]);
}


}

