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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('employee')->after('password');
            $table->string('matricule')->unique()->nullable()->after('role');
            $table->string('first_name')->nullable()->after('matricule');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('position')->nullable()->after('last_name');
            $table->string('department')->nullable()->after('position');
            $table->enum('status', ['actif', 'inactif', 'conge', 'suspendu'])->default('actif')->after('department');
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['manager_id']);
            $table->dropColumn(['role', 'matricule', 'first_name', 'last_name', 'position', 'department', 'status', 'manager_id']);
        });
    }
};
