from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.conf import settings
from apps.terrains.models import TerrainSynthetiquesDakar
from PIL import Image
import os
import uuid


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_terrain_images(request, terrain_id):
    """
    Upload plusieurs images pour un terrain
    Le gestionnaire doit être propriétaire du terrain
    """
    try:
        terrain = TerrainSynthetiquesDakar.objects.get(id=terrain_id)
    except TerrainSynthetiquesDakar.DoesNotExist:
        return Response(
            {'detail': 'Terrain non trouvé'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Vérifier que l'utilisateur est gestionnaire et propriétaire
    if not hasattr(request.user, 'role') or request.user.role != 'gestionnaire':
        return Response(
            {'detail': 'Seuls les gestionnaires peuvent uploader des images'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if terrain.gestionnaire_id != request.user.id:
        return Response(
            {'detail': 'Vous n\'êtes pas le gestionnaire de ce terrain'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Récupérer les images uploadées
    images = request.FILES.getlist('images')
    if not images:
        return Response(
            {'detail': 'Aucune image fournie'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Limiter à 5 images max
    if len(images) > 5:
        return Response(
            {'detail': 'Maximum 5 images autorisées'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    uploaded_urls = []
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    max_size = 5 * 1024 * 1024  # 5MB
    
    for idx, image_file in enumerate(images):
        # Validation du type
        if image_file.content_type not in allowed_types:
            return Response(
                {'detail': f'{image_file.name}: Format non supporté. Utilisez JPG, PNG ou WebP'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validation de la taille
        if image_file.size > max_size:
            return Response(
                {'detail': f'{image_file.name}: Trop volumineux (max 5MB)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Générer un nom unique
            ext = os.path.splitext(image_file.name)[1].lower()
            if not ext:
                ext = '.jpg'
            filename = f'terrains/{terrain_id}/{uuid.uuid4().hex}{ext}'
            
            # Ouvrir et traiter l'image
            img = Image.open(image_file)
            
            # Convertir en RGB si nécessaire
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Redimensionner si trop grande (max 1920x1080)
            max_width, max_height = 1920, 1080
            if img.width > max_width or img.height > max_height:
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Sauvegarder
            from io import BytesIO
            buffer = BytesIO()
            img.save(buffer, format='JPEG', quality=90, optimize=True)
            buffer.seek(0)
            
            saved_path = default_storage.save(filename, buffer)
            
            # Générer l'URL
            if hasattr(settings, 'MEDIA_URL') and settings.MEDIA_URL:
                image_url = f"{settings.MEDIA_URL}{saved_path}"
            else:
                image_url = f"/media/{saved_path}"
            
            uploaded_urls.append(image_url)
            
            # Mettre à jour le terrain (première image = principale)
            if idx == 0 and not terrain.image_principale:
                terrain.image_principale = saved_path
                terrain.save(update_fields=['image_principale'])
            
        except Exception as e:
            return Response(
                {'detail': f'Erreur traitement {image_file.name}: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response({
        'success': True,
        'image_urls': uploaded_urls,
        'urls': uploaded_urls,
        'count': len(uploaded_urls),
        'message': f'{len(uploaded_urls)} image(s) uploadée(s) avec succès'
    })
