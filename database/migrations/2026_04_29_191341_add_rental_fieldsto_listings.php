<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRentalFieldsToListings extends Migration
{
    public function up()
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->boolean('rented')->default(false);
            $table->unsignedBigInteger('renter_id')->nullable()->index();
            $table->timestamp('rented_at')->nullable();
            $table->integer('rented_days')->nullable();
        });
    }

    public function down()
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['rented', 'renter_id', 'rented_at', 'rented_days']);
        });
    }
}