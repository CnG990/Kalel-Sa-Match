import React, { useState } from 'react';
import { X, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import apiService from '../services/api';

interface LitigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  terrainId?: number;
  terrainNom?: string;
  reservationId?: number;
}

interface FormData {
  type_litige: string;
  sujet: string;
  description: string;
  priorite: string;
  preuves: File[];
}

const LitigeModal: React.FC<LitigeModalProps> = ({ 
  isOpen, 
  onClose, 
  terrainId, 
  terrainNom,
  reservationId 
}) => {
  const [formData, setFormData] = useState<FormData>({
    type_litige: '',
    sujet: '',
    description: '',
    priorite: 'normale',
    preuves: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typesLitige = [
    { id: 'reservation', label: 'Problème de réservation', icon: '📅' },
    { id: 'paiement', label: 'Problème de paiement', icon: '💳' },
    { id: 'service', label: 'Qualité de service', icon: '🤝' },
    { id: 'equipement', label: 'Équipement défaillant', icon: '⚽' },
    { id: 'autre', label: 'Autre problème', icon: '📝' }
  ];

  const priorites = [
    { id: 'faible', label: 'Faible', color: 'text-gray-600', description: 'Problème mineur, non urgent' },
    { id: 'normale', label: 'Normale', color: 'text-blue-600', description: 'Problème standard' },
    { id: 'elevee', label: 'Élevée', color: 'text-orange-600', description: 'Nécessite attention rapide' },
    { id: 'urgente', label: 'Urgente', color: 'text-red-600', description: 'Problème critique' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + formData.preuves.length > 5) {
        toast.error('Maximum 5 fichiers autorisés');
        return;
      }
      setFormData(prev => ({
        ...prev,
        preuves: [...prev.preuves, ...files]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preuves: prev.preuves.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!terrainId) {
      toast.error('Terrain non spécifié');
      return;
    }

    if (!formData.type_litige || !formData.sujet || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convertir les fichiers en base64 (ou utiliser un service d'upload)
      const preuves = await Promise.all(
        formData.preuves.map(async (file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const litigeData = {
        terrain_id: terrainId,
        type_litige: formData.type_litige,
        sujet: formData.sujet,
        description: formData.description,
        priorite: formData.priorite,
        reservation_id: reservationId || undefined,
        preuves: preuves
      };

      const { data, meta } = await apiService.creerLitige(litigeData);

      if (data) {
        toast.success(`Litige créé avec succès (${(data as any).numero_litige || ''})`);
        onClose();
        // Reset form
        setFormData({
          type_litige: '',
          sujet: '',
          description: '',
          priorite: 'normale',
          preuves: []
        });
      } else {
        toast.error(meta.message || 'Erreur lors de la création du litige');
      }
    } catch (error: any) {
      console.error('Erreur création litige:', error);
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Signaler un problème</h2>
              {terrainNom && (
                <p className="text-sm text-gray-600">Terrain : {terrainNom}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type de litige */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de problème *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {typesLitige.map((type) => (
                <label
                  key={type.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type_litige === type.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type_litige"
                    value={type.id}
                    checked={formData.type_litige === type.id}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priorité *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorites.map((priorite) => (
                <label
                  key={priorite.id}
                  className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.priorite === priorite.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priorite"
                    value={priorite.id}
                    checked={formData.priorite === priorite.id}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className={`font-medium ${priorite.color}`}>{priorite.label}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">{priorite.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sujet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet du problème *
            </label>
            <input
              type="text"
              name="sujet"
              value={formData.sujet}
              onChange={handleInputChange}
              placeholder="Résumé en quelques mots"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={255}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              placeholder="Décrivez le problème en détail : que s'est-il passé ? quand ? dans quelles circonstances ?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              maxLength={2000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length}/2000 caractères
            </div>
          </div>

          {/* Pièces jointes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pièces justificatives (optionnel)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="text-sm text-gray-600">
                    Cliquez pour ajouter des fichiers
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Images, PDF, DOC - Maximum 5 fichiers
                </p>
              </div>

              {/* Liste des fichiers */}
              {formData.preuves.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.preuves.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Informations additionnelles */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Traitement de votre demande</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Délai de réponse : 2 heures ouvrées</p>
              <p>• Suivi par email et notifications</p>
              <p>• Escalade automatique si nécessaire</p>
              <p>• Résolution amiable privilégiée</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.type_litige || !formData.sujet || !formData.description}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  Signaler le problème
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LitigeModal; 