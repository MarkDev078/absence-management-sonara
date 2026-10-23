<?php

namespace Database\Seeders;

use App\Models\AbsenceType;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Types d'absence
        AbsenceType::create([
            'label' => 'Congé payé',
            'description' => 'Congés annuels payés',
            'requires_medical_visit' => false,
            'max_duration_days' => 30,
        ]);

        AbsenceType::create([
            'label' => 'Maladie',
            'description' => 'Arrêt de travail pour maladie',
            'requires_medical_visit' => true,
            'max_duration_days' => 5,
        ]);

        AbsenceType::create([
            'label' => 'Congé sans solde',
            'description' => 'Congé non rémunéré',
            'requires_medical_visit' => false,
            'max_duration_days' => 10,
        ]);

        // Départements et services
        $production = Department::create([
            'name' => 'Production',
            'parent_id' => null,
        ]);

        $maintenance = Department::create([
            'name' => 'Maintenance',
            'parent_id' => null,
        ]);

        $atelierA = Department::create([
            'name' => 'Atelier A',
            'parent_id' => $production->id,
        ]);

        $atelierB = Department::create([
            'name' => 'Atelier B',
            'parent_id' => $production->id,
        ]);

        $electricite = Department::create([
            'name' => 'Électricité',
            'parent_id' => $maintenance->id,
        ]);

        // Utilisateurs de test
        $admin = User::factory()->create([
            'email' => 'admin@example.com',
            'matricule' => 100001,
            'first_name' => 'Admin',
            'last_name' => 'Système',
            'role' => 'admin',
            'department_id' => $production->id,
        ]);

        $rh = User::factory()->create([
            'email' => 'rh@example.com',
            'matricule' => 100002,
            'first_name' => 'RH',
            'last_name' => 'Département',
            'role' => 'rh',
            'department_id' => $maintenance->id,
        ]);

        $manager = User::factory()->create([
            'email' => 'manager@example.com',
            'matricule' => 100003,
            'first_name' => 'Marie',
            'last_name' => 'Manager',
            'role' => 'manager',
            'department_id' => $atelierA->id,
        ]);

        $employee1 = User::factory()->create([
            'email' => 'employe1@example.com',
            'matricule' => 100004,
            'first_name' => 'Jean',
            'last_name' => 'Employé',
            'role' => 'employee',
            'department_id' => $atelierA->id,
            'manager_id' => $manager->id,
        ]);

        $employee2 = User::factory()->create([
            'email' => 'employe2@example.com',
            'matricule' => 100005,
            'first_name' => 'Sophie',
            'last_name' => 'Employée',
            'role' => 'employee',
            'department_id' => $electricite->id,
            'manager_id' => $manager->id,
        ]);
    }
}
