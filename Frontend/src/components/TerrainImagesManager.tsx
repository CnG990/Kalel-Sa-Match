import React, { useState, useCallback } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Star, 
  Trash2, 
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TerrainImage {
  id: string;
  url: string;
  file?: File;
  isNew?: boolean;
  isPrimary?: boolean;
}

interface TerrainImagesManagerProps {
  terrainId?: number;
  terrainNom: string;
  existingImages?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (images: File[], primaryIndex: number) => Promise<void>;
}

const TerrainImagesManager: React.FC<TerrainImagesManagerProps> = ({
  terrainNom,
  existingImages = [],
  isOpen,
  onClose,
  onSave
}) => {
  const [images, setImages] = useState<TerrainImage[]>(() => {
    return existingImages.map((url, index) => ({
      id: `existing_${index}`,
              url: url.startsWith('http') ? url : `https://b0385fbb1e44.ngrok-free.app/storage/${url}`,
      isPrimary: index === 0
    }));
  });
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const MAX_IMAGES = 5;

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images autorisées`);
      return;
    }

    const newImages: TerrainImage[] = [];
    let validCount = 0;

    Array.from(files).forEach((file, index) => {
      if (validCount >= remainingSlots) return;

      // Validation
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} n'est pas une image valide`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} est trop volumineux (max 5MB)`);
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      newImages.push({
        id: `new_${Date.now()}_${index}`,
        url: imageUrl,
        file,
        isNew: true,
        isPrimary: images.length === 0 && validCount === 0 // Premier image devient principale
      });
      validCount++;
    });

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) ajoutée(s)`);
    }

    // Reset input
    event.target.value = '';
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    const imageToRemove = images[index];
    
    // Révoquer l'URL si c'est une nouvelle image
    if (imageToRemove.isNew && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    const newImages = images.filter((_, i) => i !== index);
    
    // Si l'image supprimée était principale, faire de la première la nouvelle principale
    if (imageToRemove.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }

    setImages(newImages);
    
    // Ajuster l'index sélectionné
    if (selectedImageIndex >= newImages.length) {
      setSelectedImageIndex(Math.max(0, newImages.length - 1));
    }
  }, [images, selectedImageIndex]);

  const setPrimaryImage = useCallback((index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      isPrimary: i === index
    })));
  }, []);

  const handleSave = async () => {
    const newImageFiles = images.filter(img => img.isNew && img.file).map(img => img.file!);
    const primaryIndex = images.findIndex(img => img.isPrimary);

    if (newImageFiles.length === 0) {
      toast.success('Aucune nouvelle image à sauvegarder');
      onClose();
      return;
    }

    setUploading(true);
    try {
      await onSave(newImageFiles, primaryIndex);
      toast.success('Images sauvegardées avec succès');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📸 Gestion des images
              </h2>
              <p className="text-gray-600">
                {terrainNom} • {images.length}/{MAX_IMAGES} images
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-96">
          {/* Aperçu principal */}
          <div className="flex-1 bg-gray-100 relative">
            {images.length > 0 ? (
              <>
                <img
                  src={images[selectedImageIndex]?.url}
                  alt={`Image ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Contrôles navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev > 0 ? prev - 1 : images.length - 1
                      )}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev < images.length - 1 ? prev + 1 : 0
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badge principale */}
                {images[selectedImageIndex]?.isPrimary && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                      <Star className="w-4 h-4 mr-1" />
                      Image principale
                    </span>
                  </div>
                )}

                {/* Badge nouvelle */}
                {images[selectedImageIndex]?.isNew && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
                      Nouvelle
                    </span>
                  </div>
                )}

                {/* Indicateur position */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-300" />
                  <p className="mt-4 text-gray-500">Aucune image</p>
                  <p className="text-sm text-gray-400">Ajoutez des images pour votre terrain</p>
                </div>
              </div>
            )}
          </div>

          {/* Panneau latéral */}
          <div className="w-80 border-l bg-white flex flex-col">
            {/* Zone d'ajout */}
            <div className="p-4 border-b">
              <label className="block">
                <div className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors ${
                  images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <Plus className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    {images.length >= MAX_IMAGES 
                      ? `Maximum ${MAX_IMAGES} images` 
                      : 'Cliquer pour ajouter'
                    }
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={images.length >= MAX_IMAGES}
                />
              </label>
            </div>

            {/* Liste des images */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Images ({images.length})
              </h3>
              
              <div className="space-y-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedImageIndex === index 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={image.url}
                        alt={`Miniature ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">
                          Image {index + 1}
                        </span>
                        {image.isPrimary && (
                          <Star className="w-3 h-3 text-yellow-500" />
                        )}
                        {image.isNew && (
                          <span className="text-xs bg-green-100 text-green-700 px-1 rounded">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {!image.isPrimary && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryImage(index);
                          }}
                          className="p-1 hover:bg-yellow-100 rounded"
                          title="Définir comme principale"
                        >
                          <Star className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• L'image principale s'affiche en premier</li>
                  <li>• Utilisez des images de bonne qualité</li>
                  <li>• Montrez différents angles du terrain</li>
                  <li>• Maximum {MAX_IMAGES} images par terrain</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={uploading || images.filter(img => img.isNew).length === 0}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Sauvegarder</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainImagesManager; 