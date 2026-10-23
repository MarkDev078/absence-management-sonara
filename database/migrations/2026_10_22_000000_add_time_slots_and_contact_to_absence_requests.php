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
        Schema::table('absence_requests', function (Blueprint $table) {
            $table->enum('start_time_slot', ['matin-P', 'soir-P', 'matin-Q', 'apres-midi-Q', 'nuit-Q'])->nullable()->after('start_date');
            $table->enum('end_time_slot', ['matin-P', 'soir-P', 'matin-Q', 'apres-midi-Q', 'nuit-Q'])->nullable()->after('end_date');
            $table->string('contact_phone')->nullable()->after('reason');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('absence_requests', function (Blueprint $table) {
            $table->dropColumn(['start_time_slot', 'end_time_slot', 'contact_phone']);
        });
    }
};
