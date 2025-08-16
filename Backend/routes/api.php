<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuctionController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FixtureController;
use App\Http\Controllers\AdminController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'sendMessage']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/signup-send-otp', [AuthController::class, 'sendSignupOtp']);
Route::post('/signup-verify-otp', [AuthController::class, 'verifySignupOtp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user-profile', [AuthController::class, 'profile']);
    Route::put('/update-profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'getAllUsers']);
    Route::put('/users/{id}/update-plan', [AdminController::class, 'updateUserPlan']);
});


Route::middleware('auth:sanctum')->group(function () {
Route::post('/new-auction', [AuctionController::class, 'store']);
Route::get('/my-auctions', [AuctionController::class, 'index']);
});

Route::put('/update-auction/{id}', [AuctionController::class, 'update']);
Route::delete('/delete-auction/{id}', [AuctionController::class, 'destroy']);
Route::get('/auction/{id}', [AuctionController::class, 'show']);
Route::get('/auction/code/{auction_code}', [AuctionController::class, 'showByCode']);

Route::post('/players', [PlayerController::class, 'store']);
Route::get('/players/{auction_id}', [PlayerController::class, 'index']);

Route::get('/players/show/{id}', [PlayerController::class, 'show']);
Route::post('/players/update/{id}', [PlayerController::class, 'update']); 
Route::delete('/players/delete/{id}', [PlayerController::class, 'destroy']); 

Route::get('/auction/{auction_id}/teams', [TeamController::class, 'getTeamsByAuction']);
Route::post('/add-team', [TeamController::class, 'addTeam']);

Route::get('/auction/{auction_id}/teams/{team_id}', [TeamController::class, 'show']);
Route::post('/auction/{auction_id}/teams/{team_id}/update', [TeamController::class, 'update']);
Route::delete('/auction/{auction_id}/teams/{team_id}/delete', [TeamController::class, 'destroy']);

Route::post('/player/sell', [PlayerController::class, 'sellPlayer']);
Route::get('/auction/{auction}/team/{team}/players', [TeamController::class, 'teamPlayers']);

Route::post('/players/{id}/sold', [PlayerController::class, 'markAsSold']);
Route::post('/players/{id}/unsold', [PlayerController::class, 'markAsUnsold']);
Route::post('/players/{player}/player-reauction', [AuctionController::class, 'playerReauction']);

Route::post('/player/sell/{player}', [PlayerController::class, 'sellPlayer']);

Route::post('/auction/{auction_id}/restart', [AuctionController::class, 'restartAuction']);
Route::get('/auction/{auction_id}/validate', [AuctionController::class, 'validateAuctionSetup']);

Route::get('/auction/{auction_id}/fixtures', [FixtureController::class, 'index']);
Route::post('/auction/{auction_id}/generate-fixtures', [FixtureController::class, 'generateFixtures']);
Route::post('/auction/{auction_id}/save-manual-fixtures', [FixtureController::class, 'saveManualFixtures']);
Route::delete('/auction/{auction_id}/fixtures/reset', [FixtureController::class, 'resetFixtures']);
Route::delete('/auction/{auction_id}/fixture/{fixture_id}', [FixtureController::class, 'deleteFixture']);

Route::get('/auctions/upcoming', [AuctionController::class, 'upcomingAuctions']);

/*----------------------------------------------------------------------------------------------------------------*/


