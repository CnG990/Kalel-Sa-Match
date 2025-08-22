import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, MapPin, Clock, MessageCircle, HelpCircle, AlertCircle, CheckCircle, Send, FileText, Headphones, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'contact' | 'faq' | 'ticket'>('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    priority: 'normale',
    message: '',
    terrain: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'reservation', label: 'Réservation', icon: '📅' },
    { id: 'paiement', label: 'Paiement', icon: '💳' },
    { id: 'technique', label: 'Problème technique', icon: '🔧' },
    { id: 'compte', label: 'Mon compte', icon: '👤' },
    { id: 'terrain', label: 'Terrain/Infrastructure', icon: '🏟️' },
    { id: 'autre', label: 'Autre', icon: '💬' }
  ];

  const priorities = [
    { id: 'faible', label: 'Faible', color: 'green' },
    { id: 'normale', label: 'Normale', color: 'blue' },
    { id: 'elevee', label: 'Élevée', color: 'orange' },
    { id: 'urgente', label: 'Urgente', color: 'red' }
  ];

  const faqs = [
    {
      category: 'Réservation',
      questions: [
        {
          q: 'Comment puis-je réserver un terrain ?',
          a: 'Connectez-vous à votre compte, choisissez le terrain, la date et l\'heure souhaitées, puis confirmez votre paiement. Vous recevrez une confirmation par email.'
        },
        {
          q: 'Puis-je annuler ma réservation ?',
          a: 'Oui, vous pouvez annuler gratuitement jusqu\'à 24h avant votre créneau. Entre 24h et 6h, 50% du montant sera remboursé. Moins de 6h avant : aucun remboursement.'
        },
        {
          q: 'Que faire en cas de pluie ?',
          a: 'En cas de pluie importante rendant le terrain impraticable, nous remboursons intégralement votre réservation. Contactez-nous pour signaler les conditions météo.'
        }
      ]
    },
    {
      category: 'Paiement',
      questions: [
        {
          q: 'Quels moyens de paiement acceptez-vous ?',
          a: 'Nous acceptons les cartes bancaires, Mobile Money (Orange Money, Wave), virements bancaires et paiements en espèces sur place.'
        },
        {
          q: 'Mon paiement a échoué, que faire ?',
          a: 'Vérifiez d\'abord vos informations bancaires. Si le problème persiste, contactez votre banque ou essayez un autre moyen de paiement.'
        },
        {
          q: 'Comment obtenir une facture ?',
          a: 'Une facture électronique est automatiquement envoyée après chaque paiement. Pour une facture TVA, fournissez votre NINEA lors de la réservation.'
        }
      ]
    },
    {
      category: 'Compte',
      questions: [
        {
          q: 'J\'ai oublié mon mot de passe',
          a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre email et suivez les instructions pour créer un nouveau mot de passe.'
        },
        {
          q: 'Comment modifier mes informations personnelles ?',
          a: 'Dans votre compte, accédez à "Profil" puis "Modifier". Vous pouvez changer votre nom, téléphone, adresse et préférences.'
        },
        {
          q: 'Comment supprimer mon compte ?',
          a: 'Contactez notre support pour supprimer définitivement votre compte. Cette action est irréversible et supprime toutes vos données.'
        }
      ]
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulation d'envoi - remplacer par l'API réelle
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        priority: 'normale',
        message: '',
        terrain: ''
      });
      
    } catch (error) {
      toast.error('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Centre d'Aide et Support</h1>
              <p className="text-gray-600 mt-1">Nous sommes là pour vous aider 24h/24, 7j/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Contact rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-6 h-6" />
              <h3 className="font-semibold">Support téléphonique</h3>
            </div>
            <p className="text-green-100 text-sm mb-3">Assistance immédiate pour vos urgences</p>
            <p className="font-semibold">+221 XX XXX XX XX</p>
            <p className="text-green-100 text-xs">Lun-Sam: 8h-20h</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-6 h-6" />
              <h3 className="font-semibold">Chat en direct</h3>
            </div>
            <p className="text-blue-100 text-sm mb-3">Réponse instantanée en ligne</p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
              Démarrer le chat
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="w-6 h-6" />
              <h3 className="font-semibold">Email support</h3>
            </div>
            <p className="text-purple-100 text-sm mb-3">Réponse sous 2 heures ouvrées</p>
            <p className="font-semibold">support@terrains-dakar.sn</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'contact'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  Nous contacter
                </div>
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'faq'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  FAQ
                </div>
              </button>
              <button
                onClick={() => setActiveTab('ticket')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'ticket'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mes tickets
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Tab Contact */}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Formulaire */}
                <div>
                  <h3 className="text-xl font-semibold mb-6">Formulaire de contact</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catégorie
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Choisir une catégorie</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.icon} {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Résumé de votre demande"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priorité
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          {priorities.map(priority => (
                            <option key={priority.id} value={priority.id}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Décrivez votre problème ou votre question en détail..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Envoyer le message
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Informations de contact */}
                <div>
                  <h3 className="text-xl font-semibold mb-6">Autres moyens de nous joindre</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Adresse</h4>
                          <p className="text-gray-600 text-sm mt-1">
                            Terrains Synthétiques Dakar<br/>
                            Dakar, Sénégal
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-gray-900">Horaires d'ouverture</h4>
                          <div className="text-gray-600 text-sm mt-1 space-y-1">
                            <p>Lundi - Vendredi: 8h00 - 20h00</p>
                            <p>Samedi: 9h00 - 18h00</p>
                            <p>Dimanche: 10h00 - 16h00</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                        <div>
                          <h4 className="font-medium text-green-800">Temps de réponse</h4>
                          <ul className="text-green-700 text-sm mt-1 space-y-1">
                            <li>• Chat en direct: Immédiat</li>
                            <li>• Téléphone: Immédiat (heures ouvrées)</li>
                            <li>• Email: Sous 2 heures ouvrées</li>
                            <li>• Ticket: Sous 24 heures</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab FAQ */}
            {activeTab === 'faq' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Questions Fréquemment Posées</h3>
                  <p className="text-gray-600">Trouvez rapidement des réponses à vos questions les plus courantes</p>
                </div>

                <div className="space-y-8">
                  {faqs.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {sectionIndex + 1}
                        </span>
                        {section.category}
                      </h4>
                      
                      <div className="space-y-4">
                        {section.questions.map((faq, faqIndex) => (
                          <div key={faqIndex} className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2 flex items-start gap-2">
                              <HelpCircle className="w-4 h-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                              {faq.q}
                            </h5>
                            <p className="text-gray-700 text-sm pl-6">{faq.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                  <h4 className="font-medium text-indigo-800 mb-2">Vous ne trouvez pas votre réponse ?</h4>
                  <p className="text-indigo-700 text-sm mb-4">
                    Notre équipe support est là pour vous aider avec toutes vos questions spécifiques.
                  </p>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Contacter le support
                  </button>
                </div>
              </div>
            )}

            {/* Tab Tickets */}
            {activeTab === 'ticket' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">Mes demandes de support</h3>
                  <p className="text-gray-600">Suivez l'état de vos tickets et conversations avec notre équipe</p>
                </div>

                {/* Liste des tickets (exemple) */}
                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">#TSK-001 - Problème de paiement</h4>
                        <p className="text-gray-600 text-sm mt-1">Créé le 15 janvier 2025</p>
                        <p className="text-gray-700 text-sm mt-2">Ma carte bancaire a été débitée mais la réservation n'apparaît pas...</p>
                      </div>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        En cours
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-500">Dernière mise à jour: Il y a 2 heures</span>
                      <button className="text-indigo-600 hover:text-indigo-800">Voir les détails</button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">#TSK-002 - Question sur les horaires</h4>
                        <p className="text-gray-600 text-sm mt-1">Créé le 12 janvier 2025</p>
                        <p className="text-gray-700 text-sm mt-2">Quels sont les horaires d'ouverture du terrain Complexe Be Sport...</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Résolu
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-500">Résolu le: 13 janvier 2025</span>
                      <button className="text-indigo-600 hover:text-indigo-800">Voir les détails</button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FileText className="w-4 h-4" />
                    Créer un nouveau ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support d'urgence */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Support d'urgence</h3>
              <p className="text-red-700 mb-4">
                Pour les problèmes urgents (terrain inaccessible, accident, etc.), contactez-nous immédiatement :
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="tel:+221XXXXXXXX"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Appel d'urgence
                </a>
                <a
                  href="https://wa.me/221XXXXXXXX"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage; 