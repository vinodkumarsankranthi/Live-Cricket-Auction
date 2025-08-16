<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
use App\Models\Fixture;
use Carbon\Carbon;
use DB;

class FixtureController extends Controller
{
    public function index($auction_id)
    {
        $fixtures = Fixture::where('auction_id', $auction_id)
            ->with(['team1', 'team2'])
            ->get();

        return response()->json([
            'fixtures' => $fixtures->map(function ($f) {
                return [
                    'id' => $f->id,
                    'date' => $f->date,
                    'time' => $f->time,
                    'venue' => $f->venue,
                    'overs' => $f->overs,
                    'fixture_type' => $f->fixture_type,
                    'team1_name' => $f->team1->team_name,
                    'team2_name' => $f->team2->team_name,
                    'team1_logo' => $f->team1->team_logo ? url($f->team1->team_logo) : null,
                    'team2_logo' => $f->team2->team_logo ? url($f->team2->team_logo) : null,
                ];
            })
        ]);
    }
public function generateFixtures(Request $request, $auction_id)
{
    $type = $request->input('fixture_type');
    $teamIds = $request->input('team_ids'); // 👈 Get selected team IDs

    // If specific teams are selected, filter by them
    $teams = $teamIds 
        ? Team::where('auction_id', $auction_id)->whereIn('id', $teamIds)->get()
        : Team::where('auction_id', $auction_id)->get();

    if ($teams->count() < 2) {
        return response()->json(['error' => 'Not enough teams'], 400);
    }

    DB::beginTransaction();

    try {
        Fixture::where('auction_id', $auction_id)->delete();

        $fixtures = [];

        switch ($type) {
            case 'knockout':
                $fixtures = $this->generateKnockout($teams, $auction_id);
                break;
            case 'round_robin':
                $fixtures = $this->generateRoundRobin($teams, $auction_id, false);
                break;
            case 'double_round_robin':
                $fixtures = $this->generateRoundRobin($teams, $auction_id, true);
                break;
            case 'playoff':
                $fixtures = $this->generatePlayoffs($teams, $auction_id);
                break;
            case 'best_of':
                $fixtures = $this->generateBestOf($teams, $auction_id, 3);
                break;
            case 'triangular':
                $fixtures = $this->generateRoundRobin($teams->take(3), $auction_id, false);
                break;
            case 'quadrangular':
                $fixtures = $this->generateRoundRobin($teams->take(4), $auction_id, false);
                break;
            case 'royal_rumble':
                $fixtures = $this->generateRoyalRumble($teams, $auction_id);
                break;
            case 'manual':
                $fixtures = $this->saveManualFixtures($teams, $auction_id);
                break;
            default:
                return response()->json(['error' => 'Invalid fixture type'], 400);
        }

        Fixture::insert($fixtures);
        DB::commit();

        return response()->json(['message' => 'Fixtures generated', 'count' => count($fixtures)]);
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'error' => 'Fixture generation failed',
            'details' => $e->getMessage()
        ], 500);
    }
}


    public function resetFixtures($auction_id)
    {
        Fixture::where('auction_id', $auction_id)->delete();
        return response()->json(['message' => 'Fixtures reset successfully']);
    }

    private function generateRoundRobin($teams, $auction_id, $double = false)
    {
        $rawFixtures = [];

        for ($i = 0; $i < $teams->count(); $i++) {
            for ($j = $i + 1; $j < $teams->count(); $j++) {
                $team1 = $teams[$i];
                $team2 = $teams[$j];

                $rawFixtures[] = [
                    'team1_id' => $team1->id,
                    'team2_id' => $team2->id,
                ];

                if ($double) {
                    $rawFixtures[] = [
                        'team1_id' => $team2->id,
                        'team2_id' => $team1->id,
                    ];
                }
            }
        }

        $scheduledFixtures = $this->spreadOutMatches($rawFixtures);
        $date = Carbon::now()->addDay();
        $fixtures = [];

        foreach ($scheduledFixtures as $fixture) {
            $fixtures[] = [
                'auction_id' => $auction_id,
                'team1_id' => $fixture['team1_id'],
                'team2_id' => $fixture['team2_id'],
                'date' => $date->toDateString(),
                'time' => $date->format('H:i'),
                'venue' => 'Ground ' . chr(65 + rand(0, 4)),
                'overs' => 20,
                'fixture_type' => $double ? 'double_round_robin' : 'round_robin',
                'created_at' => now(),
                'updated_at' => now()
            ];
            $date->addDay();
        }

        return $fixtures;
    }

    private function spreadOutMatches($fixtures)
    {
        $schedule = [];
        $usedTeams = [];

        while (!empty($fixtures)) {
            foreach ($fixtures as $key => $fixture) {
                if (
                    !in_array($fixture['team1_id'], $usedTeams) &&
                    !in_array($fixture['team2_id'], $usedTeams)
                ) {
                    $schedule[] = $fixture;
                    $usedTeams[] = $fixture['team1_id'];
                    $usedTeams[] = $fixture['team2_id'];
                    unset($fixtures[$key]);
                }
            }
            $usedTeams = []; // Reset for the next day
        }

        return $schedule;
    }

    private function generateKnockout($teams, $auction_id)
    {
        $fixtures = [];
        $date = Carbon::now()->addDay();
        $teamIds = $teams->pluck('id')->shuffle()->toArray();

        while (count($teamIds) > 1) {
            $team1 = array_shift($teamIds);
            $team2 = array_shift($teamIds);
            $fixtures[] = $this->makeMatch($auction_id, $team1, $team2, $date, '', 'knockout');
            $date->addDay();
        }

        return $fixtures;
    }

    private function generatePlayoffs($teams, $auction_id)
    {
        $fixtures = [];
        $date = Carbon::now()->addDay();
        $sorted = $teams->sortByDesc('points');
        $teamIds = $sorted->pluck('id')->toArray();

        if (count($teamIds) < 4) return [];

        $fixtures[] = $this->makeMatch($auction_id, $teamIds[0], $teamIds[1], $date, 'Qualifier 1', 'playoff');
        $date->addDay();
        $fixtures[] = $this->makeMatch($auction_id, $teamIds[2], $teamIds[3], $date, 'Eliminator', 'playoff');
        $date->addDay();
        $fixtures[] = $this->makeMatch($auction_id, $teamIds[1], $teamIds[2], $date, 'Qualifier 2', 'playoff');
        $date->addDay();
        $fixtures[] = $this->makeMatch($auction_id, $teamIds[0], $teamIds[1], $date, 'Final', 'playoff');

        return $fixtures;
    }

    private function generateBestOf($teams, $auction_id, $matches = 3)
    {
        $fixtures = [];
        $date = Carbon::now()->addDay();
        $team1 = $teams[0];
        $team2 = $teams[1];

        for ($i = 1; $i <= $matches; $i++) {
            $fixtures[] = $this->makeMatch($auction_id, $team1->id, $team2->id, $date, "Match $i", 'best_of');
            $date->addDay();
        }

        return $fixtures;
    }

    private function generateRoyalRumble($teams, $auction_id)
    {
        $fixtures = [];
        $date = Carbon::now()->addDay();

        for ($i = 0; $i < $teams->count(); $i += 2) {
            if (!isset($teams[$i + 1])) break;
            $fixtures[] = $this->makeMatch($auction_id, $teams[$i]->id, $teams[$i + 1]->id, $date, 'Rumble Match', 'royal_rumble');
            $date->addDay();
        }

        return $fixtures;
    }

    private function makeMatch($auction_id, $team1, $team2, $date, $venue = '', $type = 'custom')
    {
        return [
            'auction_id' => $auction_id,
            'team1_id' => $team1,
            'team2_id' => $team2,
            'date' => $date->toDateString(),
            'time' => $date->format('H:i'),
            'venue' => $venue ?: 'Ground ' . chr(65 + rand(0, 4)),
            'overs' => 20,
            'fixture_type' => $type,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

public function saveManualFixtures(Request $request, $auction_id)
{
    $fixtures = $request->input('fixtures');

    foreach ($fixtures as $fixtureData) {
        $fixture = Fixture::find($fixtureData['id'] ?? null);

        if ($fixture) {
            // Update only provided fields
            $fixture->date = $fixtureData['date'] ?? $fixture->date;
            $fixture->time = $fixtureData['time'] ?? $fixture->time;
            $fixture->venue = $fixtureData['venue'] ?? $fixture->venue;
            $fixture->overs = $fixtureData['overs'] ?? $fixture->overs;
            $fixture->fixture_type = $fixtureData['fixture_type'] ?? $fixture->fixture_type;

            if (isset($fixtureData['team1_id'])) {
                $fixture->team1_id = $fixtureData['team1_id'];
            }

            if (isset($fixtureData['team2_id'])) {
                $fixture->team2_id = $fixtureData['team2_id'];
            }
            if (isset($fixture['team1_id'], $fixture['team2_id']) && $fixture['team1_id'] === $fixture['team2_id']) {
            return response()->json([
                'error' => 'Both teams cannot be the same for a fixture.'
            ], 422); // Unprocessable Entity status code
        }
            $fixture->save();
        } else {
            // If it's a new fixture (no ID), create it
            Fixture::create(array_merge(
                ['auction_id' => $auction_id],
                $fixtureData
            ));
        }
    }

    return response()->json(['message' => 'Fixtures updated successfully']);
}



    public function deleteFixture($auction_id, $fixture_id)
{
    $fixture = Fixture::where('auction_id', $auction_id)->where('id', $fixture_id)->first();
    if (!$fixture) {
        return response()->json(['error' => 'Fixture not found'], 404);
    }

    $fixture->delete();
    return response()->json(['message' => 'Fixture deleted']);
}

    
}
