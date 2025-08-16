<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_auctions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->string('auction_code')->unique();  
            $table->string('auction_logo')->nullable();
            $table->string('auction_name');
            $table->string('auction_season');
            $table->date('auction_date');
            $table->time('auction_time');
            $table->integer('points_per_team');
            $table->integer('base_bid');
            $table->integer('bid_increase_by');
            $table->integer('max_players_per_team');
            $table->integer('min_players_per_team');
            $table->timestamps();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};