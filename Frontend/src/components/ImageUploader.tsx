import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>;
  currentImage?: string;
  onImageChange?: (url: string) => void;
  label?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  isCircular?: boolean;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  currentImage,
  onImageChange,
  label = 'Télécharger une image',
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  isCircular = false,
  className = '',
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // Validation taille
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      toast.error(`L'image ne doit pas dépasser ${maxSizeMB}MB (${fileSizeMB.toFixed(1)}MB)`);
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setUploaded(false);
    
    try {
      const imageUrl = await onUpload(file);
      setUploaded(true);
      onImageChange?.(imageUrl);
      toast.success('Image téléchargée avec succès !');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléchargement');
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  }, [onUpload, maxSizeMB, currentImage, onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
    maxFiles: 1,
    multiple: false,
  });

  const removeImage = () => {
    setPreview(null);
    setUploaded(false);
    onImageChange?.('');
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <div className={`relative overflow-hidden bg-gray-100 ${
              isCircular ? 'w-32 h-32 rounded-full mx-auto' : 'w-full aspect-video rounded-lg'
            }`}>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              
              {uploaded && !uploading && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
            } ${isCircular ? 'w-32 h-32 mx-auto flex items-center justify-center rounded-full' : ''}`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center justify-center space-y-2">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-green-500" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
              
              <div className={`text-sm ${isCircular ? 'hidden sm:block' : ''}`}>
                <p className="text-gray-600 font-medium">
                  {isDragActive ? 'Déposez l\'image ici' : 'Cliquez ou glissez'}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Max {maxSizeMB}MB - JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface MultiImageUploaderProps {
  onUpload: (files: File[]) => Promise<string[]>;
  currentImages?: string[];
  onImagesChange?: (urls: string[]) => void;
  label?: string;
  maxImages?: number;
  maxSizeMB?: number;
  className?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  onUpload,
  currentImages = [],
  onImagesChange,
  label = 'Télécharger des images',
  maxImages = 5,
  maxSizeMB = 5,
  className = '',
}) => {
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const remainingSlots = maxImages - previews.length;
    if (acceptedFiles.length > remainingSlots) {
      toast.error(`Vous pouvez ajouter maximum ${remainingSlots} image(s) supplémentaire(s)`);
      return;
    }

    // Validation taille
    for (const file of acceptedFiles) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        toast.error(`${file.name} dépasse ${maxSizeMB}MB`);
        return;
      }
    }

    // Previews locaux
    const newPreviews: string[] = [];
    for (const file of acceptedFiles) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === acceptedFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    // Upload
    setUploading(true);
    try {
      const imageUrls = await onUpload(acceptedFiles);
      onImagesChange?.([...currentImages, ...imageUrls]);
      toast.success(`${acceptedFiles.length} image(s) téléchargée(s) !`);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors du téléchargement');
      setPreviews(currentImages);
    } finally {
      setUploading(false);
    }
  }, [previews, maxImages, maxSizeMB, currentImages, onUpload, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/jpg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: maxImages - previews.length,
    multiple: true,
  });

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesChange?.(newPreviews);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} ({previews.length}/{maxImages})
        </label>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {previews.map((preview, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all opacity-0 group-hover:opacity-100"
              disabled={uploading}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {previews.length < maxImages && (
          <div
            {...getRootProps()}
            className={`aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-500 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center p-4">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
              ) : isDragActive ? (
                <Upload className="w-8 h-8 text-green-500 mx-auto" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto" />
              )}
              <p className="text-xs text-gray-500 mt-2">Ajouter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
