from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from django.conf import settings
import os
from io import BytesIO

def generate_payment_receipt(payment):
    """
    Generate a PDF receipt for a payment
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Header
    elements.append(Paragraph("School Management System", title_style))
    elements.append(Paragraph("Payment Receipt", subtitle_style))
    elements.append(Spacer(1, 0.5 * inch))
    
    # Payment Details
    data = [
        ["Receipt No:", payment.receipt_number],
        ["Date:", payment.payment_date.strftime("%Y-%m-%d %H:%M")],
        ["Student:", f"{payment.student.first_name} {payment.student.last_name}"],
        ["Admission No:", payment.student.admission_number],
        ["Class:", f"{payment.student.current_class.name} {payment.student.section.name}" if payment.student.current_class else "N/A"],
        ["Payment Method:", payment.payment_method],
    ]
    
    if payment.transaction_id:
        data.append(["Transaction ID:", payment.transaction_id])
        
    t = Table(data, colWidths=[2 * inch, 3 * inch])
    t.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 0.3 * inch))
    
    # Fee Breakdown
    elements.append(Paragraph("Payment Breakdown", styles['Heading3']))
    
    allocations_data = [['Fee Category', 'Amount']]
    total_allocations = 0
    
    for allocation in payment.allocations.all():
        row = [
            allocation.student_fee.fee_structure.fee_category.name,
            f"₹ {allocation.allocated_amount}"
        ]
        allocations_data.append(row)
        total_allocations += allocation.allocated_amount
        
    allocations_data.append(['Total Paid', f"₹ {payment.amount}"])
    
    t2 = Table(allocations_data, colWidths=[3.5 * inch, 1.5 * inch])
    t2.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(t2)
    
    # Footer
    elements.append(Spacer(1, 1 * inch))
    elements.append(Paragraph(f"Received By: {payment.received_by.get_full_name() if payment.received_by else 'System'}", normal_style))
    elements.append(Paragraph("This is a computer generated receipt.", normal_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer
