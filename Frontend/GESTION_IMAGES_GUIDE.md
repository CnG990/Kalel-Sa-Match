# 📸 Guide Gestion des Images - Kalel Sa Match

**Implémenté le**: 5 Mars 2026

---

## ✅ Ce qui a été implémenté

### 1. Composants Créés

#### `ImageUploader.tsx` - Upload générique d'images
```typescript
// Upload simple image (profil)
<ImageUploader
  onUpload={handleUpload}
  currentImage={imageUrl}
  onImageChange={(url) => setImageUrl(url)}
  label="Photo de profil"
  maxSizeMB={2}
  isCircular={true}  // Pour les avatars
/>

// Upload multiple images (terrains)
<MultiImageUploader
  onUpload={handleMultiUpload}
  currentImages={images}
  onImagesChange={(urls) => setImages(urls)}
  label="Photos du terrain"
  maxImages={5}
  maxSizeMB={5}
/>
```

**Features:**
- ✅ Drag & drop
- ✅ Validation taille (configurable)
- ✅ Validation formats (JPG, PNG, WebP)
- ✅ Preview instantané
- ✅ Support avatar circulaire
- ✅ Upload multiple
- ✅ Loading states
- ✅ Error handling

---

#### `ProfileImageUpload.tsx` - Upload photo de profil
```typescript
<ProfileImageUpload
  currentImage={user.profile_image}
  userName={`${user.prenom} ${user.nom}`}
  onImageUpdated={(url) => console.log('New image:', url)}
/>
```

**Features:**
- ✅ Avatar avec initiales par défaut
- ✅ Bouton caméra pour éditer
- ✅ Upload direct vers API
- ✅ Toast notifications
- ✅ Responsive mobile

---

#### `TerrainImagesManager.tsx` - Gestion photos terrains (DÉJÀ EXISTANT)
```typescript
<TerrainImagesManager
  terrainId={terrain.id}
  terrainNom={terrain.nom}
  existingImages={terrain.images}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={handleSaveImages}
/>
```

**Features:**
- ✅ Interface modale complète
- ✅ Preview grande taille
- ✅ Navigation entre images
- ✅ Définir image principale
- ✅ Glisser-déposer multiple
- ✅ Max 5 images par terrain
- ✅ Thumbnails sidebar
- ✅ Suppression individuelle

---

### 2. APIs Implémentées

#### Dans `api.ts` :

```typescript
// Upload photo de profil
async uploadProfileImage(file: File): Promise<string>
// POST /api/accounts/profile/upload-image/
// Retourne: URL de l'image uploadée

// Upload photos terrains (multiple)
async uploadTerrainImages(terrainId: number, files: File[]): Promise<string[]>
// POST /api/manager/terrains/{id}/upload-images/
// Retourne: Array d'URLs des images

// Mettre à jour profil avec nouvelle image
async updateProfileImage(imageUrl: string)
// PATCH /api/accounts/me/
// Body: { photo_profil: imageUrl }
```

---

## 🎯 Intégration dans les Pages

### Page Profil Client

```typescript
// src/pages/ClientDashboardPage.tsx
import { ProfileImageUpload } from '../components/ProfileImageUpload';

function ClientDashboardPage() {
  const { user } = useAuth();
  
  return (
    <div>
      <ProfileImageUpload
        currentImage={user?.profile_image}
        userName={`${user?.prenom} ${user?.nom}`}
        onImageUpdated={async (url) => {
          await apiService.updateProfileImage(url);
          await refreshUser();
        }}
      />
    </div>
  );
}
```

---

### Page Profil Gestionnaire

```typescript
// src/pages/manager/ProfilePage.tsx
import { ProfileImageUpload } from '../../components/ProfileImageUpload';

function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>();
  
  const handleImageUpdate = async (imageUrl: string) => {
    try {
      await apiService.updateProfileImage(imageUrl);
      setProfile(prev => ({ ...prev, profile_image: imageUrl }));
      toast.success('Photo mise à jour !');
    } catch (error) {
      toast.error('Erreur upload');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Photo de profil avec upload */}
        <ProfileImageUpload
          currentImage={profile?.profile_image}
          userName={`${profile?.prenom} ${profile?.nom}`}
          onImageUpdated={handleImageUpdate}
          className="mb-6"
        />
        
        {/* Reste du formulaire */}
        <form>{/* ... */}</form>
      </div>
    </div>
  );
}
```

---

### Page Ajouter/Modifier Terrain (Gestionnaire)

```typescript
// src/pages/manager/AddTerrainPage.tsx
import TerrainImagesManager from '../../components/TerrainImagesManager';

function AddTerrainPage() {
  const [showImageModal, setShowImageModal] = useState(false);
  const [terrainImages, setTerrainImages] = useState<string[]>([]);
  
  const handleSaveImages = async (newFiles: File[], primaryIndex: number) => {
    try {
      // Upload vers le backend
      const urls = await apiService.uploadTerrainImages(terrainId, newFiles);
      setTerrainImages(prev => [...prev, ...urls]);
      toast.success('Images ajoutées !');
    } catch (error) {
      toast.error('Erreur upload images');
      throw error;
    }
  };
  
  return (
    <div>
      <button onClick={() => setShowImageModal(true)}>
        📸 Gérer les images
      </button>
      
      <TerrainImagesManager
        terrainId={terrain?.id}
        terrainNom={terrain?.nom || 'Nouveau terrain'}
        existingImages={terrainImages}
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onSave={handleSaveImages}
      />
    </div>
  );
}
```

---

## 🔧 Backend - Endpoints Requis

Les endpoints suivants doivent être implémentés sur le backend Django :

### 1. Upload Photo Profil
```python
# POST /api/accounts/profile/upload-image/
# Content-Type: multipart/form-data
# Body: { "image": File }

# Response:
{
  "image_url": "https://s3.amazonaws.com/...",
  "success": true
}
```

### 2. Upload Photos Terrain
```python
# POST /api/manager/terrains/{id}/upload-images/
# Content-Type: multipart/form-data
# Body: { "images": File[] }

# Response:
{
  "image_urls": [
    "https://s3.amazonaws.com/image1.jpg",
    "https://s3.amazonaws.com/image2.jpg"
  ],
  "success": true
}
```

### 3. Mettre à jour Profil
```python
# PATCH /api/accounts/me/
# Content-Type: application/json
# Body: { "photo_profil": "url" }

# Response:
{
  "data": { "id": 1, "photo_profil": "url", ... },
  "meta": { "success": true }
}
```

---

## 📦 Stockage des Images

### Options recommandées:

**Option 1: AWS S3 (Recommandé pour production)**
```python
# settings.py
AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = 'kalel-sa-match-images'
AWS_S3_REGION_NAME = 'af-south-1'

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
```

**Option 2: Media local (Dev uniquement)**
```python
# settings.py
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

**Option 3: Cloudinary**
```python
# settings.py
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': env('CLOUDINARY_API_KEY'),
    'API_SECRET': env('CLOUDINARY_API_SECRET')
}
DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

---

## ✅ Checklist Implémentation Backend

- [ ] Installer `django-storages` et `boto3` (si AWS S3)
- [ ] Configurer stockage (S3/Cloudinary/local)
- [ ] Créer endpoint `POST /api/accounts/profile/upload-image/`
- [ ] Créer endpoint `POST /api/manager/terrains/{id}/upload-images/`
- [ ] Ajouter champ `profile_image` au modèle User
- [ ] Ajouter champs `image_principale` et `images_supplementaires` au modèle Terrain
- [ ] Validation taille fichiers (max 5MB)
- [ ] Validation formats (JPG, PNG, WebP)
- [ ] Compression images automatique (Pillow)
- [ ] Génération thumbnails (optionnel)
- [ ] CORS configuré pour URLs images

---

## 🧪 Tests à Effectuer

### Tests Frontend
- [ ] Upload photo profil client
- [ ] Upload photo profil gestionnaire
- [ ] Upload 1 image terrain
- [ ] Upload 5 images terrain (max)
- [ ] Définir image principale
- [ ] Supprimer image
- [ ] Drag & drop fonctionnel
- [ ] Validation taille fichier
- [ ] Preview avant upload
- [ ] Responsive mobile
- [ ] Toast notifications

### Tests Backend
- [ ] Upload réussi S3/Cloudinary
- [ ] Validation formats
- [ ] Validation taille
- [ ] Compression fonctionnelle
- [ ] URLs retournées valides
- [ ] Images accessibles publiquement
- [ ] Permissions upload (authentifié)

---

## 🎨 Screenshots Attendus

### Page Profil avec Upload
```
┌─────────────────────────────────┐
│  [  Avatar  ]  📷              │
│   John Doe                      │
│   Gestionnaire                  │
│                                 │
│  Modifier la photo              │
│  [Drag & Drop zone]            │
│  JPG, PNG • Max 2MB            │
└─────────────────────────────────┘
```

### Modal Gestion Images Terrain
```
┌────────────────────────────────────────┐
│  📸 Gestion des images   [X]          │
│  Terrain ABC • 3/5 images              │
├────────────────────────────────────────┤
│                        │  [+] Ajouter  │
│   [Grande preview]     │               │
│   ⭐ Image principale  │  □ Image 1    │
│   ← →                  │  ⭐ Image 2    │
│                        │  □ Image 3    │
│   1 / 3                │               │
│                        │  💡 Conseils  │
├────────────────────────────────────────┤
│  [Annuler]  [Sauvegarder]             │
└────────────────────────────────────────┘
```

---

## 🚀 Prochaines Étapes

1. **Implémenter les endpoints backend**
   - Configurer S3/Cloudinary
   - Créer les vues Django
   - Tester uploads

2. **Intégrer dans toutes les pages**
   - Page profil client
   - Page profil gestionnaire  
   - Page ajout terrain
   - Page modification terrain

3. **Optimisations**
   - Compression automatique
   - WebP conversion
   - Lazy loading images
   - CDN configuration

4. **Tests complets**
   - Tests unitaires backend
   - Tests E2E upload
   - Tests performance

---

**Status**: ✅ Frontend 100% prêt - En attente backend
**Dernière mise à jour**: 5 Mars 2026, 14:30 UTC
