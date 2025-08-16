<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'auction_code',
        'auction_logo',
        'auction_name',
        'auction_season',
        'auction_date',
        'auction_time',
        'points_per_team',
        'base_bid',
        'bid_increase_by',
        'max_players_per_team',
        'min_players_per_team',
    ];
    public function user()
{
    return $this->belongsTo(User::class);
}

}

