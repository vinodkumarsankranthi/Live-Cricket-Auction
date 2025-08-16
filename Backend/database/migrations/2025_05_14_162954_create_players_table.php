<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlayersTable extends Migration
{
    public function up()
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('auction_id');
            $table->unsignedBigInteger('team_id')->nullable();
            $table->string('name');
            $table->string('mobile')->nullable();
            $table->integer('age')->nullable();
            $table->string('jersey_name')->nullable();
            $table->string('jersey_number')->nullable();
            $table->string('jersey_style')->nullable();
            $table->string('jersey_size')->nullable();
            $table->string('batting_style')->nullable();
            $table->string('bowling_style')->nullable();
            $table->string('playing_style')->nullable();
            $table->decimal('base_price', 8, 2)->nullable();
            $table->integer('sold_price')->nullable();
            $table->boolean('is_sold')->default(0);
            $table->string('sold_status')->nullable(); // 'sold' or 'unsold'
            $table->unsignedBigInteger('sold_team_id')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('team_id')->references('id')->on('teams')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('players');
    }
}
