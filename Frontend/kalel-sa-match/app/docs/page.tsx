'use client'

import Logo from '../components/Logo'

export default function Documentation() {
  return (
    <div className="min-h-screen bg-kalel-primary/5 pt-20">
      {/* Navigation - copié de la page d'accueil */}
      <nav className="bg-white shadow-lg fixed w-full z-50 top-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <Logo className="h-8 w-auto text-kalel-primary" />
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/docs" className="text-kalel-primary px-3 py-2 rounded-md text-sm font-medium">
                Documentation
              </a>
              <a href="/inscription" className="text-gray-600 hover:text-kalel-primary px-3 py-2 rounded-md text-sm font-medium">
                Inscription
              </a>
              <a
                href="/connexion"
                className="btn-primary"
              >
                Connexion
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-kalel-primary mb-8">Documentation</h1>
        
        {/* Types de comptes */}
        <section className="card mb-8">
          <h2 className="text-2xl font-bold text-kalel-primary mb-6">Types de comptes</h2>
          
          <div className="space-y-8">
            {/* Compte Client */}
            <div>
              <h3 className="text-xl font-semibold text-kalel-primary mb-4">Compte Client</h3>
              <div className="bg-kalel-primary/5 p-6 rounded-lg">
                <h4 className="font-bold mb-2">Comment s'inscrire ?</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Cliquez sur le bouton "Inscription" dans la barre de navigation</li>
                  <li>Remplissez le formulaire avec vos informations personnelles</li>
                  <li>Validez votre adresse email</li>
                  <li>Commencez à réserver des terrains !</li>
                </ul>
                
                <h4 className="font-bold mt-4 mb-2">Fonctionnalités</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Recherche de terrains disponibles</li>
                  <li>Réservation en ligne</li>
                  <li>Paiement sécurisé (Wave, Orange Money)</li>
                  <li>Historique des réservations</li>
                  <li>Notifications de confirmation</li>
                </ul>
              </div>
            </div>

            {/* Compte Gérant */}
            <div>
              <h3 className="text-xl font-semibold text-kalel-primary mb-4">Compte Gérant</h3>
              <div className="bg-kalel-primary/5 p-6 rounded-lg">
                <h4 className="font-bold mb-2">Comment obtenir un compte ?</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Contactez notre service client au <span className="text-kalel-secondary">+221 XX XXX XX XX</span></li>
                  <li>Un conseiller vous guidera dans le processus d'enregistrement de votre terrain</li>
                  <li>Après validation de votre dossier, vos identifiants vous seront transmis</li>
                  <li>Notre équipe vous accompagnera dans la prise en main de votre espace gérant</li>
                </ul>
                
                <div className="mt-4 p-4 bg-kalel-accent/10 rounded-lg">
                  <p className="text-sm text-kalel-primary">
                    <span className="font-bold">Note :</span> Pour garantir la qualité de service, chaque demande de compte gérant est soigneusement étudiée par notre équipe. Un conseiller dédié vous accompagnera tout au long du processus.
                  </p>
                </div>
                
                <h4 className="font-bold mt-4 mb-2">Fonctionnalités</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Gestion des terrains (horaires, prix, disponibilités)</li>
                  <li>Validation des réservations</li>
                  <li>Tableau de bord des réservations</li>
                  <li>Statistiques et rapports</li>
                  <li>Gestion des paiements</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Sécurité */}
        <section className="card">
          <h2 className="text-2xl font-bold text-kalel-primary mb-6">Sécurité</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Chez Kalèl sa Match, nous prenons la sécurité de vos données très au sérieux.
              Toutes les informations sensibles sont cryptées et nos systèmes de paiement
              sont sécurisés aux normes les plus strictes.
            </p>
            <div className="bg-kalel-primary/5 p-6 rounded-lg">
              <h4 className="font-bold mb-2">Bonnes pratiques</h4>
              <ul className="list-disc list-inside space-y-2">
                <li>Utilisez un mot de passe unique et complexe</li>
                <li>Ne partagez jamais vos identifiants</li>
                <li>Déconnectez-vous après chaque session</li>
                <li>Vérifiez régulièrement votre historique de connexion</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 