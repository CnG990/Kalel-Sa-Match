from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import DeviceToken


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def register_device(request):
    """Enregistrer un token FCM pour recevoir des notifications push"""
    fcm_token = request.data.get('fcm_token')
    device_type = request.data.get('device_type', 'web')
    
    if not fcm_token:
        return Response(
            {'meta': {'success': False, 'message': 'fcm_token requis'}},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Créer ou mettre à jour le token
    device, created = DeviceToken.objects.update_or_create(
        fcm_token=fcm_token,
        defaults={
            'user': request.user,
            'device_type': device_type,
            'is_active': True
        }
    )
    
    return Response({
        'data': {
            'id': device.id,
            'device_type': device.device_type,
            'created': created
        },
        'meta': {'success': True, 'message': 'Appareil enregistré pour les notifications'}
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unregister_device(request):
    """Désactiver un token FCM"""
    fcm_token = request.data.get('fcm_token')
    
    if not fcm_token:
        return Response(
            {'meta': {'success': False, 'message': 'fcm_token requis'}},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    deleted, _ = DeviceToken.objects.filter(
        fcm_token=fcm_token,
        user=request.user
    ).delete()
    
    return Response({
        'data': {'deleted': deleted > 0},
        'meta': {'success': True, 'message': 'Appareil désenregistré'}
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def notification_status(request):
    """Vérifier si l'utilisateur a des appareils enregistrés"""
    devices = DeviceToken.objects.filter(user=request.user, is_active=True)
    
    return Response({
        'data': {
            'has_devices': devices.exists(),
            'device_count': devices.count(),
            'devices': [
                {'id': d.id, 'type': d.device_type, 'registered_at': d.created_at}
                for d in devices
            ]
        },
        'meta': {'success': True}
    })
