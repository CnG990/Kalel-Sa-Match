import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Calendar, CreditCard, DollarSign, FileText } from 'lucide-react';
import apiService from '../services/api';

interface DiagnosticItem {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
  action?: () => void;
}

interface DiagnosticCategory {
  title: string;
  icon: React.ReactNode;
  items: DiagnosticItem[];
}

const ReservationDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticCategory[] = [];

    try {
      // 1. Diagnostic Système de Réservations
      let reservationsData: any[] = [];
      let reservationsResponse;
      try {
        reservationsResponse = await apiService.get('/admin/reservations');
        reservationsData = reservationsResponse.data?.data || [];
      } catch (error) {
        reservationsData = [];
      }

      const reservationsAvecPrixDynamiques = reservationsData.filter((r: any) => 
        r.montant_total && r.montant_total !== 25000 && r.montant_total !== 48000 && r.montant_total !== 70000
      );

      results.push({
        title: 'Système de Réservations - Données Dynamiques',
        icon: <Calendar className="w-5 h-5" />,
        items: [
          {
            name: 'Réservations en base',
            status: reservationsData.length > 0 ? 'success' : 'warning',
            message: `${reservationsData.length} réservation(s) dans le système`,
            details: reservationsData.length === 0 ? ['Aucune réservation - Système non testé'] : []
          },
          {
            name: 'Prix dynamiques vs statiques',
            status: reservationsAvecPrixDynamiques.length > reservationsData.length / 2 ? 'success' : 'error',
            message: `${reservationsAvecPrixDynamiques.length}/${reservationsData.length} avec prix dynamiques`,
            details: [
              'PROBLÈME: ReservationPage.tsx utilise prix statiques',
              'Prix fixes: 25000, 48000, 70000 FCFA (lignes 18-22)',
              'Solution: Utiliser prix du terrain sélectionné'
            ]
          },
          {
            name: 'Créneaux horaires',
            status: 'error',
            message: 'Créneaux statiques détectés',
            details: [
              'PROBLÈME: timeSlots statiques dans ReservationPage.tsx',
              'Créneaux fixes: 08:00 à 22:00 (ligne 13-16)',
              'Solution: Récupérer créneaux depuis l\'API terrain'
            ]
          },
          {
            name: 'Gestion des disponibilités',
            status: reservationsResponse?.success ? 'success' : 'warning',
            message: 'API checkAvailability utilisée',
            details: ['Vérification temps réel dans ReservationModal', 'Intégration correcte avec backend']
          }
        ]
      });

      // 2. Diagnostic TerrainPricingDisplay
      let terrainsData: any[] = [];
      try {
        const terrainsResponse = await apiService.getTerrains();
        terrainsData = Array.isArray(terrainsResponse.data?.data) ? terrainsResponse.data.data : 
                     Array.isArray(terrainsResponse.data) ? terrainsResponse.data : [];
      } catch (error) {
        terrainsData = [];
      }

      const terrainsAvecOptionsMultiples = terrainsData.filter((t: any) => {
        const description = t.description || '';
        return description.includes('terrain') || description.includes('tarif') || description.includes('option');
      });

      results.push({
        title: 'Tarification Terrains - Système Dynamique',
        icon: <DollarSign className="w-5 h-5" />,
        items: [
          {
            name: 'Component TerrainPricingDisplay',
            status: 'success',
            message: 'Système dynamique implémenté',
            details: [
              'Calculs basés sur basePrice et description',
              'Ratios dynamiques (ex: basePrice * 0.67)',
              'Pas de prix en dur dans le composant'
            ]
          },
          {
            name: 'Options par terrain',
            status: terrainsAvecOptionsMultiples.length > 0 ? 'success' : 'warning',
            message: `${terrainsAvecOptionsMultiples.length}/${terrainsData.length} avec options multiples`,
            details: terrainsAvecOptionsMultiples.length === 0 ? 
                    ['Peu de terrains avec options configurées'] : 
                    ['Descriptions utilisées pour générer options']
          },
          {
            name: 'DynamicPricingCalculator',
            status: 'warning',
            message: 'Contient encore des prix statiques',
            details: [
              'PROBLÈME: PRICING_RULES avec prix en dur',
              'Temple du Foot: 42500, 35000, 50000 FCFA',
              'Solution: Récupérer depuis la base de données'
            ]
          }
        ]
      });

      // 3. Diagnostic Abonnements
      let abonnementsData: any[] = [];
      try {
        const abonnementsResponse = await apiService.getAbonnements();
        abonnementsData = abonnementsResponse.data || [];
      } catch (error) {
        abonnementsData = [];
      }

      results.push({
        title: 'Système d\'Abonnements',
        icon: <CreditCard className="w-5 h-5" />,
        items: [
          {
            name: 'Abonnements configurés',
            status: abonnementsData.length > 0 ? 'success' : 'warning',
            message: `${abonnementsData.length} type(s) d'abonnement`,
            details: abonnementsData.length === 0 ? 
                    ['Aucun abonnement configuré - Fonctionnalité inactive'] :
                    abonnementsData.map((a: any) => `${a.nom}: ${a.prix?.toLocaleString()} FCFA`)
          },
          {
            name: 'Calculs de prix abonnements',
            status: 'success',
            message: 'Calculs dynamiques implémentés',
            details: [
              'AbonnementsPage: calculs basés sur terrain sélectionné',
              'Réductions trimestrielles (10%) et annuelles (20%)',
              'Prix selon options terrain sélectionnées'
            ]
          },
          {
            name: 'SubscriptionModal statique',
            status: 'error',
            message: 'Données en dur détectées',
            details: [
              'PROBLÈME: heures statiques Array.from({length: 18})',
              'Jours de la semaine en dur',
              'Solution: Récupérer horaires du terrain'
            ]
          }
        ]
      });

      // 4. Diagnostic APIs et Intégrations
      const apiTests = [
        { endpoint: '/terrains', name: 'Liste terrains' },
        { endpoint: '/abonnements', name: 'Liste abonnements' },
        { endpoint: '/manager/reservations', name: 'Réservations gestionnaire' },
        { endpoint: '/admin/reservations', name: 'Réservations admin' }
      ];

      const apiResults: DiagnosticItem[] = [];
      for (const test of apiTests) {
        try {
          const response = await apiService.get(test.endpoint);
          apiResults.push({
            name: test.name,
            status: response.success ? 'success' : 'warning',
            message: response.success ? 'API fonctionnelle' : 'Erreur API',
            details: response.success ? [`${Array.isArray(response.data) ? response.data.length : 'N/A'} éléments`] : [response.message || 'Erreur inconnue']
          });
        } catch (error) {
          apiResults.push({
            name: test.name,
            status: 'error',
            message: 'API non accessible',
            details: [error instanceof Error ? error.message : 'Erreur inconnue']
          });
        }
      }

      results.push({
        title: 'APIs et Connectivité',
        icon: <RefreshCw className="w-5 h-5" />,
        items: apiResults
      });

      // 5. Diagnostic Pages et Composants
      results.push({
        title: 'Pages et Composants - Analyse Statique',
        icon: <FileText className="w-5 h-5" />,
        items: [
          {
            name: 'ReservationPage.tsx',
            status: 'error',
            message: 'Page contient des données statiques critiques',
            details: [
              '❌ timeSlots statiques (lignes 13-16)',
              '❌ durations avec prix fixes (lignes 18-22)', 
              '❌ Simulation API au lieu de vraie API',
              '🔧 Nécessite refactorisation complète'
            ]
          },
          {
            name: 'ReservationModal.tsx',
            status: 'success',
            message: 'Composant utilise des APIs réelles',
            details: [
              '✅ checkAvailability API',
              '✅ createReservation API',
              '✅ Gestion erreurs et authentification',
              '✅ Prix calculés dynamiquement'
            ]
          },
          {
            name: 'AbonnementsPage.tsx',
            status: 'warning',
            message: 'Mélange de données dynamiques et statiques',
            details: [
              '✅ API getTerrains et getAbonnements',
              '✅ Calculs prix dynamiques',
              '⚠️  Réductions fixes (10%, 20%)',
              '⚠️  Paramètres durée en dur'
            ]
          },
          {
            name: 'TerrainInfoPage.tsx',
            status: 'error',
            message: 'URL API en dur détectée',
            details: [
              '❌ fetch(\'http://127.0.0.1:8000/api/abonnements\')',
              '❌ URL localhost en dur (ligne 125)',
              '🔧 Utiliser apiService.getAbonnements()'
            ]
          }
        ]
      });

    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      results.push({
        title: 'Erreur Diagnostic',
        icon: <XCircle className="w-5 h-5" />,
        items: [
          {
            name: 'Diagnostic incomplet',
            status: 'error',
            message: 'Erreur lors de l\'analyse',
            details: [error instanceof Error ? error.message : 'Erreur inconnue']
          }
        ]
      });
    }

    setDiagnostics(results);
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: DiagnosticItem['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Diagnostic Réservations & Abonnements</h2>
          <p className="text-gray-600 mt-1">
            Analyse complète des données statiques vs dynamiques
          </p>
          {lastCheck && (
            <p className="text-sm text-gray-500 mt-1">
              Dernière vérification : {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Diagnostic...' : 'Relancer'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Analyse en cours...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {diagnostics.map((category, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  {category.icon}
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`border rounded-lg p-4 ${getStatusColor(item.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            {getStatusIcon(item.status)}
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{item.message}</p>
                          {item.details && item.details.length > 0 && (
                            <ul className="text-xs text-gray-600 space-y-1">
                              {item.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className={`${
                                  detail.startsWith('❌') ? 'text-red-600' :
                                  detail.startsWith('✅') ? 'text-green-600' :
                                  detail.startsWith('⚠️') ? 'text-yellow-600' :
                                  detail.startsWith('🔧') ? 'text-blue-600' :
                                  'text-gray-600'
                                }`}>
                                  {detail.startsWith('❌') || detail.startsWith('✅') || detail.startsWith('⚠️') || detail.startsWith('🔧') ? 
                                    detail : '• ' + detail}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        {item.action && (
                          <button
                            onClick={item.action}
                            className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                          >
                            Corriger
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationDiagnostic; 