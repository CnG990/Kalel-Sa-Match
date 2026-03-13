from __future__ import annotations

from io import BytesIO
from pathlib import Path

import qrcode
from django.conf import settings
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A6
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PIL import Image, ImageDraw, ImageFont

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


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Load a reasonable font available in most environments."""
    font_candidates = [
        ('DejaVuSans-Bold.ttf', 'DejaVuSans.ttf') if bold else ('DejaVuSans.ttf', 'DejaVuSans.ttf'),
        ('Arial Bold.ttf', 'Arial.ttf'),
        ('arialbd.ttf', 'arial.ttf'),
    ]

    for bold_name, regular_name in font_candidates:
        try:
            name = bold_name if bold else regular_name
            return ImageFont.truetype(name, size)
        except (OSError, IOError):
            continue

    return ImageFont.load_default()


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
    qr_image = ImageReader(qr_stream)
    pdf.drawImage(qr_image, width - 40 * mm, height - 120 * mm, width=30 * mm, height=30 * mm)

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


def generate_ticket_image(reservation: Reservation) -> bytes:
    """Generate a PNG ticket built with Pillow."""
    import logging
    logger = logging.getLogger(__name__)
    logger.info("START generate_ticket_image")
    try:
        width, height = 900, 1400
        image = Image.new('RGB', (width, height), '#F4F6FB')
        draw = ImageDraw.Draw(image)
        logger.info("Image created")
    
        # Header background
        header_height = 240
        draw.rectangle((0, 0, width, header_height), fill='#0F9D58')
    
        logo_path = _get_logo_path()
        if logo_path and logo_path.exists():
            try:
                logo = Image.open(logo_path).convert('RGBA')
                max_w, max_h = 260, 120
                ratio = min(max_w / logo.width, max_h / logo.height)
                resized = logo.resize((int(logo.width * ratio), int(logo.height * ratio)), Image.LANCZOS)
                image.paste(resized, (50, 50), resized)
            except Exception:
                pass
    
        title_font = _load_font(48, bold=True)
        subtitle_font = _load_font(28)
        draw.text((50, header_height - 110), 'Ticket de réservation', font=title_font, fill='white')
        draw.text((50, header_height - 60), 'Kalel Sa Match', font=subtitle_font, fill='white')
    
        content_padding = 60
        section_top = header_height + 40
        card_radius = 40
        draw.rounded_rectangle((content_padding, section_top, width - content_padding, height - 80), radius=card_radius, fill='white')
    
        heading_font = _load_font(32, bold=True)
        body_font = _load_font(26)
        label_font = _load_font(22, bold=True)
    
        terrain_name = reservation.terrain.nom
        terrain_address = reservation.terrain.adresse or 'Adresse non renseignée'
        draw.text((content_padding + 40, section_top + 40), terrain_name, font=heading_font, fill='#111827')
        draw.text((content_padding + 40, section_top + 90), terrain_address, font=body_font, fill='#4B5563')
    
        start = timezone.localtime(reservation.date_debut)
        end = timezone.localtime(reservation.date_fin)
        date_str = start.strftime('%d %B %Y')
        hour_str = f"{start.strftime('%Hh%M')} - {end.strftime('%Hh%M')}"
    
        info_y = section_top + 170
        draw.text((content_padding + 40, info_y), 'Date', font=label_font, fill='#6B7280')
        draw.text((content_padding + 40, info_y + 36), date_str, font=body_font, fill='#111827')
        draw.text((content_padding + 40, info_y + 90), 'Heure', font=label_font, fill='#6B7280')
        draw.text((content_padding + 40, info_y + 126), hour_str, font=body_font, fill='#111827')
    
        client_y = info_y + 210
        draw.text((content_padding + 40, client_y), 'Client', font=label_font, fill='#6B7280')
        draw.text((content_padding + 40, client_y + 36), f"{reservation.user.prenom} {reservation.user.nom}", font=body_font, fill='#111827')
        draw.text((content_padding + 40, client_y + 80), reservation.user.email or '', font=body_font, fill='#4B5563')
    
        montant_total = getattr(reservation, 'montant_total', None)
        montant_str = f"{float(montant_total):,.0f} FCFA" if montant_total is not None else 'N/A'
        amount_y = client_y + 170
        draw.text((content_padding + 40, amount_y), 'Montant réglé', font=label_font, fill='#6B7280')
        draw.text((content_padding + 40, amount_y + 44), montant_str, font=heading_font, fill='#0F9D58')
    
        code = reservation.code_ticket or '---'
        code_y = amount_y + 130
        draw.text((content_padding + 40, code_y), 'Code ticket', font=label_font, fill='#6B7280')
        draw.text((content_padding + 40, code_y + 40), code, font=_load_font(40, bold=True), fill='#111827')
    
        logger.info("Before QR")
        qr_stream = _build_qr_code(reservation.code_ticket or str(reservation.id))
        qr_stream.seek(0)
        qr_image = Image.open(qr_stream)
        qr_size = 260
        qr_resized = qr_image.resize((qr_size, qr_size), Image.NEAREST)
        qr_x = width - content_padding - qr_size - 20
        qr_y = client_y
        image.paste(qr_resized, (qr_x, qr_y))
        logger.info("QR pasted")
    
        instructions_y = height - 220
        draw.text((content_padding + 40, instructions_y), 'Instructions', font=label_font, fill='#6B7280')
        bullets = [
            'Présentez ce ticket ou le QR code à l’entrée.',
            'Arrivez 15 minutes avant la session.',
            'Contactez le gestionnaire pour toute modification.',
        ]
        for idx, instruction in enumerate(bullets):
            draw.text((content_padding + 60, instructions_y + 36 + idx * 34), f"• {instruction}", font=_load_font(22), fill='#4B5563')
    
        footer_text = 'Kalel Sa Match · kalelsamatch.duckdns.org'
        footer_font = _load_font(20)
        bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((width - text_w) / 2, height - 60), footer_text, font=footer_font, fill='#9CA3AF')
    
        logger.info("Before save")
        output = BytesIO()
        image.save(output, format='PNG')
        output.seek(0)
        logger.info("END generate_ticket_image")
        return output.read()
    except Exception as e:
        logger.exception("generate_ticket_image failed")
        raise
