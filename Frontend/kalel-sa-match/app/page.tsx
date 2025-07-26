'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { terrainService, Terrain } from './services/terrain'
import Logo from './components/Logo'

export default function HomePage() {
  // Force Vercel redeploy - API URL updated to localtunnel
  console.log('🚀 Kalel Sa Match - API: https://kalel-sa-match-api.loca.lt/api');
  
  // Force redeploy - Updated API endpoint
  const API_URL = 'https://kalel-sa-match-api.loca.lt/api';
  
  // Force redeploy - Remove old ngrok URL completely
  const OLD_NGROK_URL = 'https://ad07ffba09ee.ngrok-free.app/api'; // DEPRECATED
  
  const [terrains, setTerrains] = useState<Terrain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)
  const [nearbyTerrainsCount, setNearbyTerrainsCount] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Demander la géolocalisation de l'utilisateur
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
            setUserLocation(location)
            console.log('📍 Position utilisateur:', location)
            
            // Chercher les terrains à proximité
            fetchNearbyTerrains(location.latitude, location.longitude)
          },
          (error) => {
            console.log('❌ Erreur géolocalisation:', error)
            // Position par défaut sur Dakar si géolocalisation refusée
            const dakarLocation = { latitude: 14.6928, longitude: -17.4441 }
            setUserLocation(dakarLocation)
            fetchNearbyTerrains(dakarLocation.latitude, dakarLocation.longitude)
          }
        )
      } else {
        // Position par défaut sur Dakar si géolocalisation non supportée
        const dakarLocation = { latitude: 14.6928, longitude: -17.4441 }
        setUserLocation(dakarLocation)
        fetchNearbyTerrains(dakarLocation.latitude, dakarLocation.longitude)
      }
    }

    const fetchTerrains = async () => {
      try {
        setLoading(true)
        setError(null)
        const terreainsData = await terrainService.getAllTerrains({
          // Afficher tous les terrains disponibles
        })
        setTerrains(terreainsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des terrains')
        console.error('Erreur lors du chargement des terrains:', err)
        
        // Données de démonstration en cas d'erreur
        const demoTerrains: Terrain[] = [
          {
            id: 1,
            nom: "Terrain Elite Dakar",
            adresse: "Plateau, Dakar",
            description: "Terrain synthétique de qualité professionnelle",
            latitude: 14.6928,
            longitude: -17.4441,
            prix_heure: 15000,
            type_terrain: "football_11",
            surface: 700,
            eclairage: true,
            vestiaires: true,
            parking: true,
            douches: true,
            etat: "disponible",
            telephone: "+221 77 123 45 67",
            gestionnaire_id: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          },
          {
            id: 2,
            nom: "Stade Municipal",
            adresse: "Médina, Dakar",
            description: "Terrain communautaire accessible",
            latitude: 14.6792,
            longitude: -17.4441,
            prix_heure: 12000,
            type_terrain: "football_7",
            surface: 500,
            eclairage: true,
            vestiaires: true,
            parking: false,
            douches: false,
            etat: "disponible",
            telephone: "+221 77 987 65 43",
            gestionnaire_id: 2,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          },
          {
            id: 3,
            nom: "Complex Sportif Moderne",
            adresse: "Parcelles Assainies, Dakar",
            description: "Installation moderne avec tous équipements",
            latitude: 14.7592,
            longitude: -17.4441,
            prix_heure: 13000,
            type_terrain: "football_11",
            surface: 700,
            eclairage: true,
            vestiaires: true,
            parking: true,
            douches: true,
            etat: "disponible",
            telephone: "+221 77 555 44 33",
            gestionnaire_id: 3,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          },
          {
            id: 4,
            nom: "Terrain de Proximité",
            adresse: "Grand Yoff, Dakar",
            description: "Terrain de quartier accessible à tous",
            latitude: 14.7428,
            longitude: -17.4941,
            prix_heure: 10000,
            type_terrain: "football_5",
            surface: 300,
            eclairage: false,
            vestiaires: true,
            parking: true,
            douches: false,
            etat: "disponible",
            telephone: "+221 77 666 55 44",
            gestionnaire_id: 4,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          },
          {
            id: 5,
            nom: "Centre Sportif Pikine",
            adresse: "Pikine, Dakar",
            description: "Terrain bien entretenu en banlieue",
            latitude: 14.7592,
            longitude: -17.3941,
            prix_heure: 12000,
            type_terrain: "football_7",
            surface: 500,
            eclairage: true,
            vestiaires: true,
            parking: true,
            douches: true,
            etat: "disponible",
            telephone: "+221 77 777 66 55",
            gestionnaire_id: 5,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          },
          {
            id: 6,
            nom: "Stade Premium",
            adresse: "Point E, Dakar",
            description: "Installation haut de gamme",
            latitude: 14.7128,
            longitude: -17.4241,
            prix_heure: 15000,
            type_terrain: "football_11",
            surface: 700,
            eclairage: true,
            vestiaires: true,
            parking: true,
            douches: true,
            etat: "disponible",
            telephone: "+221 77 888 77 66",
            gestionnaire_id: 6,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          }
        ]
        setTerrains(demoTerrains)
        setError(null) // Réinitialiser l'erreur car on a des données de démonstration
      } finally {
        setLoading(false)
      }
    }

    const fetchNearbyTerrains = async (latitude: number, longitude: number) => {
      try {
        console.log('🔍 Recherche terrains à proximité...', { latitude, longitude })
        const nearbyTerrains = await terrainService.searchNearbyTerrains(latitude, longitude, 10) // 10km de rayon
        
        // Vérifier que nearbyTerrains est défini et est un tableau
        if (nearbyTerrains && Array.isArray(nearbyTerrains)) {
          setNearbyTerrainsCount(nearbyTerrains.length)
          console.log(`🎯 ${nearbyTerrains.length} terrains trouvés à proximité`)
        } else {
          console.warn('⚠️ Réponse inattendue:', nearbyTerrains)
          // Utiliser le nombre total de terrains comme fallback
          setNearbyTerrainsCount(terrains.length > 0 ? terrains.length : 6)
        }
      } catch (err) {
        console.error('❌ Erreur recherche terrains à proximité:', err)
        // En cas d'erreur, utiliser le nombre total de terrains ou un nombre par défaut
        setNearbyTerrainsCount(terrains.length > 0 ? terrains.length : 6)
      }
    }

    getUserLocation()
    fetchTerrains()
  }, [])

  if (!mounted) {
    return null // Éviter l'erreur d'hydratation
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center group">
              <Logo className="h-12 w-auto transition-transform group-hover:scale-105" />
              <div className="ml-3">
                <span className="text-xl font-bold text-kalel-primary">Kalèl sa</span>
                <span className="text-lg font-semibold text-kalel-secondary ml-1">Match</span>
              </div>
            </Link>
            <div className="flex space-x-4">
              {/* Navigation simplifiée - boutons supprimés */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section simplifiée */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Terrain de football synthétique"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-kalel-primary/80 via-kalel-primary/60 to-transparent"></div>
        </div>

        {/* Contenu Hero simplifié */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-white text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl mb-6">
                Réservez votre terrain de football
                <span className="block text-kalel-accent mt-2">en quelques clics</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Trouvez et réservez les meilleurs terrains synthétiques de Dakar. 
                Simple, rapide et sécurisé avec paiement mobile money.
              </p>
              
              {/* Boutons d'action supprimés pour une interface plus épurée */}

              {/* Statistiques simplifiées */}
              <div className="grid grid-cols-3 gap-6 mt-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-kalel-accent">{terrains.length}</div>
                  <div className="text-sm text-white/80">Terrains</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-kalel-accent">24/7</div>
                  <div className="text-sm text-white/80">Disponible</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-kalel-accent">100%</div>
                  <div className="text-sm text-white/80">Sécurisé</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flèche vers le bas */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Comment ça marche Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <div className="w-24 h-1 bg-gradient-kalel-primary mx-auto mb-6"></div>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Réservez votre terrain de football en 3 étapes simples
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Étape 1 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-kalel-primary to-kalel-primary-dark rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-kalel-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Créez votre compte</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Inscrivez-vous gratuitement en quelques clics. Renseignez vos informations et votre profil sera créé instantanément.
              </p>
              {/* Bouton d'inscription supprimé */}
            </div>

            {/* Étape 2 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-kalel-secondary to-kalel-secondary-dark rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0V7" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-kalel-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Explorez la carte</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Découvrez tous les terrains disponibles près de chez vous grâce à notre carte interactive avec géolocalisation.
              </p>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span>Occupé</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-kalel-primary mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>Votre position</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-kalel-accent to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-kalel-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Réservez et payez</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Choisissez votre créneau, confirmez votre réservation et payez en toute sécurité avec Orange Money ou Wave.
              </p>
              <div className="flex justify-center space-x-4">
                <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-md">
                  <img src="/icons/Orange-Money.svg" alt="Orange Money" className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Orange Money</span>
                </div>
                <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-md">
                  <img src="/icons/wave.svg" alt="Wave" className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Wave</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action final */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-kalel-primary to-kalel-secondary rounded-2xl p-8 text-white max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">Prêt à commencer ?</h3>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez des milliers de joueurs qui font confiance à Kalèl sa Match
              </p>
              {/* Boutons d'action supprimés pour une interface épurée */}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Pourquoi choisir Kalèl sa Match ?
            </h2>
            <div className="w-24 h-1 bg-gradient-kalel-primary mx-auto"></div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-kalel-primary text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Réservation rapide</h3>
              <p className="text-gray-600">
                Réservez votre terrain en quelques clics. Interface simple et intuitive.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-kalel-secondary text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Paiement sécurisé</h3>
              <p className="text-gray-600">
                Paiement mobile money (Orange Money, Wave) et cartes bancaires acceptés.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-kalel-accent text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Partout à Dakar</h3>
              <p className="text-gray-600">
                Terrains dans tous les quartiers de Dakar. Trouvez le plus proche de vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Logo className="h-10 w-auto" />
              <div className="ml-3">
                <span className="text-2xl font-bold text-white">Kalèl sa</span>
                <span className="text-xl font-semibold text-kalel-secondary ml-1">Match</span>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              La plateforme de référence pour la réservation de terrains de football à Dakar
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                À propos
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Confidentialité
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Conditions
              </Link>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                © 2025 Kalèl sa Match. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
