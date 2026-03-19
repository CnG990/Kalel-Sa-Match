from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
from PIL import Image
import os
import uuid


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_profile_image(request):
    """
    Upload et traite une photo de profil utilisateur
    """
    if 'image' not in request.FILES:
        return Response(
            {'detail': 'Aucune image fournie'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    image_file = request.FILES['image']
    
    # Validation du type de fichier
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if image_file.content_type not in allowed_types:
        return Response(
            {'detail': 'Format non supporté. Utilisez JPG, PNG ou WebP'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validation de la taille (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if image_file.size > max_size:
        return Response(
            {'detail': f'Image trop volumineuse. Maximum {max_size / (1024*1024)}MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Générer un nom unique
        ext = os.path.splitext(image_file.name)[1].lower()
        if not ext:
            ext = '.jpg'
        filename = f'profiles/{request.user.id}_{uuid.uuid4().hex}{ext}'
        
        # Ouvrir et compresser l'image
        img = Image.open(image_file)
        
        # Convertir en RGB si nécessaire (pour PNG avec transparence)
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        
        # Redimensionner si trop grande (max 800x800 pour profil)
        max_dimension = 800
        if img.width > max_dimension or img.height > max_dimension:
            img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        
        # Sauvegarder dans un buffer temporaire
        from io import BytesIO
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85, optimize=True)
        buffer.seek(0)
        
        # Sauvegarder le fichier
        saved_path = default_storage.save(filename, buffer)
        
        # Générer l'URL complète
        if hasattr(settings, 'MEDIA_URL') and settings.MEDIA_URL:
            image_url = f"{settings.MEDIA_URL}{saved_path}"
        else:
            image_url = f"/media/{saved_path}"
        
        # Mettre à jour le profil utilisateur
        request.user.profile_image_url = image_url
        request.user.save(update_fields=['profile_image_url'])
        
        return Response({
            'success': True,
            'image_url': image_url,
            'url': image_url,
            'message': 'Photo de profil mise à jour avec succès'
        })
        
    except Exception as e:
        return Response(
            {'detail': f'Erreur lors du traitement de l\'image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
