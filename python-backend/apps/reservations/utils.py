from __future__ import annotations

import math
from io import BytesIO
from pathlib import Path

import qrcode
from django.conf import settings
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A6
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

from .models import Reservation


def _get_logo_path() -> Path | None:
    """Return the best effort absolute path to the project logo."""
    candidate_paths = [
        settings.BASE_DIR / 'static' / 'logo.png',
        settings.BASE_DIR / 'staticfiles' / 'logo.png',
        settings.BASE_DIR.parent / 'Frontend' / 'public' / 'logo.png',
        settings.BASE_DIR.parent / 'Frontend' / 'public' / 'logo sans background.png',
    ]

    for path in candidate_paths:
        if path.exists():
            return path
    return None


def _build_qr_code(data: str) -> BytesIO:
    qr = qrcode.QRCode(version=1, box_size=6, border=2)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    output = BytesIO()
    img.save(output, format='PNG')
    output.seek(0)
    return output


def generate_ticket_pdf(reservation: Reservation) -> bytes:
    """Generate a stylised PDF ticket for the provided reservation."""
    buffer = BytesIO()
    width, height = A6  # Portable ticket size
    pdf = canvas.Canvas(buffer, pagesize=A6)

    # Background
    pdf.setFillColor(colors.HexColor('#F3F5F7'))
    pdf.rect(0, 0, width, height, fill=True, stroke=False)

    # Accent banner
    pdf.setFillColor(colors.HexColor('#0F9D58'))
    pdf.rect(0, height - 30 * mm, width, 30 * mm, fill=True, stroke=False)

    # Logo placement
    logo_path = _get_logo_path()
    if logo_path:
        pdf.drawImage(str(logo_path), 10 * mm, height - 26 * mm, width=40 * mm, height=20 * mm, mask='auto', preserveAspectRatio=True, anchor='nw')
    pdf.setFont('Helvetica-Bold', 12)
    pdf.setFillColor(colors.white)
    pdf.drawString(60 * mm, height - 18 * mm, 'Ticket de réservation')

    # Reservation info block
    pdf.setFillColor(colors.HexColor('#1F2937'))
    pdf.setFont('Helvetica-Bold', 11)
    pdf.drawString(10 * mm, height - 40 * mm, reservation.terrain.nom[:40])
    pdf.setFont('Helvetica', 9)
    pdf.drawString(10 * mm, height - 46 * mm, reservation.terrain.adresse or 'Adresse non renseignée')

    # Dates & time
    start = timezone.localtime(reservation.date_debut)
    end = timezone.localtime(reservation.date_fin)
    pdf.setFont('Helvetica-Bold', 9)
    pdf.drawString(10 * mm, height - 55 * mm, 'Date et heure')
    pdf.setFont('Helvetica', 9)
    pdf.drawString(10 * mm, height - 61 * mm, start.strftime('%d %B %Y'))
    pdf.drawString(10 * mm, height - 67 * mm, f"{start.strftime('%Hh%M')} - {end.strftime('%Hh%M')}")

    # Client block
    pdf.setFont('Helvetica-Bold', 9)
    pdf.drawString(10 * mm, height - 77 * mm, 'Client')
    pdf.setFont('Helvetica', 9)
    pdf.drawString(10 * mm, height - 83 * mm, f"{reservation.user.prenom} {reservation.user.nom}")
    pdf.drawString(10 * mm, height - 89 * mm, reservation.user.email)

    # Payment info
    montant_total = getattr(reservation, 'montant_total', None)
    montant_str = f"{float(montant_total):,.0f} FCFA" if montant_total is not None else 'N/A'
    pdf.setFont('Helvetica-Bold', 9)
    pdf.drawString(10 * mm, height - 99 * mm, 'Montant réglé')
    pdf.setFont('Helvetica', 11)
    pdf.setFillColor(colors.HexColor('#0F9D58'))
    pdf.drawString(10 * mm, height - 105 * mm, montant_str)
    pdf.setFillColor(colors.HexColor('#1F2937'))

    # Ticket code + QR
    pdf.setFont('Helvetica-Bold', 9)
    pdf.drawString(10 * mm, height - 115 * mm, 'Code ticket')
    pdf.setFont('Helvetica-Bold', 14)
    pdf.drawString(10 * mm, height - 122 * mm, reservation.code_ticket or '---')

    qr_stream = _build_qr_code(reservation.code_ticket or str(reservation.id))
    pdf.drawImage(qr_stream, width - 40 * mm, height - 120 * mm, width=30 * mm, height=30 * mm)

    # Instructions
    pdf.setFont('Helvetica-Bold', 9)
    pdf.drawString(10 * mm, height - 135 * mm, 'Instructions')
    pdf.setFont('Helvetica', 8)
    pdf.drawString(10 * mm, height - 140 * mm, '• Présentez ce ticket ou le QR code à l’entrée.')
    pdf.drawString(10 * mm, height - 146 * mm, '• Arrivez 15 minutes avant le début de votre session.')
    pdf.drawString(10 * mm, height - 152 * mm, '• Contactez le gestionnaire pour toute modification.')

    # Footer
    pdf.setFont('Helvetica', 7)
    pdf.setFillColor(colors.gray)
    pdf.drawCentredString(width / 2, 5 * mm, 'Kalel Sa Match · kalelsamatch.duckdns.org')

    pdf.save()
    buffer.seek(0)
    return buffer.read()
