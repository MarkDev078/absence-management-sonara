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
            $table->foreignId('current_approver_id')->nullable()->constrained('users')->nullOnDelete()->after('current_approval_level');
            $table->timestamp('rh_acknowledged_at')->nullable()->after('current_approver_id');
            $table->foreignId('rh_acknowledged_by_id')->nullable()->constrained('users')->nullOnDelete()->after('rh_acknowledged_at');
        });

        Schema::table('approvals', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'rejected'])->change();
            $table->enum('kind', ['approve', 'reject'])->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('approvals', function (Blueprint $table) {
            $table->dropColumn(['kind']);
            $table->enum('status', ['approved', 'rejected'])->change();
        });

        Schema::table('absence_requests', function (Blueprint $table) {
            $table->dropForeign(['rh_acknowledged_by_id']);
            $table->dropColumn(['rh_acknowledged_by_id', 'rh_acknowledged_at', 'current_approver_id']);
        });
    }
};
