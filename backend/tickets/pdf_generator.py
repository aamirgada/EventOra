import io
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader

def generate_ticket_pdf(ticket):
    """
    Generates a high-resolution, branded PDF ticket pass for Eventora attendees.
    """
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    page_width, page_height = letter

    # Color palette
    c_primary = colors.HexColor('#1a0069')
    c_secondary = colors.HexColor('#30217d')
    c_accent = colors.HexColor('#605a7f')
    c_bg = colors.HexColor('#fcf8ff')
    c_card = colors.HexColor('#ffffff')
    c_line = colors.HexColor('#e3dfff')
    c_text = colors.HexColor('#1a1930')
    c_muted = colors.HexColor('#787583')

    # Background canvas tint
    p.setFillColor(c_bg)
    p.rect(0, 0, page_width, page_height, fill=1, stroke=0)

    # Main Ticket Card Box
    margin = 40
    card_x = margin
    card_y = 120
    card_w = page_width - (margin * 2)
    card_h = page_height - 200

    # White Ticket Background
    p.setFillColor(c_card)
    p.setStrokeColor(c_line)
    p.setLineWidth(1)
    p.roundRect(card_x, card_y, card_w, card_h, 16, fill=1, stroke=1)

    # Top Brand Gradient / Header Bar
    p.setFillColor(c_secondary)
    p.rect(card_x, card_y + card_h - 60, card_w, 60, fill=1, stroke=0)

    # Brand Title
    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 20)
    p.drawString(card_x + 24, card_y + card_h - 38, "EVENTORA")
    
    p.setFont("Helvetica", 10)
    p.drawString(card_x + 150, card_y + card_h - 35, "OFFICIAL DIGITAL ADMISSION PASS")

    # Pass status pill
    status_label = "VALID PASS" if ticket.status == 'valid' else ticket.status.upper()
    p.setFillColor(colors.HexColor('#d8cffb'))
    p.roundRect(card_x + card_w - 130, card_y + card_h - 45, 110, 24, 12, fill=1, stroke=0)
    p.setFillColor(c_primary)
    p.setFont("Helvetica-Bold", 10)
    p.drawCentredString(card_x + card_w - 75, card_y + card_h - 38, status_label)

    # Event Title & Details
    event = ticket.booking_item.ticket_tier.event
    venue = event.venue

    p.setFillColor(c_primary)
    p.setFont("Helvetica-Bold", 22)
    
    # Wrap long event titles if needed
    title_text = event.title
    if len(title_text) > 42:
        p.drawString(card_x + 24, card_y + card_h - 100, title_text[:40] + "...")
    else:
        p.drawString(card_x + 24, card_y + card_h - 100, title_text)

    # Category and Age Policy
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 11)
    category_name = event.category.name if event.category else "Live Event"
    p.drawString(card_x + 24, card_y + card_h - 122, f"{category_name.upper()}  •  {event.age_policy}")

    # Separator Line
    p.setStrokeColor(c_line)
    p.setLineWidth(1)
    p.line(card_x + 24, card_y + card_h - 140, card_x + card_w - 24, card_y + card_h - 140)

    # 4 Metadata Blocks (Left Side)
    col1_x = card_x + 24
    col2_x = card_x + 180
    row1_y = card_y + card_h - 170
    row2_y = card_y + card_h - 225
    row3_y = card_y + card_h - 280

    # Date
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(col1_x, row1_y, "DATE")
    p.setFillColor(c_text)
    p.setFont("Helvetica-Bold", 13)
    p.drawString(col1_x, row1_y - 18, event.event_date.strftime('%a, %b %d, %Y'))

    # Time / Gates Open
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(col2_x, row1_y, "TIME & GATES")
    p.setFillColor(c_text)
    p.setFont("Helvetica-Bold", 13)
    start_str = event.start_time.strftime('%I:%M %p') if event.start_time else "18:00"
    p.drawString(col2_x, row1_y - 18, f"{start_str}  ({event.doors_open or 'Gates Open'})")

    # Venue & City
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(col1_x, row2_y, "LOCATION & VENUE")
    p.setFillColor(c_text)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(col1_x, row2_y - 18, (venue.name if venue else "Online Stream")[:32])
    p.setFont("Helvetica", 10)
    p.setFillColor(c_muted)
    p.drawString(col1_x, row2_y - 32, (venue.address if venue else "Virtual Event Link")[:36])

    # Access Point
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(col2_x, row2_y, "TURNSTILE ACCESS")
    p.setFillColor(c_primary)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(col2_x, row2_y - 18, ticket.gate_name or "Main Gate Entry")

    # Attendee Name
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(col1_x, row3_y, "ATTENDEE NAME")
    p.setFillColor(c_text)
    p.setFont("Helvetica-Bold", 13)
    p.drawString(col1_x, row3_y - 18, ticket.attendee_name)

    # Tier & Reference
    p.setFillColor(c_muted)
    p.setFont("Helvetica-Bold", 9)
    p.drawString(col2_x, row3_y, "TIER & PASS TYPE")
    p.setFillColor(c_text)
    p.setFont("Helvetica-Bold", 12)
    tier_name = ticket.booking_item.ticket_tier.name
    p.drawString(col2_x, row3_y - 18, tier_name[:24])

    # Perforation Line between Left Details and Right QR Stub
    qr_box_x = card_x + card_w - 180
    p.setDash(4, 4)
    p.setStrokeColor(colors.HexColor('#c8bfff'))
    p.line(qr_box_x - 15, card_y + 20, qr_box_x - 15, card_y + card_h - 80)
    p.setDash([]) # reset dash

    # Generate QR Code Image
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=6,
        border=1,
    )
    qr.add_data(ticket.qr_code_token)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#1a0069", back_color="white")

    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)

    # Draw QR Code on the Right Stub
    qr_reader = ImageReader(qr_buffer)
    p.drawImage(qr_reader, qr_box_x - 5, card_y + card_h - 250, width=150, height=150)

    # QR Label & Token String
    p.setFillColor(c_primary)
    p.setFont("Helvetica-Bold", 9)
    p.drawCentredString(qr_box_x + 70, card_y + card_h - 265, "SCAN AT TURNSTILE")

    p.setFillColor(c_muted)
    p.setFont("Helvetica", 8)
    token_display = ticket.qr_code_token
    if len(token_display) > 24:
        token_display = token_display[:22] + "..."
    p.drawCentredString(qr_box_x + 70, card_y + card_h - 280, token_display)

    # Ticket Reference and ID Bar at bottom of card
    p.setFillColor(colors.HexColor('#f6f2ff'))
    p.rect(card_x, card_y, card_w, 48, fill=1, stroke=0)

    p.setFillColor(c_muted)
    p.setFont("Helvetica", 9)
    p.drawString(card_x + 24, card_y + 28, f"Booking Ref: #{ticket.booking.booking_reference}")
    p.drawString(card_x + 24, card_y + 14, f"Ticket No: {ticket.ticket_number}")

    p.drawString(card_x + 240, card_y + 28, "Security: 256-bit Cryptographic Gate Token")
    p.drawString(card_x + 240, card_y + 14, "Issued by Eventora Global Admission Network")

    # Important Guidelines at bottom of page
    p.setFillColor(c_text)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(margin, 95, "ENTRY INSTRUCTIONS & TERMS:")
    
    p.setFillColor(c_muted)
    p.setFont("Helvetica", 8.5)
    p.drawString(margin, 80, "1. Please present this pass at the gate turnstile scanner directly on your mobile device or printed.")
    p.drawString(margin, 68, "2. A valid government photo ID matching the attendee name is required upon entry.")
    p.drawString(margin, 56, "3. Admission tokens are unique and single-entry. Do not share or duplicate this voucher.")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer.getvalue()
