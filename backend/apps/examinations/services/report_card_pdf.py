"""
Report Card PDF Renderer.

Generates PDF report cards from report_data JSON using ReportLab.
Supports multiple layouts (STANDARD, CBSE, ICSE, COMPACT).
"""

import io
import logging
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)


def generate_report_card_pdf(report_card):
    """
    Generate a PDF for a ReportCard instance and save to pdf_file field.

    Args:
        report_card: ReportCard model instance with report_data populated.

    Returns:
        bool: True if PDF generated successfully.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import mm, cm
        from reportlab.platypus import (
            SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    except ImportError:
        logger.error("ReportLab not installed. Install with: pip install reportlab")
        return False

    data = report_card.report_data
    if not data:
        logger.error("No report_data on report card %s", report_card.id)
        return False

    template = report_card.template
    layout = template.layout if template else 'STANDARD'

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(
        'SchoolName', parent=styles['Heading1'],
        fontSize=16, alignment=TA_CENTER, spaceAfter=2 * mm,
        textColor=colors.HexColor('#1a237e'),
    ))
    styles.add(ParagraphStyle(
        'ReportTitle', parent=styles['Heading2'],
        fontSize=13, alignment=TA_CENTER, spaceAfter=4 * mm,
        textColor=colors.HexColor('#333333'),
    ))
    styles.add(ParagraphStyle(
        'SectionHeader', parent=styles['Heading3'],
        fontSize=11, spaceAfter=2 * mm, spaceBefore=4 * mm,
        textColor=colors.HexColor('#1a237e'),
    ))
    styles.add(ParagraphStyle(
        'CellText', parent=styles['Normal'],
        fontSize=9, leading=11,
    ))
    styles.add(ParagraphStyle(
        'FooterText', parent=styles['Normal'],
        fontSize=8, alignment=TA_CENTER, textColor=colors.grey,
    ))

    elements = []

    # -- Header Section --
    school_info = data.get('school', {})
    school_name = school_info.get('name', 'School Name')
    elements.append(Paragraph(school_name, styles['SchoolName']))

    header_text = ''
    if template and template.header_text:
        header_text = template.header_text
    elif school_info.get('address'):
        header_text = school_info['address']
    if header_text:
        elements.append(Paragraph(header_text, styles['CellText']))

    # Report title
    exam_info = data.get('examination', {})
    if data.get('is_cumulative'):
        title = f"Cumulative Report Card - {data.get('academic_year', '')}"
    else:
        title = f"Report Card - {exam_info.get('name', '')}"
    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(title, styles['ReportTitle']))

    # -- Student Info Table --
    student = data.get('student', {})
    student_info_data = [
        ['Student Name', student.get('name', ''), 'Class', student.get('class', '')],
        ['Admission No.', student.get('admission_number', ''), 'Section', student.get('section', '')],
        ['Father\'s Name', student.get('father_name', ''), 'Roll No.', student.get('roll_number', '')],
        ['Date of Birth', student.get('date_of_birth', ''), 'Gender', student.get('gender', '')],
    ]

    student_table = Table(student_info_data, colWidths=[35 * mm, 55 * mm, 30 * mm, 55 * mm])
    student_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8eaf6')),
        ('BACKGROUND', (2, 0), (2, -1), colors.HexColor('#e8eaf6')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbbbbb')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(student_table)

    # -- Subject Marks Table --
    elements.append(Paragraph('Subject-wise Performance', styles['SectionHeader']))

    if data.get('is_cumulative'):
        _build_cumulative_marks_table(elements, data, styles, template)
    else:
        _build_single_exam_marks_table(elements, data, styles, template)

    # -- Overall Summary --
    elements.append(Paragraph('Overall Summary', styles['SectionHeader']))
    overall = data.get('overall') or data.get('cumulative_overall', {})

    show_rank = template.show_rank if template else True
    show_pct = template.show_percentage if template else True
    show_grade = template.show_grade if template else True
    show_cgpa = template.show_cgpa if template else True

    summary_rows = []
    if show_pct:
        pct_val = overall.get('percentage') or overall.get('weighted_percentage', 0)
        summary_rows.append(['Percentage', f"{pct_val}%"])
    if show_grade and overall.get('overall_grade'):
        summary_rows.append(['Overall Grade', overall.get('overall_grade', '')])
    if show_cgpa and overall.get('cgpa'):
        summary_rows.append(['CGPA', str(overall.get('cgpa', ''))])
    if show_rank and overall.get('rank'):
        rank_text = f"{overall['rank']}"
        total = overall.get('total_students_in_class')
        if total:
            rank_text += f" / {total}"
        summary_rows.append(['Rank', rank_text])

    result_text = 'PASS' if overall.get('is_passed', True) else 'FAIL'
    summary_rows.append(['Result', result_text])

    if summary_rows:
        summary_table = Table(summary_rows, colWidths=[45 * mm, 130 * mm])
        summary_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e8eaf6')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbbbbb')),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(summary_table)

    # -- Attendance --
    show_attendance = template.show_attendance if template else True
    attendance = data.get('attendance')
    if show_attendance and attendance:
        elements.append(Paragraph('Attendance Summary', styles['SectionHeader']))
        att_rows = [
            ['Total Working Days', str(attendance.get('total_working_days', ''))],
            ['Days Present', str(attendance.get('days_present', ''))],
            ['Days Absent', str(attendance.get('days_absent', ''))],
            ['Attendance %', f"{attendance.get('attendance_percentage', 0)}%"],
        ]
        att_table = Table(att_rows, colWidths=[45 * mm, 130 * mm])
        att_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbbbbb')),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(att_table)

    # -- Remarks --
    show_remarks = template.show_teacher_remarks if template else True
    if show_remarks:
        if report_card.teacher_remarks:
            elements.append(Paragraph('Class Teacher Remarks', styles['SectionHeader']))
            elements.append(Paragraph(report_card.teacher_remarks, styles['CellText']))
        if report_card.principal_remarks:
            elements.append(Paragraph("Principal's Remarks", styles['SectionHeader']))
            elements.append(Paragraph(report_card.principal_remarks, styles['CellText']))

    # -- Grade Scale --
    show_grade_scale = template.show_grade_scale if template else True
    grade_scale = data.get('grade_scale', [])
    if show_grade_scale and grade_scale:
        elements.append(Spacer(1, 4 * mm))
        elements.append(Paragraph('Grading Scale', styles['SectionHeader']))
        gs_header = ['Grade', 'Range (%)', 'Grade Point', 'Description']
        gs_rows = [gs_header]
        for g in grade_scale:
            gs_rows.append([
                g['grade'],
                f"{g['min_percentage']} - {g['max_percentage']}",
                str(g['grade_point']),
                g.get('description', ''),
            ])
        gs_table = Table(gs_rows, colWidths=[25 * mm, 35 * mm, 30 * mm, 85 * mm])
        gs_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbbbbb')),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ]))
        elements.append(gs_table)

    # -- Signature Lines --
    show_signatures = template.show_principal_signature if template else True
    show_parent_sig = template.show_parent_signature_line if template else True
    if show_signatures or show_parent_sig:
        elements.append(Spacer(1, 15 * mm))
        sig_cols = []
        if show_remarks:
            sig_cols.append('Class Teacher')
        if show_signatures:
            sig_cols.append('Principal')
        if show_parent_sig:
            sig_cols.append('Parent/Guardian')

        sig_line = '_' * 20
        sig_data = [
            [sig_line] * len(sig_cols),
            sig_cols,
        ]
        sig_table = Table(sig_data, colWidths=[175 * mm // max(len(sig_cols), 1)] * len(sig_cols))
        sig_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        elements.append(sig_table)

    # -- Footer --
    if template and template.footer_text:
        elements.append(Spacer(1, 5 * mm))
        elements.append(Paragraph(template.footer_text, styles['FooterText']))

    # Build PDF
    doc.build(elements)
    pdf_content = buffer.getvalue()
    buffer.close()

    # Determine filename
    student_name = data.get('student', {}).get('name', 'student').replace(' ', '_')
    if data.get('is_cumulative'):
        filename = f"report_card_cumulative_{student_name}_{data.get('academic_year', '')}.pdf"
    else:
        exam_name = data.get('examination', {}).get('name', 'exam').replace(' ', '_')
        filename = f"report_card_{student_name}_{exam_name}.pdf"

    report_card.pdf_file.save(filename, ContentFile(pdf_content), save=True)
    logger.info("PDF generated for report card %s: %s", report_card.id, filename)
    return True


def _build_single_exam_marks_table(elements, data, styles, template):
    """Build marks table for single exam report card."""
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import Table, TableStyle

    subjects = data.get('subjects', [])

    show_grade = template.show_grade if template else True
    show_pct = template.show_percentage if template else True

    header = ['#', 'Subject', 'Max Marks', 'Marks Obtained']
    if show_pct:
        header.append('%')
    if show_grade:
        header.append('Grade')
    header.append('Status')

    rows = [header]
    for idx, subj in enumerate(subjects, 1):
        row = [
            str(idx),
            subj['subject_name'],
            str(subj['max_marks']),
            str(subj['marks_obtained']) if subj['status'] == 'PRESENT' else subj['status'],
        ]
        if show_pct:
            row.append(f"{subj['percentage']:.1f}" if subj['status'] == 'PRESENT' else '-')
        if show_grade:
            row.append(subj['grade'] if subj['status'] == 'PRESENT' else '-')
        row.append('Pass' if subj['is_passed'] else 'Fail')
        rows.append(row)

    col_count = len(header)
    col_widths = _calc_col_widths(col_count)

    marks_table = Table(rows, colWidths=col_widths)
    marks_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbbbbb')),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(marks_table)


def _build_cumulative_marks_table(elements, data, styles, template):
    """Build marks table for cumulative multi-exam report card."""
    from reportlab.lib import colors
    from reportlab.lib.units import mm
    from reportlab.platypus import Table, TableStyle, Paragraph

    cumulative_subjects = data.get('cumulative_subjects', [])
    exam_breakdowns = data.get('exam_breakdowns', [])

    # Header row: Subject, then each exam name, then Weighted %
    header = ['Subject']
    for eb in exam_breakdowns:
        header.append(eb['exam_name'][:15])
    header.append('Weighted %')

    rows = [header]
    for subj in cumulative_subjects:
        row = [subj['subject_name']]
        for eb in exam_breakdowns:
            # Find this subject in this exam
            match = next(
                (s for s in eb['subjects'] if s['subject_name'] == subj['subject_name']),
                None
            )
            if match:
                row.append(f"{match['percentage']:.0f}%")
            else:
                row.append('-')
        row.append(f"{subj['weighted_percentage']:.1f}%")
        rows.append(row)

    col_count = len(header)
    col_widths = _calc_col_widths(col_count)

    marks_table = Table(rows, colWidths=col_widths)
    marks_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a237e')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbbbbb')),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5f5f5')]),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(marks_table)


def _calc_col_widths(col_count):
    """Calculate column widths to fit A4 page (175mm usable)."""
    from reportlab.lib.units import mm
    total = 175 * mm
    if col_count <= 5:
        return [total / col_count] * col_count
    first_col = 40 * mm
    remaining = total - first_col
    rest_width = remaining / (col_count - 1)
    return [first_col] + [rest_width] * (col_count - 1)
