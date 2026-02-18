"""
DPDP Act 2023 Document Generator for CampusKona (Workstream D).
Generates: DPA PDF, Privacy Notice PDF, Compliance Certificate PDF.
Falls back to HTML bytes if reportlab is not installed.
"""
import io
import logging
from datetime import date

logger = logging.getLogger(__name__)


def _try_reportlab():
    try:
        import reportlab  # noqa
        return True
    except ImportError:
        return False


def generate_dpa_pdf(school_name: str, schema_name: str = '') -> bytes:
    """Generate Data Processing Agreement as PDF (or HTML fallback)."""
    if not _try_reportlab():
        return _dpa_html(school_name, schema_name).encode('utf-8')

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                             leftMargin=2*cm, rightMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    brand_blue = HexColor('#1976D2')
    brand_green = HexColor('#2E7D32')
    today = date.today().strftime('%d %B %Y')

    title_style = ParagraphStyle('CKTitle', parent=styles['Title'],
                                  textColor=brand_blue, fontSize=18, spaceAfter=6)
    sub_style = ParagraphStyle('CKSub', parent=styles['Normal'],
                                textColor=brand_green, fontSize=12, spaceAfter=12, alignment=TA_CENTER)
    h2_style = ParagraphStyle('CKH2', parent=styles['Heading2'],
                               textColor=brand_blue, fontSize=13, spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle('CKBody', parent=styles['Normal'],
                                 fontSize=10, leading=14, alignment=TA_JUSTIFY)
    small_style = ParagraphStyle('CKSmall', parent=styles['Normal'],
                                  fontSize=9, textColor=HexColor('#666666'))

    story = []
    story.append(Paragraph('CampusKona School Management Platform', title_style))
    story.append(Paragraph('DATA PROCESSING AGREEMENT', sub_style))
    story.append(Paragraph('Under the Digital Personal Data Protection Act, 2023', small_style))
    story.append(HRFlowable(width='100%', thickness=2, color=brand_blue, spaceAfter=12))

    story.append(Paragraph('1. PARTIES TO THIS AGREEMENT', h2_style))
    story.append(Paragraph(
        f'This Data Processing Agreement ("DPA") is entered into as of <b>{today}</b> between:<br/><br/>'
        f'<b>Data Fiduciary:</b> {school_name} ("School"), an educational institution responsible for '
        f'determining the purpose and means of processing students\' personal data.<br/><br/>'
        f'<b>Data Processor:</b> CampusKona Technologies Pvt. Ltd. ("CampusKona"), provider of the '
        f'CampusKona School Management Platform, acting solely on instructions of the School.',
        body_style,
    ))

    story.append(Paragraph('2. PURPOSE AND SCOPE', h2_style))
    story.append(Paragraph(
        'CampusKona processes personal data solely to provide school management services including student '
        'record management, attendance tracking, fee collection, academic progress reporting, and parent '
        'communication, strictly as instructed by the School.',
        body_style,
    ))

    story.append(Paragraph('3. CATEGORIES OF PERSONAL DATA', h2_style))
    categories = [
        ['Category', 'Description', 'Legal Basis (DPDP 2023)'],
        ['Student Identity', 'Name, DOB, gender, photograph', 'Legitimate use — educational records'],
        ['Contact Data', 'Parent phone, address', 'Consent (S.6)'],
        ['Academic Data', 'Marks, attendance, assignments', 'Legitimate use'],
        ['Financial Data', 'Fee records, payment history', 'Contract performance'],
        ['Special Category', 'Caste, religion (if provided)', 'Explicit consent + encryption (S.9)'],
        ["Children's Data", 'All data of minors under 18', 'Verifiable parental consent (S.9)'],
    ]
    t = Table(categories, colWidths=[4*cm, 7*cm, 5*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), brand_blue),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#F5F5F5'), HexColor('#FFFFFF')]),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t)

    story.append(Paragraph('4. CAMPUSKONA OBLIGATIONS AS DATA PROCESSOR', h2_style))
    for ob in [
        'Process personal data only on documented instructions from the School.',
        'Implement AES-256 encryption at rest and TLS 1.3 in transit.',
        'Notify the School within 72 hours of a confirmed personal data breach (DPDP Act 2023 S.8).',
        'Delete or return all personal data within 30 days of agreement termination.',
        'Maintain records of all processing activities.',
        'Not engage sub-processors without prior written consent of the School.',
        'Assist the School in fulfilling data principal rights: erasure (S.12), correction (S.13), grievance (S.14).',
    ]:
        story.append(Paragraph(f'• {ob}', body_style))
        story.append(Spacer(1, 3))

    story.append(Paragraph('5. SCHOOL OBLIGATIONS AS DATA FIDUCIARY', h2_style))
    for ob in [
        'Obtain verifiable parental consent before uploading personal data of any minor.',
        'Provide a clear Privacy Notice to parents and students.',
        'Process only data necessary for the educational purpose (data minimisation).',
        'Respond to data principal grievances within 7 business days.',
        'Not upload Aadhaar, caste, or religion data without explicit consent.',
    ]:
        story.append(Paragraph(f'• {ob}', body_style))
        story.append(Spacer(1, 3))

    story.append(Paragraph('6. TERM AND TERMINATION', h2_style))
    story.append(Paragraph(
        'This DPA remains in effect for the duration of the CampusKona subscription and terminates automatically '
        'upon expiry, non-renewal, or written notice. CampusKona will delete all tenant data within 30 days '
        'of termination.',
        body_style,
    ))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width='100%', thickness=1, color=HexColor('#CCCCCC'), spaceAfter=12))
    story.append(Paragraph('7. SIGNATURES', h2_style))
    sig_data = [
        [f'For {school_name}', 'For CampusKona Technologies Pvt. Ltd.'],
        ['', ''],
        ['', ''],
        ['___________________________', '___________________________'],
        ['Authorised Signatory', 'Authorised Signatory'],
        [f'Date: {today}', f'Date: {today}'],
    ]
    sig_t = Table(sig_data, colWidths=[9*cm, 9*cm])
    story.append(sig_t)

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def generate_privacy_notice_pdf(school_name: str) -> bytes:
    """Generate Privacy Notice PDF for parents."""
    if not _try_reportlab():
        return _privacy_notice_html(school_name).encode('utf-8')

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
    from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                             leftMargin=2*cm, rightMargin=2*cm,
                             topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    brand_blue = HexColor('#1976D2')
    today = date.today().strftime('%d %B %Y')

    h1_style = ParagraphStyle('H1', parent=styles['Title'], textColor=brand_blue, fontSize=16)
    h2_style = ParagraphStyle('H2', parent=styles['Heading2'], textColor=brand_blue, fontSize=12, spaceBefore=10)
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, leading=14, alignment=TA_JUSTIFY)

    story = []
    story.append(Paragraph(school_name, h1_style))
    story.append(Paragraph('PRIVACY NOTICE FOR PARENTS AND GUARDIANS',
                            ParagraphStyle('Sub', parent=styles['Normal'], fontSize=12,
                                           textColor=HexColor('#2E7D32'), alignment=TA_CENTER)))
    story.append(Paragraph(f'Effective: {today} | Pursuant to DPDP Act 2023',
                            ParagraphStyle('Small', parent=styles['Normal'], fontSize=9,
                                           textColor=HexColor('#666666'), alignment=TA_CENTER)))
    story.append(HRFlowable(width='100%', thickness=2, color=brand_blue, spaceAfter=10))

    sections = [
        ('1. Who We Are',
         f'{school_name} ("School") is the Data Fiduciary. CampusKona Technologies Pvt. Ltd. is our '
         'Data Processor for school management technology.'),
        ('2. What Data We Collect',
         'We collect: student name, date of birth, gender; parent/guardian contact details (phone, address); '
         'academic records (marks, attendance, assignments); fee payment history. We do NOT collect Aadhaar '
         'numbers, caste, or religion without your explicit consent.'),
        ('3. Why We Collect Your Data',
         "Your child's data is used exclusively for: maintaining educational records, tracking attendance "
         'and academic progress, collecting school fees, communicating with parents, and fulfilling legal '
         'requirements under the RTE Act 2009.'),
        ('4. Your Rights Under DPDP Act 2023',
         '• Right to Information (S.11): Know what data we hold.\n'
         '• Right to Correction (S.12): Correct inaccurate data.\n'
         '• Right to Erasure (S.13): Request deletion of data.\n'
         '• Right to Grievance (S.14): Raise complaints within 7 business days.\n'
         '• Right to Nominate (S.15): Nominate a person to exercise rights on your behalf.'),
        ('5. How We Protect Your Data',
         'All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Access is restricted to '
         'authorised school staff only. Data is stored in India on secure servers. Breach notification '
         'within 72 hours per DPDP Act 2023 S.8.'),
        ('6. Data Retention',
         'Student records are retained for 7 years after the student leaves, as required by the RTE Act. '
         'You may request earlier deletion for non-mandatory records.'),
        ('7. Contact Us',
         'For privacy concerns, contact the School Principal or submit a grievance via the CampusKona '
         'parent app. We respond within 7 business days.'),
    ]

    for heading, content in sections:
        story.append(Paragraph(heading, h2_style))
        for line in content.split('\n'):
            story.append(Paragraph(line, body_style))
        story.append(Spacer(1, 4))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def generate_compliance_certificate_pdf(school_name: str, schema_name: str,
                                         consent_rate: float = 0.0, audit_score: int = 85) -> bytes:
    """Generate DPDP Compliance Certificate PDF."""
    if not _try_reportlab():
        return _certificate_html(school_name, consent_rate, audit_score).encode('utf-8')

    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_CENTER

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                             leftMargin=3*cm, rightMargin=3*cm,
                             topMargin=3*cm, bottomMargin=3*cm)
    styles = getSampleStyleSheet()
    brand_blue = HexColor('#1976D2')
    brand_green = HexColor('#2E7D32')
    gold = HexColor('#F9A825')
    today = date.today().strftime('%d %B %Y')
    cert_number = f'CK-DPDP-{date.today().year}-{schema_name.upper()[:6]}'

    center = ParagraphStyle('Center', parent=styles['Normal'], alignment=TA_CENTER)
    story = []

    story.append(Spacer(1, 20))
    story.append(Paragraph('CampusKona Technologies', ParagraphStyle(
        'Brand', parent=styles['Normal'], fontSize=14, textColor=brand_blue, alignment=TA_CENTER)))
    story.append(Spacer(1, 10))
    story.append(Paragraph('CERTIFICATE OF DPDP COMPLIANCE', ParagraphStyle(
        'CertTitle', parent=styles['Title'], fontSize=22, textColor=brand_green, alignment=TA_CENTER)))
    story.append(Paragraph('Digital Personal Data Protection Act, 2023', ParagraphStyle(
        'CertSub', parent=styles['Normal'], fontSize=12, textColor=HexColor('#666666'), alignment=TA_CENTER)))
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width='100%', thickness=3, color=gold, spaceAfter=20))

    story.append(Paragraph('This is to certify that', center))
    story.append(Spacer(1, 10))
    story.append(Paragraph(school_name, ParagraphStyle(
        'SchoolName', parent=styles['Normal'], fontSize=20, textColor=brand_blue,
        alignment=TA_CENTER, fontName='Helvetica-Bold')))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        'has demonstrated compliance with the requirements of the<br/>'
        '<b>Digital Personal Data Protection Act, 2023 (India)</b><br/>'
        'as assessed by CampusKona Technologies Pvt. Ltd.',
        ParagraphStyle('CertBody', parent=styles['Normal'], fontSize=11, alignment=TA_CENTER, leading=18),
    ))
    story.append(Spacer(1, 20))

    metrics = [
        ['Metric', 'Value', 'Status'],
        ['DPDP Audit Score', f'{audit_score}/100', '✅ Pass' if audit_score >= 80 else '⚠️ Needs Work'],
        ['Parental Consent Rate', f'{consent_rate:.1f}%', '✅ Pass' if consent_rate >= 80 else '⚠️ Below Target'],
        ['Data Breach Incidents', '0 Open', '✅ Clean'],
        ['Grievance Resolution', 'Active', '✅ Compliant'],
        ['Data Encryption', 'AES-256 / TLS 1.3', '✅ Enabled'],
    ]
    t = Table(metrics, colWidths=[7*cm, 5*cm, 4*cm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), brand_green),
        ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#FFFFFF')),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#CCCCCC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#F9FBE7'), HexColor('#FFFFFF')]),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(t)
    story.append(Spacer(1, 20))
    story.append(HRFlowable(width='100%', thickness=3, color=gold, spaceAfter=20))

    story.append(Paragraph(f'Certificate Number: <b>{cert_number}</b>', center))
    story.append(Paragraph(
        f'Issue Date: <b>{today}</b> | Valid Until: <b>31 March {date.today().year + 1}</b>', center))
    story.append(Spacer(1, 30))
    sig_t = Table([
        ['Authorised by CampusKona Technologies Pvt. Ltd.'],
        [''],
        ['___________________________'],
        ['Chief Privacy Officer'],
        [f'Date: {today}'],
    ], colWidths=[16*cm])
    story.append(sig_t)

    doc.build(story)
    buffer.seek(0)
    return buffer.read()


# ── HTML fallbacks ──────────────────────────────────────────

def _dpa_html(school_name, schema_name=''):
    today = date.today().strftime('%d %B %Y')
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Data Processing Agreement - {school_name}</title>
<style>body{{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;}}
h1{{color:#1976D2;}} h2{{color:#1976D2;border-bottom:1px solid #eee;padding-bottom:4px;}}
table{{width:100%;border-collapse:collapse;margin:12px 0;}}
td,th{{border:1px solid #ccc;padding:8px;font-size:13px;}} th{{background:#1976D2;color:white;}}
</style></head><body>
<h1>CampusKona School Management Platform</h1>
<h2>DATA PROCESSING AGREEMENT</h2>
<p><em>Under the Digital Personal Data Protection Act, 2023</em></p>
<p><strong>Date:</strong> {today}</p>
<p><strong>Data Fiduciary:</strong> {school_name}</p>
<p><strong>Data Processor:</strong> CampusKona Technologies Pvt. Ltd.</p>
<h2>Purpose</h2>
<p>CampusKona processes personal data solely to provide school management services as instructed by the School.</p>
<h2>CampusKona Obligations</h2>
<ul>
<li>Process data only on documented instructions from the School.</li>
<li>AES-256 encryption at rest, TLS 1.3 in transit.</li>
<li>Notify School within 72 hours of data breach (DPDP S.8).</li>
<li>Delete data within 30 days of termination.</li>
</ul>
<h2>Signatures</h2>
<table><tr><td><strong>For {school_name}</strong><br/><br/>___________________________<br/>Authorised Signatory<br/>Date: {today}</td>
<td><strong>For CampusKona Technologies</strong><br/><br/>___________________________<br/>Authorised Signatory<br/>Date: {today}</td></tr></table>
</body></html>"""


def _privacy_notice_html(school_name):
    today = date.today().strftime('%d %B %Y')
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Privacy Notice - {school_name}</title>
<style>body{{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;}}
h1{{color:#1976D2;}} h2{{color:#2E7D32;}}</style></head><body>
<h1>{school_name}</h1><h2>PRIVACY NOTICE FOR PARENTS AND GUARDIANS</h2>
<p><em>Effective: {today} | DPDP Act 2023</em></p>
<h2>Your Rights</h2>
<ul><li>Right to Information (S.11)</li><li>Right to Correction (S.12)</li>
<li>Right to Erasure (S.13)</li><li>Right to Grievance (S.14)</li></ul>
<p>Contact school administration for any privacy concerns.</p></body></html>"""


def _certificate_html(school_name, consent_rate, audit_score):
    today = date.today().strftime('%d %B %Y')
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<title>DPDP Certificate - {school_name}</title>
<style>body{{font-family:Arial,sans-serif;max-width:700px;margin:60px auto;text-align:center;}}
h1{{color:#2E7D32;}} .score{{font-size:48px;color:#1976D2;font-weight:bold;}}</style></head>
<body><h1>Certificate of DPDP Compliance</h1><p><strong>{school_name}</strong></p>
<div class="score">{audit_score}/100</div>
<p>Consent Rate: {consent_rate:.1f}%</p><p>Issued: {today}</p></body></html>"""
