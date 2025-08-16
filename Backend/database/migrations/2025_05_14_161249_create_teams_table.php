<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('team_logo')->nullable();
            $table->string('team_name');
            $table->string('team_short_name');
            $table->string('owner_name');
            $table->string('owner_contact');
            $table->decimal('amount_available', 12, 2);
            $table->text('details')->nullable();
            $table->unsignedBigInteger('auction_id');
            $table->timestamps();
    
            $table->foreign('auction_id')->references('id')->on('auctions')->onDelete('cascade');
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};