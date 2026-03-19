from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta
from django.utils import timezone

from apps.terrains.models import TerrainSynthetiquesDakar
from .models import Reservation, Disponibilite, CreneauReservation

User = get_user_model()


class ReservationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            prenom='Test',
            nom='User'
        )
        self.terrain = TerrainSynthetiquesDakar.objects.create(
            nom='Terrain Test',
            description='Description test',
            adresse='Adresse test',
            latitude=14.7645,
            longitude=-17.3662,
            image_principale='test.jpg',
            prix_heure=5000,
            capacite=10
        )

    def test_reservation_creation(self):
        date_debut = timezone.now() + timedelta(hours=2)
        date_fin = date_debut + timedelta(hours=3)
        
        reservation = Reservation.objects.create(
            terrain=self.terrain,
            user=self.user,
            date_debut=date_debut,
            date_fin=date_fin,
            duree_heures=1,
            montant_total=5000
        )
        
        self.assertEqual(reservation.terrain, self.terrain)
        self.assertEqual(reservation.user, self.user)
        self.assertEqual(reservation.statut, 'en_attente')
        self.assertEqual(reservation.montant_total, 5000)

    def test_reservation_validation(self):
        reservation = Reservation.objects.create(
            terrain=self.terrain,
            user=self.user,
            date_debut=timezone.now() + timedelta(hours=2),
            date_fin=timezone.now() + timedelta(hours=3),
            duree_heures=1,
            montant_total=5000
        )
        
        # Valider la réservation
        reservation.valider(self.user)
        self.assertEqual(reservation.statut, 'confirmee')
        self.assertEqual(reservation.valide_par, self.user)

    def test_reservation_annulation(self):
        reservation = Reservation.objects.create(
            terrain=self.terrain,
            user=self.user,
            date_debut=timezone.now() + timedelta(hours=2),
            date_fin=timezone.now() + timedelta(hours=3),
            duree_heures=1,
            montant_total=5000
        )
        
        # Annuler la réservation
        reservation.annuler('Test annulation')
        self.assertEqual(reservation.statut, 'annulee')
        self.assertEqual(reservation.motif_annulation, 'Test annulation')

    def test_qr_code_token_generation(self):
        reservation = Reservation.objects.create(
            terrain=self.terrain,
            user=self.user,
            date_debut=timezone.now() + timedelta(hours=2),
            date_fin=timezone.now() + timedelta(hours=3),
            duree_heures=1,
            montant_total=5000
        )
        
        # Générer le token QR code
        token = reservation.generer_qr_code_token()
        self.assertIsNotNone(token)
        self.assertEqual(reservation.qr_code_token, token)


class DisponibiliteModelTest(TestCase):
    def setUp(self):
        self.terrain = TerrainSynthetiquesDakar.objects.create(
            nom='Terrain Test',
            description='Description test',
            adresse='Adresse test',
            latitude=14.7645,
            longitude=-17.3662,
            image_principale='test.jpg',
            prix_heure=5000,
            capacite=10
        )

    def test_disponibilite_creation(self):
        disponibilite = Disponibilite.objects.create(
            terrain=self.terrain,
            date=datetime.now().date(),
            heure_debut=datetime.time(14, 0),
            heure_fin=datetime.time(15, 0),
            est_disponible=True
        )
        
        self.assertEqual(disponibilite.terrain, self.terrain)
        self.assertTrue(disponibilite.est_disponible)
