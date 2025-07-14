<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@terrains.com'],
            [
                'name' => 'Administrateur',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'validation_status' => 'approved', // L'admin est approuvé par défaut
                'email_verified_at' => now(),
            ]
        );
    }
} 