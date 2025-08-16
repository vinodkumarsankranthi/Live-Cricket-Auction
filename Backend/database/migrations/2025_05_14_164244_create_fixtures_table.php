<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
Schema::create('fixtures', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('auction_id');
    $table->unsignedBigInteger('team1_id');
    $table->unsignedBigInteger('team2_id');
    $table->date('date');
    $table->time('time');
    $table->string('venue');
    $table->integer('overs')->nullable();
    $table->string('fixture_type')->nullable();
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixtures');
    }
};