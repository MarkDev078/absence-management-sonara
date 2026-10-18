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
        Schema::create('return_to_work', function (Blueprint $table) {
            $table->id();
            $table->foreignId('absence_request_id')->constrained('absence_requests')->onDelete('cascade');
            $table->date('planned_return_date');
            $table->date('actual_return_date')->nullable();
            $table->boolean('medical_visit_required')->default(false);
            $table->date('medical_visit_date')->nullable();
            $table->text('medical_visit_comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('return_to_work');
    }
};