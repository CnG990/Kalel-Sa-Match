import React, { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Shield, 
  CreditCard, 
  Smartphone, 
  Calendar, 
  Star,
  CheckCircle,
  ArrowRight,
  Play,
  Zap,
  Globe,
  Award,
  Heart,
  Download
} from 'lucide-react';

const CataloguePage: React.FC = () => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    entreprise: '',
    nombreTerrains: '1-2 terrains',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Préparer le message pour WhatsApp
    const whatsappMessage = `Nouvelle demande de démo Kalel Sa Match:

Prénom: ${formData.prenom}
Nom: ${formData.nom}
Email: ${formData.email}
Téléphone: ${formData.telephone}
Entreprise: ${formData.entreprise}
Nombre de terrains: ${formData.nombreTerrains}
Message: ${formData.message || 'Aucun message'}

---
Envoyé depuis le catalogue en ligne`;

    // Encoder le message pour l'URL WhatsApp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Ouvrir WhatsApp avec le message pré-rempli
    window.open(`https://wa.me/221785949274?text=${encodedMessage}`, '_blank');
    
    // Envoyer aussi par email (optionnel)
    const emailSubject = encodeURIComponent('Demande de démo - Kalel Sa Match');
    const emailBody = encodeURIComponent(whatsappMessage);
    window.open(`mailto:cheikhngom99@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
    
    // Réinitialiser le formulaire
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      entreprise: '',
      nombreTerrains: '1-2 terrains',
      message: ''
    });
  };

  const handleDownloadCatalogue = () => {
    const message = `Bonjour, je souhaite télécharger le catalogue complet de Kalel Sa Match.

Pouvez-vous me l'envoyer par email ou WhatsApp ?

Merci d'avance !`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/221785949274?text=${encodedMessage}`, '_blank');
    
    const emailSubject = encodeURIComponent('Demande de catalogue - Kalel Sa Match');
    const emailBody = encodeURIComponent(message);
    window.open(`mailto:cheikhngom99@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
  };

  const handleContactUs = () => {
    const message = `Bonjour, je souhaite avoir plus d'informations sur Kalel Sa Match.

Pouvez-vous me contacter pour discuter de vos services ?

Merci !`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/221785949274?text=${encodedMessage}`, '_blank');
    
    const emailSubject = encodeURIComponent('Contact - Kalel Sa Match');
    const emailBody = encodeURIComponent(message);
    window.open(`mailto:cheikhngom99@gmail.com?subject=${emailSubject}&body=${emailBody}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <img 
              src="/logo sans background.png" 
              alt="Kalel Sa Match Logo" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Kalel Sa Match
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            La solution complète de gestion et réservation de terrains de football synthétiques au Sénégal
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Voir la démo</span>
            </button>
            <button 
              onClick={() => document.getElementById('catalogue-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
            >
              Télécharger le catalogue
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Fonctionnalités principales
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Réservation en ligne</h3>
              <p className="text-gray-600">
                Système de réservation 24/7 avec calendrier interactif et confirmation instantanée
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Paiement sécurisé</h3>
              <p className="text-gray-600">
                Intégration de multiples moyens de paiement avec sécurité bancaire
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Application mobile</h3>
              <p className="text-gray-600">
                Interface responsive adaptée à tous les appareils mobiles
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Gestion des utilisateurs</h3>
              <p className="text-gray-600">
                Système de rôles et permissions pour administrateurs et gestionnaires
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Géolocalisation</h3>
              <p className="text-gray-600">
                Cartographie interactive des terrains avec recherche par proximité
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Sécurité avancée</h3>
              <p className="text-gray-600">
                Authentification JWT et protection des données sensibles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Avantages pour votre entreprise
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Pour les gestionnaires de terrains</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Automatisation complète des réservations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Gestion des abonnements et tarifs</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Tableaux de bord analytiques</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Communication avec les clients</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Gestion des litiges et tickets</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Pour les joueurs</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Réservation simple et rapide</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Paiement sécurisé en ligne</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Historique des réservations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Notifications en temps réel</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-600">Support client intégré</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Spécifications techniques
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Frontend</h3>
              <p className="text-gray-600">React + TypeScript</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Backend</h3>
              <p className="text-gray-600">Laravel + PHP</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Base de données</h3>
              <p className="text-gray-600">MySQL + Redis</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Déploiement</h3>
              <p className="text-gray-600">Vercel + VPS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue Download Section */}
      <section id="catalogue-section" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Télécharger le catalogue
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-orange-50 to-green-50 p-8 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg flex items-center justify-center mb-6">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Catalogue Kalel Sa Match - Version 2024 - PDF
              </h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Fonctionnalités détaillées</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Spécifications techniques</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Tarifs et plans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Témoignages clients</span>
                </li>
              </ul>
              <button 
                onClick={handleDownloadCatalogue}
                className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>Télécharger le catalogue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Ce que contient le catalogue :</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Présentation complète</span>
                    <p className="text-gray-600">Découvrez toutes les fonctionnalités de notre plateforme</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Fonctionnalités avancées</span>
                    <p className="text-gray-600">Détails sur les modules de gestion et d'analyse</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Architecture technique</span>
                    <p className="text-gray-600">Spécifications détaillées de l'infrastructure</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Plans tarifaires</span>
                    <p className="text-gray-600">Options d'abonnement adaptées à vos besoins</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">Support et formation</span>
                    <p className="text-gray-600">Accompagnement complet pour votre équipe</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Request Section */}
      <section id="demo-section" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Recevoir une démo
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Processus de démonstration</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Présentation de l'interface</h4>
                    <p className="text-gray-600">Découverte de l'interface utilisateur et de la navigation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Démonstration des fonctionnalités clés</h4>
                    <p className="text-gray-600">Présentation des modules de réservation, paiement et gestion</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Simulation de réservation et paiement</h4>
                    <p className="text-gray-600">Test complet du processus de réservation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Questions-réponses personnalisées</h4>
                    <p className="text-gray-600">Réponses à vos questions spécifiques</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-white rounded-xl">
                <h4 className="font-semibold text-gray-800 mb-4">Avantages de la démo :</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Durée : 30-45 minutes</li>
                  <li>• En ligne ou sur site</li>
                  <li>• Gratuite et sans engagement</li>
                  <li>• Adaptée à vos besoins</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-6 text-gray-800">Demande de démo</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                  <input
                    type="text"
                    name="entreprise"
                    value={formData.entreprise}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de terrains</label>
                  <select
                    name="nombreTerrains"
                    value={formData.nombreTerrains}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="1-2 terrains">1-2 terrains</option>
                    <option value="3-5 terrains">3-5 terrains</option>
                    <option value="6-10 terrains">6-10 terrains</option>
                    <option value="Plus de 10 terrains">Plus de 10 terrains</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Décrivez vos besoins spécifiques..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-green-700 transition-all"
                >
                  Demander une démo
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8 text-gray-800">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contactez-nous dès aujourd'hui pour découvrir comment Kalel Sa Match peut transformer la gestion de vos terrains
          </p>
          <button 
            onClick={handleContactUs}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors"
          >
            Contactez-nous
          </button>
        </div>
      </section>
    </div>
  );
};

export default CataloguePage;
