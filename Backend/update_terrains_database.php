<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Configuration de la base de données
$capsule = new Capsule;

$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => 'localhost',
    'database'  => 'terrains_synthetiques',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Nouvelles données des terrains
$nouveauxTerrains = [
    [
        'nom' => 'Temple du Foot',
        'adresse' => 'Dakar',
        'prix_heure' => 42500,
        'capacite' => 'Anfield, Camp Nou (salle), Old Trafford - 6x6, 5x5',
        'description' => 'Complexe avec 3 terrains : Anfield, Camp Nou (salle), Old Trafford. Réservation par Wave. Heures creuses (10h-18h) et pleines (18h-23h).',
        'telephone' => '+221 773238787',
        'horaires' => '10:00-23:00',
        'latitude' => 14.6868,
        'longitude' => -17.4547,
        'commune' => 'Dakar',
        'statut' => 'actif'
    ],
    [
        'nom' => 'Terrain École Police',
        'adresse' => 'École de Police, Dakar',
        'prix_heure' => 125000,
        'capacite' => '11x11',
        'description' => 'Terrain de football de l\'École de Police',
        'telephone' => '+221 77 901 23 45',
        'horaires' => '08:00-22:00',
        'latitude' => 14.7020,
        'longitude' => -17.4654,
        'commune' => 'École Police',
        'statut' => 'actif'
    ],
    [
        'nom' => 'Terrain Sacré Cœur',
        'adresse' => 'Sacré Cœur, Dakar',
        'prix_heure' => 27500,
        'capacite' => '11x11, 10x10, 8x8, 5x5',
        'description' => 'Centre de loisirs avec terrains de football. Tarifs : 5x5 (15,000f), 8x8 (30,000f), 10x10 (50,000f), 11x11 (60,000f)',
        'telephone' => '+221 780130725',
        'horaires' => '08:00-18:00',
        'latitude' => 14.7136,
        'longitude' => -17.4635,
        'commune' => 'Sacré Cœur',
        'statut' => 'actif'
    ],
    [
        'nom' => 'Terrain Thia',
        'adresse' => 'Dakar',
        'prix_heure' => 20000,
        'capacite' => '8x8, 5x5',
        'description' => 'Terrain de football Thia',
        'telephone' => '+221 77 012 34 56',
        'horaires' => '08:00-22:00',
        'latitude' => 14.7148,
        'longitude' => -17.4637,
        'commune' => 'Dakar',
        'statut' => 'actif'
    ]
];

// Mise à jour des terrains existants
$terrainsAMettreAJour = [
    'Complexe Be Sport' => ['prix_heure' => 45000],
    'Fara Foot' => ['prix_heure' => 35000],
    'Fit Park Academy' => ['prix_heure' => 80000],
    'Sowfoot' => ['prix_heure' => 27500],
    'Stade Deggo' => ['prix_heure' => 22500],
    'Terrain ASC Jaraaf' => ['prix_heure' => 16500]
];

echo "=== Mise à jour de la base de données des terrains ===\n\n";

// Ajouter les nouveaux terrains
foreach ($nouveauxTerrains as $terrain) {
    $existe = Capsule::table('terrains')->where('nom', $terrain['nom'])->exists();
    
    if (!$existe) {
        Capsule::table('terrains')->insert([
            'nom' => $terrain['nom'],
            'adresse' => $terrain['adresse'],
            'prix_heure' => $terrain['prix_heure'],
            'capacite' => $terrain['capacite'],
            'description' => $terrain['description'],
            'telephone' => $terrain['telephone'],
            'horaires' => $terrain['horaires'],
            'latitude' => $terrain['latitude'],
            'longitude' => $terrain['longitude'],
            'commune' => $terrain['commune'],
            'statut' => $terrain['statut'],
            'created_at' => now(),
            'updated_at' => now()
        ]);
        echo "✓ Ajouté : {$terrain['nom']}\n";
    } else {
        echo "- Déjà présent : {$terrain['nom']}\n";
    }
}

// Mettre à jour les terrains existants
foreach ($terrainsAMettreAJour as $nom => $modifications) {
    $updated = Capsule::table('terrains')
        ->where('nom', $nom)
        ->update($modifications + ['updated_at' => now()]);
    
    if ($updated > 0) {
        echo "✓ Mis à jour : {$nom}\n";
    } else {
        echo "- Non trouvé : {$nom}\n";
    }
}

// Afficher le total
$total = Capsule::table('terrains')->count();
echo "\n=== Résumé ===\n";
echo "Total des terrains dans la base : {$total}\n";
echo "Mise à jour terminée !\n"; 