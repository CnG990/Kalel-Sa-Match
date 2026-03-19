import React, { useState } from 'react';
import { Camera, User } from 'lucide-react';
import apiService from '../services/api';
import { ImageUploader } from './ImageUploader';

interface ProfileImageUploadProps {
  currentImage?: string;
  userName?: string;
  onImageUpdated?: (imageUrl: string) => void;
  className?: string;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  userName = 'Utilisateur',
  onImageUpdated,
  className = '',
}) => {
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [showUploader, setShowUploader] = useState(false);

  const handleUpload = async (file: File): Promise<string> => {
    try {
      const uploadedUrl = await apiService.uploadProfileImage(file);
      setImageUrl(uploadedUrl);
      onImageUpdated?.(uploadedUrl);
      setShowUploader(false);
      return uploadedUrl;
    } catch (error) {
      console.error('Erreur upload:', error);
      throw error;
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Avatar actuel */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 shadow-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-white" />
            </div>
          )}
        </div>
        
        {/* Bouton de modification */}
        <button
          onClick={() => setShowUploader(!showUploader)}
          className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border-2 border-green-500 hover:bg-green-50 transition-colors"
          title="Modifier la photo"
        >
          <Camera className="w-5 h-5 text-green-600" />
        </button>
      </div>

      {/* Nom utilisateur */}
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{userName}</h3>

      {/* Uploader */}
      {showUploader && (
        <div className="mt-4 w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <ImageUploader
              onUpload={handleUpload}
              currentImage={imageUrl}
              onImageChange={(url) => setImageUrl(url)}
              label="Changer votre photo de profil"
              maxSizeMB={2}
              isCircular={true}
            />
            <button
              onClick={() => setShowUploader(false)}
              className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
