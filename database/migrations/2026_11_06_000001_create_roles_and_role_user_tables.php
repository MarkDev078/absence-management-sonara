<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('label');
            $table->timestamps();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->timestamps();

            $table->primary(['user_id', 'role_id']);
        });

        // Migration des données : copier les valeurs actuelles de users.role dans roles + pivot role_user
        $distinctRoles = DB::table('users')
            ->whereNotNull('role')
            ->distinct()
            ->pluck('role');

        foreach ($distinctRoles as $roleName) {
            $roleId = DB::table('roles')->insertGetId([
                'name' => $roleName,
                'label' => ucfirst($roleName),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('role_user')->insert(
                DB::table('users')
                    ->where('role', $roleName)
                    ->get()
                    ->map(fn ($user) => [
                        'user_id' => $user->id,
                        'role_id' => $roleId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])->toArray()
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
    }
};
