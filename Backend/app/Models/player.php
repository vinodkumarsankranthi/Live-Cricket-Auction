<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'mobile', 'age', 'jersey_name', 'jersey_number', 
        'jersey_style', 'jersey_size', 'batting_style', 'bowling_style', 
        'playing_style', 'base_price', 'image', 'auction_id',     'team_id',          
        'sold_price',      
        'is_sold', 'sold_status',

    ];
    public function team()
{
    return $this->belongsTo(Team::class);
    return $this->belongsTo(Team::class, 'sold_team_id');
}
}

