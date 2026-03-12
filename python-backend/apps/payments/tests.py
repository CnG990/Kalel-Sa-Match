from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Payment, WavePayment, OrangeMoneyPayment

User = get_user_model()


class PaymentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

    def test_payment_creation(self):
        payment = Payment.objects.create(
            reference='TEST-001',
            montant=5000,
            methode='wave',
            user=self.user
        )
        self.assertEqual(payment.reference, 'TEST-001')
        self.assertEqual(payment.montant, 5000)
        self.assertEqual(payment.statut, 'en_attente')

    def test_wave_payment_creation(self):
        payment = Payment.objects.create(
            reference='TEST-002',
            montant=10000,
            methode='wave',
            user=self.user
        )
        wave_payment = WavePayment.objects.create(
            payment=payment,
            customer_phone='771234567',
            customer_name='Test User'
        )
        self.assertEqual(wave_payment.payment, payment)
        self.assertEqual(wave_payment.customer_phone, '771234567')
