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
    """Generate a premium PNG ticket with modern design."""
    import logging
    logger = logging.getLogger(__name__)
    logger.info("START generate_ticket_image")
    try:
        width, height = 1080, 1920
        image = Image.new('RGB', (width, height), '#FFFFFF')
        draw = ImageDraw.Draw(image)
        logger.info("Image created")
    
        # Modern gradient header
        header_height = 320
        # Create gradient effect with rectangles
        for i in range(header_height):
            color_intensity = int(59 + (i / header_height) * 20)  # Dark to lighter green
            draw.rectangle((0, i, width, i + 1), fill=f'#{color_intensity:02x}{180:02x}{120:02x}')
    
        # Decorative pattern
        pattern_size = 60
        for x in range(0, width, pattern_size * 2):
            for y in range(0, header_height, pattern_size * 2):
                draw.rectangle((x, y, x + pattern_size - 20, y + pattern_size - 20), 
                             fill='#047857', outline=None)
    
        # Logo
        logo_path = _get_logo_path()
        if logo_path and logo_path.exists():
            try:
                logo = Image.open(logo_path).convert('RGBA')
                max_w, max_h = 220, 120
                ratio = min(max_w / logo.width, max_h / logo.height)
                resized = logo.resize((int(logo.width * ratio), int(logo.height * ratio)), Image.LANCZOS)
                image.paste(resized, (80, 80), resized)
            except Exception:
                pass
    
        # Title with modern typography
        title_font = _load_font(64, bold=True)
        subtitle_font = _load_font(36)
        badge_font = _load_font(24, bold=True)
        
        # Badge
        badge_x, badge_y = width - 200, 60
        draw.rounded_rectangle((badge_x, badge_y, badge_x + 120, badge_y + 40), radius=20, fill='#FCD34D')
        draw.text((badge_x + 25, badge_y + 8), 'VIP', font=badge_font, fill='#78350F')
        
        # Main title
        draw.text((80, header_height - 120), 'TICKET', font=title_font, fill='white')
        draw.text((80, header_height - 60), 'Réservation Confirmée', font=subtitle_font, fill='#D1FAE5')
        
        # Ticket number
        ticket_id = f'#{reservation.code_ticket or reservation.id}'
        draw.text((80, header_height - 20), ticket_id, font=_load_font(28), fill='#FCD34D')
    
        # Main content area with subtle shadow
        content_padding = 60
        section_top = header_height + 40
        
        # Card background with shadow effect
        shadow_offset = 8
        draw.rounded_rectangle((content_padding + shadow_offset, section_top + shadow_offset, 
                              width - content_padding + shadow_offset, height - 120 + shadow_offset), 
                              radius=24, fill='#E5E7EB')
        draw.rounded_rectangle((content_padding, section_top, width - content_padding, height - 120), 
                              radius=24, fill='white')
        
        # Section divider
        draw.rectangle((content_padding + 40, section_top + 100, width - content_padding - 40, section_top + 102), 
                     fill='#F3F4F6')
    
        # Typography
        heading_font = _load_font(42, bold=True)
        body_font = _load_font(32)
        label_font = _load_font(26, bold=True)
        small_font = _load_font(22)
        value_font = _load_font(36)
    
        # Terrain section with icon-like design
        terrain_y = section_top + 40
        draw.text((content_padding + 40, terrain_y), '🏟', font=_load_font(48), fill='#059669')
        draw.text((content_padding + 100, terrain_y), 'TERRAIN', font=label_font, fill='#059669')
        terrain_name = reservation.terrain.nom
        draw.text((content_padding + 40, terrain_y + 45), terrain_name, font=heading_font, fill='#111827')
        terrain_address = reservation.terrain.adresse or 'Adresse non renseignée'
        draw.text((content_padding + 40, terrain_y + 95), terrain_address, font=body_font, fill='#6B7280')
    
        # Date & Time section
        datetime_y = terrain_y + 160
        draw.text((content_padding + 40, datetime_y), '📅', font=_load_font(48), fill='#059669')
        draw.text((content_padding + 100, datetime_y), 'DATE & HEURE', font=label_font, fill='#059669')
        
        start = timezone.localtime(reservation.date_debut)
        end = timezone.localtime(reservation.date_fin)
        date_str = start.strftime('%d %B %Y')
        hour_str = f"{start.strftime('%Hh%M')} - {end.strftime('%Hh%M')}"
        
        draw.text((content_padding + 40, datetime_y + 45), date_str, font=value_font, fill='#111827')
        draw.text((content_padding + 40, datetime_y + 95), hour_str, font=body_font, fill='#6B7280')
    
        # Client section
        client_y = datetime_y + 160
        draw.text((content_padding + 40, client_y), '👤', font=_load_font(48), fill='#059669')
        draw.text((content_padding + 100, client_y), 'CLIENT', font=label_font, fill='#059669')
        
        client_name = f"{reservation.user.prenom} {reservation.user.nom}"
        draw.text((content_padding + 40, client_y + 45), client_name, font=value_font, fill='#111827')
        draw.text((content_padding + 40, client_y + 95), reservation.user.email or '', font=body_font, fill='#6B7280')
    
        # Payment section with status badge
        payment_y = client_y + 160
        draw.text((content_padding + 40, payment_y), '💰', font=_load_font(48), fill='#059669')
        draw.text((content_padding + 100, payment_y), 'PAIEMENT', font=label_font, fill='#059669')
        
        montant_total = getattr(reservation, 'montant_total', None)
        montant_str = f"{float(montant_total):,.0f} FCFA" if montant_total is not None else 'N/A'
        draw.text((content_padding + 40, payment_y + 45), montant_str, font=value_font, fill='#059669')
        
        # Status badge
        badge_text = 'PAYÉ AVEC SUCCÈS'
        badge_bg = '#10B981'
        badge_text_color = 'white'
        draw.rounded_rectangle((content_padding + 40, payment_y + 95, 
                              content_padding + 40 + 280, payment_y + 95 + 40), 
                              radius=20, fill=badge_bg)
        draw.text((content_padding + 70, payment_y + 102), badge_text, font=small_font, fill=badge_text_color)
    
        # QR Code section with modern design
        qr_section_y = payment_y + 180
        qr_section_height = 380
        
        # QR section background with gradient
        qr_bg_top = qr_section_y
        qr_bg_bottom = qr_section_y + qr_section_height
        for i in range(qr_section_height):
            intensity = int(249 - (i / qr_section_height) * 10)
            draw.rectangle((content_padding, qr_bg_top + i, width - content_padding, qr_bg_top + i + 1), 
                         fill=f'#{intensity:02x}{intensity:02x}{intensity:02x}')
        
        # QR section border
        draw.rounded_rectangle((content_padding, qr_section_y, width - content_padding, qr_section_y + qr_section_height), 
                              radius=20, outline='#059669', width=3)
        
        # QR title with icon
        draw.text((content_padding + 40, qr_section_y + 30), '📱', font=_load_font(48), fill='#059669')
        draw.text((content_padding + 100, qr_section_y + 30), 'CODE QR', font=label_font, fill='#111827')
        draw.text((content_padding + 40, qr_section_y + 75), 'Scannez pour valider l\'entrée', font=small_font, fill='#6B7280')
        
        # QR code
        logger.info("Before QR")
        qr_stream = _build_qr_code(reservation.code_ticket or str(reservation.id))
        qr_stream.seek(0)
        qr_image = Image.open(qr_stream)
        qr_size = 240
        qr_resized = qr_image.resize((qr_size, qr_size), Image.LANCZOS)
        qr_x = width - content_padding - qr_size - 40
        qr_y = qr_section_y + 60
        
        # QR shadow effect
        qr_shadow = Image.new('RGBA', (qr_size + 20, qr_size + 20), (0, 0, 0, 50))
        qr_shadow_draw = ImageDraw.Draw(qr_shadow)
        qr_shadow_draw.rounded_rectangle((0, 0, qr_size + 20, qr_size + 20), radius=15, fill=(0, 0, 0, 30))
        qr_shadow_resized = qr_shadow.resize((qr_size + 20, qr_size + 20), Image.LANCZOS)
        image.paste(qr_shadow_resized, (qr_x - 10, qr_y - 10), qr_shadow_resized)
        
        # QR code with white background
        qr_bg = Image.new('RGB', (qr_size + 40, qr_size + 40), 'white')
        qr_bg_draw = ImageDraw.Draw(qr_bg)
        qr_bg_draw.rounded_rectangle((0, 0, qr_size + 40, qr_size + 40), radius=15, fill='white')
        qr_bg.paste(qr_resized, (20, 20))
        image.paste(qr_bg, (qr_x - 20, qr_y - 20))
        
        logger.info("QR pasted")
        
        # Manager scan section with alert styling
        scan_y = qr_section_y + 320
        draw.rectangle((content_padding + 20, scan_y, width - content_padding - 20, scan_y + 2), fill='#DC2626')
        draw.text((content_padding + 40, scan_y + 10), '⚠️', font=_load_font(32), fill='#DC2626')
        draw.text((content_padding + 80, scan_y + 10), 'SCAN GESTIONNAIRE', font=label_font, fill='#DC2626')
        draw.text((content_padding + 40, scan_y + 45), 'Scanner pour valider la réservation', font=small_font, fill='#6B7280')
        
        # Reservation code with highlight
        code = reservation.code_ticket or '---'
        code_y = qr_section_y + qr_section_height + 40
        draw.text((content_padding + 40, code_y), '🎫', font=_load_font(48), fill='#111827')
        draw.text((content_padding + 100, code_y), 'CODE RÉSERVATION', font=label_font, fill='#111827')
        
        # Code display with background
        code_bg_width = 400
        code_bg_height = 80
        draw.rounded_rectangle((content_padding + 40, code_y + 50, 
                              content_padding + 40 + code_bg_width, code_y + 50 + code_bg_height), 
                              radius=15, fill='#F3F4F6')
        draw.text((content_padding + 60, code_y + 75), code, font=_load_font(56, bold=True), fill='#111827')
        
        # Instructions with modern styling
        instructions_y = code_y + 160
        instructions_title = 'INSTRUCTIONS IMPORTANTES'
        draw.text((content_padding + 40, instructions_y), instructions_title, font=label_font, fill='#111827')
        
        instructions = [
            '• Présentez ce ticket ou le QR code à l\'entrée',
            '• Arrivez 15 minutes avant votre session',
            '• Ce ticket est strictement personnel et non transférable',
            '• Contactez le gestionnaire pour toute modification'
        ]
        
        for idx, instruction in enumerate(instructions):
            draw.text((content_padding + 40, instructions_y + 45 + idx * 35), instruction, font=small_font, fill='#4B5563')
        
        # Modern footer
        footer_y = height - 100
        draw.rectangle((0, footer_y, width, height), fill='#059669')
        
        # Footer content
        footer_text = 'Kalel Sa Match • kalelsamatch.duckdns.org'
        footer_font = _load_font(20)
        bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text(((width - text_w) / 2, footer_y + 35), footer_text, font=footer_font, fill='white')
        
        # Footer decorative elements
        for i in range(0, width, 40):
            draw.rectangle((i, footer_y + 10, i + 20, footer_y + 12), fill='#047857')
        
        logger.info("Before save")
        output = BytesIO()
        image.save(output, format='PNG', optimize=True, quality=95)
        output.seek(0)
        logger.info("END generate_ticket_image")
        return output.read()
    except Exception as e:
        logger.exception("generate_ticket_image failed")
        raise
