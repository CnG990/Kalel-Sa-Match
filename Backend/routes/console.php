<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Export all users to a TXT file in storage/app/users.txt
Artisan::command('users:export-txt', function () {
    $users = User::query()->orderBy('id')->get(['id', 'prenom', 'nom', 'email']);

    if ($users->isEmpty()) {
        $this->warn('Aucun utilisateur trouvé.');
        return;
    }

    $lines = $users->map(function ($user) {
        $fullName = trim(($user->prenom ?? '').' '.($user->nom ?? ''));
        return $user->id.'\t'.$fullName.'\t'.$user->email; // tab-separated
    })->implode("\n");

    // Ensure directory exists and write using an absolute storage path
    $path = storage_path('app/users.txt');
    if (!is_dir(dirname($path))) {
        @mkdir(dirname($path), 0775, true);
    }
    file_put_contents($path, $lines);

    $this->info('Export terminé: '.$path);
})->purpose('Exporter tous les utilisateurs dans un fichier TXT');
