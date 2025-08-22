import React from 'react';
import { ArrowLeft, Shield, Users, CreditCard, Clock, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
              <p className="text-gray-600 mt-1">Terrains Synthétiques Dakar - Version 2.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Introduction */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-8">
          <div className="flex items-start gap-4">
            <FileText className="w-8 h-8 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-2">Bienvenue sur notre plateforme</h2>
              <p className="text-orange-100">
                Ces conditions d'utilisation régissent l'accès et l'utilisation de notre plateforme de réservation 
                de terrains synthétiques à Dakar. En utilisant nos services, vous acceptez ces conditions.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-orange-100">
                <CheckCircle className="w-4 h-4" />
                <span>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          
          {/* Section 1 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold">1. Définitions et Champ d'application</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1.1 Définitions</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>La Plateforme :</strong> Site web et application mobile "Terrains Synthétiques Dakar"</li>
                  <li><strong>Utilisateur :</strong> Toute personne physique ou morale utilisant la plateforme</li>
                  <li><strong>Client :</strong> Utilisateur effectuant une réservation</li>
                  <li><strong>Gestionnaire :</strong> Propriétaire ou exploitant d'un terrain partenaire</li>
                  <li><strong>Services :</strong> Ensemble des fonctionnalités de réservation et de gestion</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">1.2 Champ d'application</h4>
                <p>
                  Ces conditions s'appliquent à tous les utilisateurs de la plateforme, sans exception. 
                  Elles prévalent sur toute autre condition générale ou particulière non expressément acceptée par nos soins.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold">2. Inscription et Compte Utilisateur</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2.1 Conditions d'inscription</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Être âgé de 16 ans minimum (autorisation parentale requise pour les mineurs)</li>
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Disposer d'une adresse email valide</li>
                  <li>Accepter les présentes conditions d'utilisation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2.2 Responsabilités de l'utilisateur</h4>
                <p>
                  L'utilisateur s'engage à maintenir la confidentialité de ses identifiants, 
                  informer immédiatement en cas d'utilisation non autorisée de son compte, 
                  et assumer la responsabilité de toutes les activités effectuées sous son compte.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">2.3 Suspension et résiliation</h4>
                <p>
                  Nous nous réservons le droit de suspendre ou résilier un compte en cas de violation 
                  des présentes conditions, de comportement inapproprié, ou d'utilisation frauduleuse.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-semibold">3. Réservations et Utilisation des Terrains</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3.1 Processus de réservation</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Les réservations se font exclusivement via la plateforme</li>
                  <li>Confirmation immédiate sous réserve de disponibilité</li>
                  <li>Paiement sécurisé en ligne ou sur place selon les modalités</li>
                  <li>Réservation ferme après confirmation de paiement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3.2 Annulation et modification</h4>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800">
                    <strong>Politique d'annulation :</strong>
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-orange-700">
                    <li>Annulation gratuite jusqu'à 24h avant le créneau</li>
                    <li>Entre 24h et 6h : 50% du montant remboursé</li>
                    <li>Moins de 6h avant : aucun remboursement</li>
                    <li>Annulation pour cause météorologique : remboursement intégral</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">3.3 Règles d'utilisation des terrains</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respecter les horaires de réservation</li>
                  <li>Se conformer au règlement intérieur de chaque terrain</li>
                  <li>Utiliser l'équipement approprié (chaussures de sport adaptées)</li>
                  <li>Respecter les autres utilisateurs et le personnel</li>
                  <li>Signaler tout incident ou dégradation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold">4. Tarifs et Paiement</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">4.1 Tarification</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Les prix sont affichés en Francs CFA (FCFA) toutes taxes comprises</li>
                  <li>Tarifs variables selon le terrain, horaire et jour de la semaine</li>
                  <li>Réductions possibles pour les abonnements longue durée</li>
                  <li>Prix susceptibles de modification avec préavis de 15 jours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">4.2 Modalités de paiement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="font-medium text-green-800 mb-2">Paiement en ligne</h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Carte bancaire</li>
                      <li>• Mobile Money</li>
                      <li>• Virement bancaire</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Paiement sur place</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Espèces</li>
                      <li>• Carte bancaire</li>
                      <li>• Chèque (selon terrain)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">4.3 Facturation</h4>
                <p>
                  Une facture électronique est automatiquement envoyée après chaque paiement. 
                  Les entreprises peuvent demander une facture TVA en fournissant leur NINEA.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold">5. Responsabilités et Assurance</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">5.1 Responsabilité de l'utilisateur</h4>
                <p className="text-red-700">
                  L'utilisateur est seul responsable des dommages qu'il pourrait causer à lui-même, 
                  aux autres utilisateurs, aux équipements ou aux installations lors de l'utilisation des terrains.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">5.2 Assurance recommandée</h4>
                <p>
                  Il est fortement recommandé aux utilisateurs de disposer d'une assurance responsabilité civile 
                  et d'une assurance accident couvrant la pratique sportive.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">5.3 Limitation de responsabilité de la plateforme</h4>
                <p>
                  Notre responsabilité est limitée à la fourniture de la plateforme de réservation. 
                  Nous ne sommes pas responsables des accidents, vols, ou dommages survenant sur les terrains.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-semibold">6. Protection des Données et Confidentialité</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <p>
                Le traitement de vos données personnelles est régi par notre 
                <button 
                  onClick={() => navigate('/privacy')}
                  className="text-indigo-600 hover:text-indigo-800 underline mx-1"
                >
                  Politique de Confidentialité
                </button>
                que nous vous invitons à consulter.
              </p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-medium text-indigo-800 mb-2">Vos droits</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Droit d'accès à vos données</li>
                  <li>• Droit de rectification</li>
                  <li>• Droit à l'effacement</li>
                  <li>• Droit à la portabilité</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-semibold">7. Dispositions Générales</h3>
            </div>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">7.1 Modification des conditions</h4>
                <p>
                  Nous nous réservons le droit de modifier ces conditions à tout moment. 
                  Les utilisateurs seront informés par email des modifications importantes.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">7.2 Droit applicable et juridiction</h4>
                <p>
                  Ces conditions sont régies par le droit sénégalais. 
                  Tout litige sera soumis à la juridiction des tribunaux de Dakar.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">7.3 Résolution des litiges</h4>
                <p>
                  En cas de litige, nous privilégions la résolution amiable. 
                  Contactez notre service client en premier recours.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl text-white p-6">
            <h3 className="text-xl font-semibold mb-4">Contact et Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Service Client</h4>
                <p className="text-gray-300 text-sm mb-2">Du Lundi au Samedi, 8h-20h</p>
                <p className="text-sm">
                  📧 support@terrains-dakar.sn<br/>
                  📱 +221 XX XXX XX XX
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Adresse</h4>
                <p className="text-gray-300 text-sm">
                  Terrains Synthétiques Dakar<br/>
                  Dakar, Sénégal<br/>
                  NINEA : XXXXXXXXXX
                </p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-600 text-center text-sm text-gray-400">
              Conditions Générales d'Utilisation - Version 2.0 - {new Date().getFullYear()}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsPage; 