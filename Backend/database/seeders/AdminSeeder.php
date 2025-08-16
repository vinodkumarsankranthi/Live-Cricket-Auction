<?php

// database/seeders/AdminSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'livecricketauction@gmail.com'], // admin email
            [
                'name' => 'vinod kumar',
                'phone' => '8861691980',
                'password' => Hash::make('Vinod@123'), // secure this in production
                'role' => 'admin',
                'plan' => 'premium_Plus' // optional
            ]
        );
    }
}

