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
              Kalél Sa Match - Plateforme de réservation de terrains synthétiques
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
                En utilisant la plateforme Kalél Sa Match, vous acceptez d'être lié par ces conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description du Service</h2>
              <p className="text-gray-700 mb-4">
                Kalél Sa Match est une plateforme de réservation en ligne de terrains synthétiques à Dakar. 
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
                <li>Vous pouvez annuler une réservation jusqu'à 24h avant le créneau</li>
                <li>Les annulations tardives peuvent entraîner des frais</li>
              </ul>
              
              <p className="text-gray-700 mb-4">
                <strong>Paiements :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Les paiements sont sécurisés et effectués en FCFA</li>
                <li>Nous acceptons les cartes bancaires et Orange Money</li>
                <li>Les prix affichés incluent toutes les taxes applicables</li>
                <li>Des reçus électroniques sont générés automatiquement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Règles d'Utilisation des Terrains</h2>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Responsabilités</h2>
              <p className="text-gray-700 mb-4">
                <strong>Notre responsabilité :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Maintenir la plateforme fonctionnelle et sécurisée</li>
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
                <li>Ne pas perturber le fonctionnement de la plateforme</li>
                <li>Respecter les droits des autres utilisateurs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Protection des Données</h2>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation de Responsabilité</h2>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications des Conditions</h2>
              <p className="text-gray-700 mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. 
                Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. 
                Votre utilisation continue du service après publication des modifications constitue votre acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact</h2>
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