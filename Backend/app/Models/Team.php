<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_logo', 'team_name', 'team_short_name', 'owner_name', 'owner_contact', 'amount_available', 'details', 'auction_id',
    ];
    
}
