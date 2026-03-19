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

    qr_stream = _build_validation_qr(reservation)
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


def _build_validation_qr(reservation: Reservation) -> BytesIO:
    """Build a QR code encoding a validation URL the manager can scan."""
    frontend_url = getattr(settings, 'FRONTEND_URL', 'https://kalelsamatch.com')
    # URL that opens the manager validation page with the ticket code pre-filled
    validation_url = f"{frontend_url}/manager/qr-scanner?code={reservation.code_ticket}"
    return _build_qr_code(validation_url)


def generate_ticket_image(reservation: Reservation) -> bytes:
    """Generate a premium PNG ticket with modern design."""
    import logging
    logger = logging.getLogger(__name__)
    logger.info("START generate_ticket_image")
    try:
        width, height = 1080, 1920
        image = Image.new('RGB', (width, height), '#FFFFFF')
        draw = ImageDraw.Draw(image)

        # ── Header gradient ──────────────────────────────────
        header_height = 300
        for i in range(header_height):
            r = int(4 + (i / header_height) * 12)
            g = int(120 + (i / header_height) * 40)
            b = int(87 + (i / header_height) * 20)
            draw.rectangle((0, i, width, i + 1), fill=(r, g, b))

        # Decorative squares
        sq = 50
        for x in range(0, width, sq * 2):
            for y in range(0, header_height - 60, sq * 2):
                draw.rectangle((x, y, x + sq - 15, y + sq - 15), fill='#047857')

        # Logo
        logo_path = _get_logo_path()
        if logo_path and logo_path.exists():
            try:
                logo = Image.open(logo_path).convert('RGBA')
                max_w, max_h = 200, 110
                ratio = min(max_w / logo.width, max_h / logo.height)
                resized = logo.resize((int(logo.width * ratio), int(logo.height * ratio)), Image.LANCZOS)
                image.paste(resized, (60, 50), resized)
            except Exception:
                pass

        # Fonts
        title_font = _load_font(56, bold=True)
        subtitle_font = _load_font(30)
        heading_font = _load_font(38, bold=True)
        body_font = _load_font(30)
        label_font = _load_font(24, bold=True)
        small_font = _load_font(22)
        value_font = _load_font(34)
        code_font = _load_font(52, bold=True)

        # Header text
        draw.text((60, header_height - 110), 'TICKET DE RÉSERVATION', font=title_font, fill='white')
        draw.text((60, header_height - 50), 'Confirmée', font=subtitle_font, fill='#A7F3D0')
        ticket_id = f'#{reservation.code_ticket or reservation.id}'
        draw.text((60, header_height - 18), ticket_id, font=small_font, fill='#FCD34D')

        # ── Card area ────────────────────────────────────────
        pad = 50
        card_top = header_height + 30
        card_bottom = height - 90

        # Shadow + card
        draw.rounded_rectangle((pad + 6, card_top + 6, width - pad + 6, card_bottom + 6),
                               radius=28, fill='#D1D5DB')
        draw.rounded_rectangle((pad, card_top, width - pad, card_bottom),
                               radius=28, fill='white')

        cx = pad + 40  # content x
        cw = width - pad - 40  # content right

        # ── Terrain ──────────────────────────────────────────
        y = card_top + 40
        draw.rounded_rectangle((cx, y, cx + 6, y + 50), radius=3, fill='#059669')
        draw.text((cx + 20, y), 'TERRAIN', font=label_font, fill='#059669')
        draw.text((cx + 20, y + 35), reservation.terrain.nom[:45], font=heading_font, fill='#111827')
        draw.text((cx + 20, y + 80), (reservation.terrain.adresse or 'Adresse non renseignée')[:55],
                  font=body_font, fill='#6B7280')

        # Divider
        y += 130
        draw.rectangle((cx, y, cw, y + 1), fill='#E5E7EB')

        # ── Date & Heure ─────────────────────────────────────
        y += 20
        draw.rounded_rectangle((cx, y, cx + 6, y + 50), radius=3, fill='#059669')
        draw.text((cx + 20, y), 'DATE & HEURE', font=label_font, fill='#059669')
        start = timezone.localtime(reservation.date_debut)
        end = timezone.localtime(reservation.date_fin)
        draw.text((cx + 20, y + 35), start.strftime('%A %d %B %Y').capitalize(),
                  font=value_font, fill='#111827')
        draw.text((cx + 20, y + 75), f"{start.strftime('%Hh%M')} - {end.strftime('%Hh%M')}",
                  font=body_font, fill='#6B7280')
        duration = int((reservation.date_fin - reservation.date_debut).total_seconds() / 60)
        draw.text((cx + 20, y + 110), f'Durée : {duration} min', font=small_font, fill='#9CA3AF')

        y += 150
        draw.rectangle((cx, y, cw, y + 1), fill='#E5E7EB')

        # ── Client ───────────────────────────────────────────
        y += 20
        draw.rounded_rectangle((cx, y, cx + 6, y + 50), radius=3, fill='#059669')
        draw.text((cx + 20, y), 'CLIENT', font=label_font, fill='#059669')
        client_name = f"{reservation.user.prenom} {reservation.user.nom}"
        draw.text((cx + 20, y + 35), client_name, font=value_font, fill='#111827')
        draw.text((cx + 20, y + 75), reservation.user.email or '', font=body_font, fill='#6B7280')
        phone = getattr(reservation, 'telephone', '') or ''
        if phone:
            draw.text((cx + 20, y + 110), phone, font=body_font, fill='#6B7280')

        y += 150
        draw.rectangle((cx, y, cw, y + 1), fill='#E5E7EB')

        # ── Paiement ─────────────────────────────────────────
        y += 20
        draw.rounded_rectangle((cx, y, cx + 6, y + 50), radius=3, fill='#059669')
        draw.text((cx + 20, y), 'PAIEMENT', font=label_font, fill='#059669')
        montant_total = getattr(reservation, 'montant_total', None)
        montant_str = f"{float(montant_total):,.0f} FCFA" if montant_total is not None else 'N/A'
        draw.text((cx + 20, y + 35), montant_str, font=heading_font, fill='#059669')
        # Status pill
        draw.rounded_rectangle((cx + 20, y + 85, cx + 260, y + 120), radius=18, fill='#10B981')
        draw.text((cx + 40, y + 90), 'CONFIRMEE', font=small_font, fill='white')

        y += 145
        draw.rectangle((cx, y, cw, y + 1), fill='#E5E7EB')

        # ── QR Code centré ───────────────────────────────────
        y += 25
        qr_section_h = 340
        # Subtle green border box for QR area
        draw.rounded_rectangle((cx, y, cw, y + qr_section_h), radius=20, outline='#059669', width=2)

        # QR title
        draw.text((cx + 20, y + 15), 'SCANNEZ POUR VALIDER', font=label_font, fill='#059669')
        draw.text((cx + 20, y + 45), 'Le gestionnaire scanne ce QR à l\'entrée',
                  font=small_font, fill='#6B7280')

        # Generate QR with validation URL
        logger.info("Before QR")
        qr_stream = _build_validation_qr(reservation)
        qr_stream.seek(0)
        qr_img = Image.open(qr_stream)
        qr_size = 220
        qr_resized = qr_img.resize((qr_size, qr_size), Image.LANCZOS)

        # Center QR in the box
        qr_x = (cx + cw) // 2 - qr_size // 2
        qr_y_pos = y + 80

        # White background behind QR
        qr_pad = 15
        draw.rounded_rectangle((qr_x - qr_pad, qr_y_pos - qr_pad,
                                qr_x + qr_size + qr_pad, qr_y_pos + qr_size + qr_pad),
                               radius=12, fill='white', outline='#E5E7EB', width=1)
        image.paste(qr_resized, (qr_x, qr_y_pos))
        logger.info("QR pasted")

        y += qr_section_h + 20

        # ── Code réservation ─────────────────────────────────
        draw.rounded_rectangle((cx, y, cx + 6, y + 50), radius=3, fill='#111827')
        draw.text((cx + 20, y), 'CODE RÉSERVATION', font=label_font, fill='#111827')
        code = reservation.code_ticket or '---'
        # Code box
        code_box_w = 380
        code_box_h = 70
        draw.rounded_rectangle((cx + 20, y + 40, cx + 20 + code_box_w, y + 40 + code_box_h),
                               radius=12, fill='#F3F4F6')
        draw.text((cx + 40, y + 52), code, font=code_font, fill='#111827')

        y += 130

        # ── Instructions ─────────────────────────────────────
        draw.text((cx, y), 'INSTRUCTIONS', font=label_font, fill='#6B7280')
        instructions = [
            'Présentez ce ticket ou le QR code à l\'entrée du terrain',
            'Arrivez 15 min avant le début de votre session',
            'Ce ticket est personnel et non transférable',
            'Contactez le gestionnaire pour toute modification',
        ]
        for idx, text in enumerate(instructions):
            iy = y + 35 + idx * 32
            draw.text((cx + 10, iy), f'{idx + 1}.', font=small_font, fill='#059669')
            draw.text((cx + 35, iy), text, font=small_font, fill='#4B5563')

        # ── Footer ───────────────────────────────────────────
        footer_y = height - 80
        draw.rectangle((0, footer_y, width, height), fill='#059669')
        footer_text = 'Kalel Sa Match  •  kalelsamatch.com'
        footer_font = _load_font(22)
        bbox = draw.textbbox((0, 0), footer_text, font=footer_font)
        tw = bbox[2] - bbox[0]
        draw.text(((width - tw) // 2, footer_y + 28), footer_text, font=footer_font, fill='white')

        logger.info("Before save")
        output = BytesIO()
        image.save(output, format='PNG', optimize=True, quality=95)
        output.seek(0)
        logger.info("END generate_ticket_image")
        return output.read()
    except Exception as e:
        logger.exception("generate_ticket_image failed")
        raise
