import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Conditions d'Utilisation</h1>
            <p className="text-xl opacity-90">
              Kalél Sa Match - Application de réservation de terrains synthétiques
            </p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptation des Conditions</h2>
              <p className="text-gray-700 mb-4">
                En utilisant l'application Kalél Sa Match, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du Service</h2>
              <p className="text-gray-700 mb-4">
                Kalél Sa Match est une application de réservation en ligne de terrains synthétiques à Dakar. 
                Notre service permet aux utilisateurs de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Rechercher et consulter les terrains disponibles</li>
                <li>Effectuer des réservations de créneaux horaires</li>
                <li>Payer en ligne leurs réservations</li>
                <li>Gérer leur profil et leurs réservations</li>
                <li>Consulter les informations des terrains et leurs équipements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Inscription et Compte Utilisateur</h2>
              <p className="text-gray-700 mb-4">
                Pour utiliser nos services, vous devez créer un compte en fournissant des informations exactes et à jour. 
                Vous êtes responsable de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintenir la confidentialité de vos identifiants de connexion</li>
                <li>Toutes les activités effectuées sous votre compte</li>
                <li>Nous informer immédiatement de toute utilisation non autorisée</li>
                <li>Fournir des informations de contact valides</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Réservations et Paiements</h2>
              <p className="text-gray-700 mb-4">
                <strong>Réservations :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Les réservations sont confirmées uniquement après paiement</li>
                <li>Les créneaux sont disponibles selon la disponibilité réelle des terrains</li>
                <li>Un acompte de <strong>5 000 FCFA</strong> est obligatoire pour toute réservation</li>
                <li>Le solde doit être payé avant l'utilisation du terrain</li>
              </ul>
              
              <p className="text-gray-700 mb-4">
                <strong>Paiements :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Les paiements sont sécurisés et effectués en FCFA</li>
                <li>Nous acceptons Orange Money, Wave et les paiements en espèces</li>
                <li>Les prix affichés incluent toutes les taxes applicables</li>
                <li>Des reçus électroniques sont générés automatiquement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Règles d'Annulation et de Remboursement</h2>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
                <p className="text-orange-800 font-semibold mb-2">💰 Règles d'annulation et remboursement</p>
                <p className="text-orange-700 text-sm mb-3">
                  Les règles suivantes s'appliquent à toutes les réservations :
                </p>
              </div>
              
              <div className="space-y-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">✅ Annulation 12 heures ou plus avant le match</h3>
                  <ul className="list-disc pl-6 text-green-800 text-sm space-y-1">
                    <li><strong>Remboursement complet</strong> de l'acompte (5 000 FCFA)</li>
                    <li>Aucun frais de retrait</li>
                    <li>Remboursement effectué sous <strong>24-48 heures</strong> par Orange Money</li>
                    <li>Le remboursement est traité automatiquement</li>
                  </ul>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">❌ Annulation moins de 12 heures avant le match</h3>
                  <ul className="list-disc pl-6 text-red-800 text-sm space-y-1">
                    <li><strong>Perte définitive</strong> de l'acompte (5 000 FCFA)</li>
                    <li>Aucun remboursement possible</li>
                    <li>L'acompte est conservé pour compenser la perte de revenus</li>
                    <li>Cette règle s'applique même en cas d'urgence</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Réservation manquée (No-Show)</h3>
                  <ul className="list-disc pl-6 text-yellow-800 text-sm space-y-1">
                    <li>Si vous ne vous présentez pas à votre réservation sans annulation préalable</li>
                    <li><strong>Perte totale</strong> de l'acompte (5 000 FCFA)</li>
                    <li><strong>Pénalité supplémentaire</strong> : 5 000 FCFA (amende pour absence)</li>
                    <li><strong>Total perdu : 10 000 FCFA</strong> (acompte + pénalité)</li>
                    <li>Cette pénalité est automatiquement appliquée et doit être payée avant toute nouvelle réservation</li>
                    <li>En cas de récidive, votre compte peut être suspendu</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Informations importantes</h3>
                <ul className="list-disc pl-6 text-blue-800 text-sm space-y-1">
                  <li>Les remboursements sont effectués sur le même moyen de paiement utilisé</li>
                  <li>Les délais de remboursement peuvent varier selon votre opérateur mobile</li>
                  <li>Pour toute question concernant un remboursement, contactez notre support client</li>
                  <li>Les règles s'appliquent automatiquement à toutes vos réservations</li>
                  <li>En cas de conditions météorologiques extrêmes, des exceptions peuvent être appliquées</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Règles d'Utilisation des Terrains</h2>
              <p className="text-gray-700 mb-4">
                En réservant un terrain, vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Respecter les horaires de votre créneau</li>
                <li>Utiliser les équipements avec soin</li>
                <li>Respecter les autres utilisateurs et le personnel</li>
                <li>Ne pas dépasser la capacité maximale autorisée</li>
                <li>Signaler tout dommage ou problème au gestionnaire</li>
                <li>Respecter les règles de sécurité en vigueur</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Responsabilités</h2>
              <p className="text-gray-700 mb-4">
                <strong>Notre responsabilité :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintenir l'application fonctionnelle et sécurisée</li>
                <li>Traiter les réservations et paiements de manière fiable</li>
                <li>Fournir un support client réactif</li>
                <li>Protéger vos données personnelles</li>
              </ul>
              
              <p className="text-gray-700 mb-4">
                <strong>Votre responsabilité :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Utiliser le service de manière légale et appropriée</li>
                <li>Respecter les conditions de réservation</li>
                <li>Ne pas perturber le fonctionnement de l'application</li>
                <li>Respecter les droits des autres utilisateurs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Protection des Données</h2>
              <p className="text-gray-700 mb-4">
                Nous collectons et traitons vos données personnelles conformément à notre politique de confidentialité. 
                Vos données sont utilisées uniquement pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Gérer votre compte et vos réservations</li>
                <li>Traiter vos paiements</li>
                <li>Vous contacter concernant vos réservations</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation de Responsabilité</h2>
              <p className="text-gray-700 mb-4">
                Kalél Sa Match ne peut être tenu responsable de :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Les dommages corporels survenant pendant l'utilisation des terrains</li>
                <li>Les pertes ou vols d'objets personnels</li>
                <li>Les interruptions de service dues à des causes techniques</li>
                <li>Les actes des autres utilisateurs</li>
                <li>Les conditions météorologiques affectant les terrains</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Modifications des Conditions</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. 
                Votre utilisation continue du service après publication des modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant ces conditions d'utilisation, contactez-nous :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email :</strong> contact@kalelsamatch.com<br />
                  <strong>Téléphone :</strong> +221 77 123 45 67<br />
                  <strong>Adresse :</strong> Dakar, Sénégal
                </p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <p className="text-sm text-gray-600 mb-4 sm:mb-0">
                  © 2025 Kalél Sa Match. Tous droits réservés.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-orange-500 hover:from-green-700 hover:to-orange-600"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 