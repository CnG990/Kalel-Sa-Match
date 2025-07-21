<?php

echo "=== RECHERCHE NOMS OFFICIELS DES TERRAINS ===\n\n";

// Terrains à vérifier
$terrains_a_verifier = [
    'Terrain Yoff' => [
        'nom_actuel' => 'Terrain Yoff',
        'adresse' => 'Yoff Virage',
        'fichier_kml' => 'Stade Iba Mar Diop.kml',
        'nom_alternatif' => 'Stade Iba Mar Diop'
    ],
    'Stade de Pikine' => [
        'nom_actuel' => 'Stade de Pikine',
        'adresse' => 'Pikine',
        'fichier_kml' => 'Terrain mini foot Premier Projets Aréna.kml',
        'nom_alternatif' => 'Terrain mini foot Premier Projets Aréna'
    ],
    'Terrain Ouakam' => [
        'nom_actuel' => 'Terrain Ouakam',
        'adresse' => 'Ouakam',
        'fichier_kml' => 'Terrain ASC Liberté 6.kml',
        'nom_alternatif' => 'Terrain ASC Liberté 6'
    ],
    'Complexe HLM' => [
        'nom_actuel' => 'Complexe HLM',
        'adresse' => 'HLM Grand Yoff',
        'fichier_kml' => 'TENNIS Mini Foot Squash.kml',
        'nom_alternatif' => 'TENNIS Mini Foot Squash'
    ]
];

echo "📋 TERRAINS À VÉRIFIER :\n";
echo "========================\n\n";

foreach ($terrains_a_verifier as $key => $terrain) {
    echo "🏟️  {$key}\n";
    echo "   Nom actuel : {$terrain['nom_actuel']}\n";
    echo "   Adresse : {$terrain['adresse']}\n";
    echo "   Fichier KML : {$terrain['fichier_kml']}\n";
    echo "   Nom alternatif possible : {$terrain['nom_alternatif']}\n";
    echo "\n";
}

echo "🔍 RECHERCHE WEB RECOMMANDÉE :\n";
echo "==============================\n\n";

echo "1. **Terrain Yoff** :\n";
echo "   - Rechercher : 'Stade Iba Mar Diop Yoff Dakar'\n";
echo "   - Vérifier si c'est le même terrain que 'Terrain Yoff'\n\n";

echo "2. **Stade de Pikine** :\n";
echo "   - Rechercher : 'Terrain mini foot Premier Projets Aréna Pikine'\n";
echo "   - Vérifier le nom officiel du stade de Pikine\n\n";

echo "3. **Terrain Ouakam** :\n";
echo "   - Rechercher : 'Terrain ASC Liberté 6 Ouakam'\n";
echo "   - Vérifier s'il y a un terrain officiel à Ouakam\n\n";

echo "4. **Complexe HLM** :\n";
echo "   - Rechercher : 'TENNIS Mini Foot Squash HLM Dakar'\n";
echo "   - Vérifier le nom officiel du complexe HLM\n\n";

echo "📝 NOTES :\n";
echo "==========\n";
echo "- Les noms de fichiers KML peuvent être différents des noms officiels\n";
echo "- Certains terrains peuvent avoir plusieurs noms selon les sources\n";
echo "- Il faut vérifier sur Google Maps, sites officiels, et réseaux sociaux\n";
echo "- Les noms peuvent varier selon le contexte (sportif vs administratif)\n\n";

echo "✅ RECOMMANDATIONS :\n";
echo "===================\n";
echo "1. Vérifier chaque terrain sur Google Maps\n";
echo "2. Rechercher les sites officiels des clubs/associations\n";
echo "3. Consulter les pages Facebook/Instagram des terrains\n";
echo "4. Vérifier les annonces de réservation en ligne\n";
echo "5. Contacter directement les gestionnaires si possible\n\n"; 