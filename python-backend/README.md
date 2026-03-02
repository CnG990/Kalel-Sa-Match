# Kalel Sa Match – Backend Python (Django + DRF)

Ce dossier accueillera progressivement la nouvelle implémentation backend en Python afin de remplacer l’API Laravel.

## Stack cible

- **Framework** : Django 5 + Django REST Framework
- **Base de données** : PostgreSQL/PostGIS (RDS existante)
- **Tâches asynchrones** : Celery + Redis (OTP, SMS, imports)
- **Auth** : JWT (SimpleJWT) + OTP/PIN (à porter de Laravel)
- **Config** : `django-environ`

## Pré-requis

- Python 3.12+
- PostgreSQL 15+
- Redis
- `pip`/`virtualenv` ou `poetry`

## Installation locale (à venir)

```bash
cd python-backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Configurer DB_HOST, DB_NAME, DB_USER, etc.

python manage.py migrate
python manage.py runserver 0.0.0.0:8001
```

## Étapes de migration

1. Générer le projet Django (`django-admin startproject ksm_backend`).
2. Créer les apps principales : `accounts`, `terrains`, `reservations`, `finances`, `notifications`.
3. Rejouer le schéma (`KSM.sql`) pour aligner les modèles.
4. Implémenter les endpoints REST à parité avec Laravel (auth, OTP, réservations, paiements, etc.).
5. Ajouter Celery/Redis pour les jobs (OTP, SMS, imports).
6. Tester, valider avec les clients (web/mobile), puis basculer progressivement.

La migration se fera par étapes en conservant Laravel jusqu’à parité fonctionnelle.
