import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
            <p className="text-xl opacity-90">
              Kalél Sa Match - Protection de vos données personnelles
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Kalél Sa Match s'engage à protéger votre vie privée et vos données personnelles. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, 
                stockons et protégeons vos informations lorsque vous utilisez notre application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Informations que nous collectons</h2>
              <p className="text-gray-700 mb-4">
                <strong>Informations que vous nous fournissez :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Informations d'identification (nom, prénom, email, téléphone)</li>
                <li>Informations de compte (mot de passe, préférences)</li>
                <li>Informations de réservation (dates, terrains, paiements)</li>
                <li>Informations d'entreprise (pour les gestionnaires)</li>
                <li>Communications avec notre support client</li>
              </ul>
              
              <p className="text-gray-700 mb-4">
                <strong>Informations collectées automatiquement :</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Adresse IP et informations de localisation</li>
                <li>Données de navigation et d'utilisation</li>
                <li>Informations sur l'appareil et le navigateur</li>
                <li>Cookies et technologies similaires</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Comment nous utilisons vos informations</h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons vos données personnelles pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Traiter vos réservations et paiements</li>
                <li>Vous contacter concernant vos réservations</li>
                <li>Améliorer nos services et l'expérience utilisateur</li>
                <li>Assurer la sécurité de notre application</li>
                <li>Respecter nos obligations légales</li>
                <li>Vous envoyer des communications marketing (avec votre consentement)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partage de vos informations</h2>
              <p className="text-gray-700 mb-4">
                Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers, 
                sauf dans les cas suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Avec votre consentement :</strong> Nous pouvons partager vos informations si vous nous y autorisez</li>
                <li><strong>Prestataires de services :</strong> Nous travaillons avec des partenaires de confiance pour les paiements, l'hébergement, etc.</li>
                <li><strong>Obligations légales :</strong> Nous pouvons divulguer vos informations si la loi l'exige</li>
                <li><strong>Protection de nos droits :</strong> Pour protéger nos droits, notre propriété ou notre sécurité</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sécurité des données</h2>
              <p className="text-gray-700 mb-4">
                Nous mettons en place des mesures de sécurité appropriées pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Chiffrement des données sensibles</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Surveillance continue de nos systèmes</li>
                <li>Formation de notre personnel à la sécurité</li>
                <li>Sauvegardes régulières et sécurisées</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservation des données</h2>
              <p className="text-gray-700 mb-4">
                Nous conservons vos données personnelles aussi longtemps que nécessaire pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fournir nos services</li>
                <li>Respecter nos obligations légales</li>
                <li>Résoudre les litiges</li>
                <li>Faire respecter nos accords</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Lorsque nous n'avons plus besoin de vos données, nous les supprimons de manière sécurisée.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Vos droits</h2>
              <p className="text-gray-700 mb-4">
                Conformément à la réglementation, vous avez les droits suivants :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Droit d'accès :</strong> Demander une copie de vos données personnelles</li>
                <li><strong>Droit de rectification :</strong> Corriger des données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                <li><strong>Droit de limitation :</strong> Limiter le traitement de vos données</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies et technologies similaires</h2>
              <p className="text-gray-700 mb-4">
                Nous utilisons des cookies et des technologies similaires pour :
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Mémoriser vos préférences</li>
                <li>Analyser l'utilisation de notre site</li>
                <li>Améliorer nos services</li>
                <li>Assurer la sécurité</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Transferts internationaux</h2>
              <p className="text-gray-700 mb-4">
                Vos données peuvent être transférées et traitées dans des pays autres que le Sénégal. 
                Nous nous assurons que ces transferts respectent les standards de protection appropriés 
                et que vos données restent protégées.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Modifications de cette politique</h2>
              <p className="text-gray-700 mb-4">
                Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. 
                Les modifications seront publiées sur cette page avec une nouvelle date de mise à jour. 
                Nous vous encourageons à consulter régulièrement cette politique.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact</h2>
              <p className="text-gray-700 mb-4">
                Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
                contactez-nous :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email :</strong> privacy@kalelsamatch.com<br />
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

export default PrivacyPage; 