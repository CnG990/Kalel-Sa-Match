import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Download, Mail, AlertCircle, CheckCircle, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');

  const sections = [
    { id: 'collecte', title: 'Collecte des données', icon: Database },
    { id: 'utilisation', title: 'Utilisation', icon: Settings },
    { id: 'partage', title: 'Partage et transfert', icon: Users },
    { id: 'conservation', title: 'Conservation', icon: Lock },
    { id: 'droits', title: 'Vos droits', icon: UserCheck },
    { id: 'securite', title: 'Sécurité', icon: Shield },
    { id: 'cookies', title: 'Cookies', icon: Eye },
    { id: 'contact', title: 'Contact', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Politique de Confidentialité</h1>
              <p className="text-gray-600 mt-1">Protection de vos données personnelles - Conforme RGPD</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Sommaire</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Introduction */}
            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold mb-2">Votre vie privée est notre priorité</h2>
                  <p className="text-indigo-100 mb-4">
                    Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons 
                    vos données personnelles dans le respect du RGPD et de la loi sénégalaise sur la protection des données.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle className="w-4 h-4" />
                    <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Identité du responsable */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                Responsable du traitement
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Société</h4>
                    <p className="text-gray-700">Terrains Synthétiques Dakar</p>
                    <p className="text-gray-600 text-sm">NINEA : XXXXXXXXXX</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact DPO</h4>
                    <p className="text-gray-700">dpo@terrains-dakar.sn</p>
                    <p className="text-gray-600 text-sm">Délégué à la Protection des Données</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 1 - Collecte */}
            <section id="collecte" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-green-600" />
                1. Données que nous collectons
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-3">📋 Données d'inscription</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Nom et prénom</li>
                      <li>• Adresse email</li>
                      <li>• Numéro de téléphone</li>
                      <li>• Date de naissance</li>
                      <li>• Mot de passe (chiffré)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-3">🏃 Données d'utilisation</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Historique des réservations</li>
                      <li>• Préférences de terrains</li>
                      <li>• Évaluations et commentaires</li>
                      <li>• Données de paiement</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-3">📱 Données techniques</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Adresse IP</li>
                      <li>• Type de navigateur</li>
                      <li>• Système d'exploitation</li>
                      <li>• Pages visitées</li>
                      <li>• Données de géolocalisation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-3">💬 Données de communication</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Messages du support client</li>
                      <li>• Réclamations et signalements</li>
                      <li>• Correspondances email</li>
                      <li>• Appels téléphoniques</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-2">Données sensibles</h4>
                      <p className="text-amber-700 text-sm">
                        Nous ne collectons aucune donnée sensible (origine raciale, opinions politiques, 
                        données de santé, etc.) sauf si vous nous les communiquez volontairement.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 - Utilisation */}
            <section id="utilisation" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                2. Comment nous utilisons vos données
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">🎯 Finalités principales</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Gestion de votre compte utilisateur</li>
                      <li>• Traitement des réservations</li>
                      <li>• Facturation et paiements</li>
                      <li>• Service client et support</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Base légale : Contrat
                    </span>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">📊 Amélioration des services</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Analyse d'utilisation</li>
                      <li>• Personnalisation de l'expérience</li>
                      <li>• Recommandations de terrains</li>
                      <li>• Développement de nouvelles fonctionnalités</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Base légale : Intérêt légitime
                    </span>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">📧 Communication marketing</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Newsletter et actualités</li>
                      <li>• Offres promotionnelles</li>
                      <li>• Événements et tournois</li>
                      <li>• Sondages de satisfaction</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Base légale : Consentement
                    </span>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">⚖️ Obligations légales</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Comptabilité et fiscalité</li>
                      <li>• Lutte contre la fraude</li>
                      <li>• Réponse aux autorités</li>
                      <li>• Archivage légal</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Base légale : Obligation légale
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 - Partage */}
            <section id="partage" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                3. Partage et transfert de données
              </h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">🚫 Principe général</h4>
                  <p className="text-red-700 text-sm">
                    Nous ne vendons jamais vos données personnelles à des tiers. 
                    Le partage est limité aux cas listés ci-dessous.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">🏟️ Gestionnaires de terrains</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Informations nécessaires pour les réservations :
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Nom et téléphone</li>
                      <li>• Détails de la réservation</li>
                      <li>• Statut de paiement</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">💳 Prestataires de paiement</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Données de transaction sécurisées :
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Identité et contact</li>
                      <li>• Informations de paiement</li>
                      <li>• Montant et date</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">🔧 Prestataires techniques</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Services d'hébergement et maintenance :
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Hébergement web</li>
                      <li>• Service d'emailing</li>
                      <li>• Outils d'analyse</li>
                    </ul>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">⚖️ Autorités légales</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Seulement en cas d'obligation légale :
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Enquêtes judiciaires</li>
                      <li>• Contrôles fiscaux</li>
                      <li>• Réquisitions légales</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 - Conservation */}
            <section id="conservation" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-orange-600" />
                4. Durée de conservation
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Type de données</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Durée active</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Archivage</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Compte utilisateur</td>
                      <td className="border border-gray-300 px-4 py-2">3 ans après dernière connexion</td>
                      <td className="border border-gray-300 px-4 py-2">-</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Données de réservation</td>
                      <td className="border border-gray-300 px-4 py-2">5 ans après la réservation</td>
                      <td className="border border-gray-300 px-4 py-2">5 ans supplémentaires</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Données de paiement</td>
                      <td className="border border-gray-300 px-4 py-2">13 mois après transaction</td>
                      <td className="border border-gray-300 px-4 py-2">10 ans (comptabilité)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Logs de connexion</td>
                      <td className="border border-gray-300 px-4 py-2">12 mois</td>
                      <td className="border border-gray-300 px-4 py-2">-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Support client</td>
                      <td className="border border-gray-300 px-4 py-2">3 ans après résolution</td>
                      <td className="border border-gray-300 px-4 py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5 - Droits */}
            <section id="droits" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-indigo-600" />
                5. Vos droits sur vos données
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h4 className="font-medium text-indigo-800 mb-2">👁️ Droit d'accès</h4>
                  <p className="text-sm text-indigo-700">
                    Obtenez une copie de toutes vos données personnelles que nous détenons.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✏️ Droit de rectification</h4>
                  <p className="text-sm text-green-700">
                    Corrigez ou mettez à jour vos informations personnelles inexactes.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">🗑️ Droit à l'effacement</h4>
                  <p className="text-sm text-red-700">
                    Demandez la suppression de vos données sous certaines conditions.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2">⏸️ Droit à la limitation</h4>
                  <p className="text-sm text-purple-700">
                    Limitez le traitement de vos données dans certains cas.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">📤 Droit à la portabilité</h4>
                  <p className="text-sm text-blue-700">
                    Récupérez vos données dans un format structuré et lisible.
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">🚫 Droit d'opposition</h4>
                  <p className="text-sm text-orange-700">
                    Opposez-vous au traitement pour motifs légitimes ou marketing.
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Comment exercer vos droits ?</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>1. Connectez-vous à votre compte et accédez aux paramètres</p>
                  <p>2. Contactez notre DPO : <strong>dpo@terrains-dakar.sn</strong></p>
                  <p>3. Envoyez un courrier postal avec justificatif d'identité</p>
                  <p className="text-indigo-600 font-medium">⏱️ Délai de réponse : 1 mois maximum</p>
                </div>
              </div>
            </section>

            {/* Section 6 - Sécurité */}
            <section id="securite" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                6. Sécurité de vos données
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">🔒 Mesures techniques</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Chiffrement SSL/TLS pour toutes les communications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Hashage des mots de passe avec bcrypt
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Firewall et protection anti-intrusion
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Sauvegardes chiffrées quotidiennes
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">👥 Mesures organisationnelles</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Accès limité selon le principe du moindre privilège
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Formation du personnel à la protection des données
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Audits de sécurité réguliers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Procédures de gestion des incidents
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 mb-2">En cas de violation de données</h4>
                    <p className="text-amber-700 text-sm">
                      Nous nous engageons à notifier la CNIL dans les 72 heures et à vous informer 
                      si vos données sont concernées par une violation à haut risque.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7 - Cookies */}
            <section id="cookies" className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-purple-600" />
                7. Cookies et technologies similaires
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">🍪 Cookies essentiels</h4>
                    <p className="text-sm text-green-700 mb-2">Nécessaires au fonctionnement</p>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• Session utilisateur</li>
                      <li>• Panier de réservation</li>
                      <li>• Préférences de sécurité</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Obligatoires
                    </span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📊 Cookies analytiques</h4>
                    <p className="text-sm text-blue-700 mb-2">Mesure d'audience anonyme</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• Google Analytics</li>
                      <li>• Statistiques de visite</li>
                      <li>• Performance technique</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Avec consentement
                    </span>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-800 mb-2">🎯 Cookies marketing</h4>
                    <p className="text-sm text-purple-700 mb-2">Publicité personnalisée</p>
                    <ul className="text-xs text-purple-600 space-y-1">
                      <li>• Réseaux sociaux</li>
                      <li>• Publicité ciblée</li>
                      <li>• Retargeting</li>
                    </ul>
                    <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Avec consentement
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">⚙️ Gestion de vos préférences</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Vous pouvez modifier vos choix à tout moment via :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                      Paramètres des cookies
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
                      Paramètres du navigateur
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 - Contact */}
            <section id="contact" className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl text-white p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" />
                8. Nous contacter
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">📧 Délégué à la Protection des Données</h4>
                  <div className="text-indigo-100 text-sm space-y-1">
                    <p>Email : <strong>dpo@terrains-dakar.sn</strong></p>
                    <p>Téléphone : +221 XX XXX XX XX</p>
                    <p>Horaires : Lun-Ven 9h-17h</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">🏢 Adresse postale</h4>
                  <div className="text-indigo-100 text-sm">
                    <p>Terrains Synthétiques Dakar</p>
                    <p>À l'attention du DPO</p>
                    <p>Dakar, Sénégal</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-indigo-400">
                <div className="flex items-center justify-between text-sm text-indigo-100">
                  <span>Autorité de contrôle : Commission de l'Informatique et des Libertés (CIL)</span>
                  <span>Version 2.0 - {new Date().getFullYear()}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 