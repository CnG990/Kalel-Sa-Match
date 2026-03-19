from rest_framework.response import Response
from rest_framework import status
from typing import Any, Optional, Dict


def api_success(data: Any = None, message: str = "Success", http_status: int = status.HTTP_200_OK) -> Response:
    """
    Format de réponse standardisé pour les succès
    {
        "data": data,
        "meta": {
            "status": "success",
            "message": message
        }
    }
    """
    return Response({
        "data": data,
        "meta": {
            "status": "success",
            "message": message
        }
    }, status=http_status)


def api_error(message: str = "Error", http_status: int = status.HTTP_400_BAD_REQUEST, errors: Optional[Dict] = None) -> Response:
    """
    Format de réponse standardisé pour les erreurs
    {
        "data": None,
        "meta": {
            "status": "error",
            "message": message,
            "errors": errors
        }
    }
    """
    response_data = {
        "data": None,
        "meta": {
            "status": "error",
            "message": message
        }
    }
    
    if errors:
        response_data["meta"]["errors"] = errors
    
    return Response(response_data, status=http_status)


def api_paginated(data: Any, pagination: Dict, message: str = "Success") -> Response:
    """
    Format de réponse pour les données paginées
    {
        "data": {
            "results": [...],
            "count": 150,
            "current_page": 1,
            "last_page": 10,
            "next": "...",
            "previous": null
        },
        "meta": {
            "status": "success",
            "message": message
        }
    }
    """
    return Response({
        "data": {
            "results": data,
            **pagination
        },
        "meta": {
            "status": "success",
            "message": message
        }
    })
