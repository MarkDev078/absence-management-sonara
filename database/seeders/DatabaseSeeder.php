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
            'phone' => '+237 6 91 00 00 01',
            'first_name' => 'Admin',
            'last_name' => 'Système',
            'date_naissance' => '1980-01-15',
            'lieu_naissance' => 'Douala',
            'role' => 'admin',
            'department_id' => $production->id,
        ]);

        $rh = User::factory()->create([
            'email' => 'rh@example.com',
            'matricule' => 100002,
            'phone' => '+237 6 91 00 00 02',
            'first_name' => 'RH',
            'last_name' => 'Département',
            'date_naissance' => '1985-06-20',
            'lieu_naissance' => 'Yaoundé',
            'role' => 'rh',
            'department_id' => $maintenance->id,
        ]);

        $manager = User::factory()->create([
            'email' => 'manager@example.com',
            'matricule' => 100003,
            'phone' => '+237 6 91 00 00 03',
            'first_name' => 'Marie',
            'last_name' => 'Manager',
            'date_naissance' => '1978-03-10',
            'lieu_naissance' => 'Bafoussam',
            'role' => 'manager',
            'department_id' => $atelierA->id,
        ]);

        $employee1 = User::factory()->create([
            'email' => 'employe1@example.com',
            'matricule' => 100004,
            'phone' => '+237 6 91 00 00 04',
            'first_name' => 'Jean',
            'last_name' => 'Employé',
            'date_naissance' => '1990-09-05',
            'lieu_naissance' => 'Garoua',
            'role' => 'employee',
            'department_id' => $atelierA->id,
            'manager_id' => $manager->id,
        ]);

        $employee2 = User::factory()->create([
            'email' => 'employe2@example.com',
            'matricule' => 100005,
            'phone' => '+237 6 91 00 00 05',
            'first_name' => 'Sophie',
            'last_name' => 'Employée',
            'date_naissance' => '1992-11-25',
            'lieu_naissance' => 'Ngaoundéré',
            'role' => 'employee',
            'department_id' => $electricite->id,
            'manager_id' => $manager->id,
        ]);
    }
}
