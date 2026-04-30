<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRentalFieldsToMessages extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('type')->default('text')->after('text'); // 'text' | 'rent_request' | 'system'
            $table->unsignedBigInteger('rent_listing_id')->nullable()->index()->after('type');
            $table->integer('rent_days')->nullable()->after('rent_listing_id');
            $table->decimal('rent_total', 10, 2)->nullable()->after('rent_days');
        });
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['type', 'rent_listing_id', 'rent_days', 'rent_total']);
        });
    }
}