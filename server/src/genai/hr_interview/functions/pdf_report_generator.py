"""
PDF Report Generator Module
Generates professional PDF reports from interview evaluations
"""

import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def generate_pdf_report(report_data: dict) -> bytes:
  
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    
    # Define custom styles
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#1a5490'),
        spaceAfter=8,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#666666'),
        spaceAfter=24,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=15,
        textColor=colors.HexColor('#1a5490'),
        spaceAfter=10,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#2c3e50'),
        spaceAfter=8,
        leading=16,
        alignment=TA_LEFT
    )
    
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#2c3e50'),
        leftIndent=20,
        spaceAfter=6,
        leading=15
    )
    
    story = []
    
    # ========== HEADER ==========
    header_data = [[Paragraph("WORKZONE.TECH",
                              ParagraphStyle('HeaderCompany',
                                           fontSize=10,
                                           textColor=colors.white,
                                           alignment=TA_CENTER,
                                           fontName='Helvetica-Bold'))]]
    header_table = Table(header_data, colWidths=[7*inch])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#1a5490')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Title
    story.append(Paragraph("Interview Evaluation Report", title_style))
    story.append(Paragraph(
        f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        subtitle_style
    ))
    
    # ========== CANDIDATE INFO ==========
    score_color = colors.HexColor('#27ae60') if report_data['overall_score'] >= 70 else \
                  colors.HexColor('#f39c12') if report_data['overall_score'] >= 50 else \
                  colors.HexColor('#e74c3c')
    
    info_data = [
        [Paragraph("<b>Candidate Name</b>", body_style),
         Paragraph(report_data['candidate_name'], body_style)],
        [Paragraph("<b>Position Applied</b>", body_style),
         Paragraph(report_data['position'], body_style)],
        [Paragraph("<b>Session ID</b>", body_style),
         Paragraph(report_data['session_id'],
                   ParagraphStyle('SessionID', fontSize=9, textColor=colors.HexColor('#7f8c8d')))],
        [Paragraph("<b>Overall Score</b>", body_style),
         Paragraph(f"<font color='{score_color.hexval()}' size='18'><b>{report_data['overall_score']}/100</b></font>",
                   body_style)],
    ]
    info_table = Table(info_data, colWidths=[2.2*inch, 4.8*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
        ('ROWBACKGROUNDS', (1, 0), (1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.35*inch))
    
    # ========== STRENGTHS & WEAKNESSES ==========
    strengths_content = []
    strengths_content.append(Paragraph("<b><font color='#27ae60' size='13'>✓ Key Strengths</font></b>", heading_style))
    for i, strength in enumerate(report_data['strengths'], 1):
        strengths_content.append(Paragraph(f"{i}. {strength}", bullet_style))
    
    weaknesses_content = []
    weaknesses_content.append(Paragraph("<b><font color='#e67e22' size='13'>⚠ Areas for Improvement</font></b>", heading_style))
    for i, weakness in enumerate(report_data['weaknesses'], 1):
        weaknesses_content.append(Paragraph(f"{i}. {weakness}", bullet_style))
    
    comparison_data = [[strengths_content, weaknesses_content]]
    comparison_table = Table(comparison_data, colWidths=[3.5*inch, 3.5*inch])
    comparison_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (0, 0), 0),
        ('RIGHTPADDING', (1, 0), (1, 0), 0),
        ('LEFTPADDING', (1, 0), (1, 0), 15),
    ]))
    story.append(comparison_table)
    story.append(Spacer(1, 0.3*inch))
    
    # ========== ASSESSMENTS ==========
    story.append(Paragraph("⚙ Technical Fit Assessment", heading_style))
    tech_box_data = [[Paragraph(report_data['technical_fit'], body_style)]]
    tech_box = Table(tech_box_data, colWidths=[7*inch])
    tech_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#e8f4f8')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#3498db')),
    ]))
    story.append(tech_box)
    story.append(Spacer(1, 0.25*inch))
    
    story.append(Paragraph("💬 Communication Skills", heading_style))
    comm_box_data = [[Paragraph(report_data['communication_assessment'], body_style)]]
    comm_box = Table(comm_box_data, colWidths=[7*inch])
    comm_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef5e7')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#f39c12')),
    ]))
    story.append(comm_box)
    story.append(Spacer(1, 0.25*inch))
    
    # Recommendation
    story.append(Paragraph("📋 Hiring Recommendation", heading_style))
    rec_color = colors.HexColor('#d5f4e6') if 'hire' in report_data['recommendations'].lower() and 'not' not in report_data['recommendations'].lower() else \
                colors.HexColor('#fadbd8') if 'reject' in report_data['recommendations'].lower() else \
                colors.HexColor('#fef9e7')
    rec_border = colors.HexColor('#27ae60') if 'hire' in report_data['recommendations'].lower() and 'not' not in report_data['recommendations'].lower() else \
                 colors.HexColor('#e74c3c') if 'reject' in report_data['recommendations'].lower() else \
                 colors.HexColor('#f39c12')
    
    rec_box_data = [[Paragraph(f"<b>{report_data['recommendations']}</b>", body_style)]]
    rec_box = Table(rec_box_data, colWidths=[7*inch])
    rec_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), rec_color),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('LEFTPADDING', (0, 0), (-1, -1), 15),
        ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ('GRID', (0, 0), (-1, -1), 2, rec_border),
    ]))
    story.append(rec_box)
    story.append(Spacer(1, 0.4*inch))
    
    # ========== DETAILED Q&A ==========
    story.append(Paragraph("📊 Detailed Interview Breakdown", heading_style))
    story.append(Spacer(1, 0.15*inch))
    
    for i, qa in enumerate(report_data['detailed_qa'], 1):
        qa_score_color = colors.HexColor('#27ae60') if qa['score'] >= 7 else \
                         colors.HexColor('#f39c12') if qa['score'] >= 5 else \
                         colors.HexColor('#e74c3c')
        
        qa_header = [[
            Paragraph(f"<b>Question {i}</b>", ParagraphStyle('QHeader', fontSize=12, textColor=colors.white)),
            Paragraph(f"<b>Score: {qa['score']}/10</b>", ParagraphStyle('QScore', fontSize=12, textColor=colors.white, alignment=TA_RIGHT))
        ]]
        qa_header_table = Table(qa_header, colWidths=[5.5*inch, 1.5*inch])
        qa_header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#34495e')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(qa_header_table)
        
        qa_content = [
            [Paragraph("<b>Q:</b>", body_style), Paragraph(qa['question'], body_style)],
            [Paragraph("<b>A:</b>", body_style), Paragraph(qa['answer'], body_style)],
        ]
        
        if qa.get('strength'):
            qa_content.append([
                Paragraph("<b><font color='#27ae60'>✓</font></b>", body_style),
                Paragraph(qa['strength'], body_style)
            ])
        if qa.get('weakness'):
            qa_content.append([
                Paragraph("<b><font color='#e67e22'>⚠</font></b>", body_style),
                Paragraph(qa['weakness'], body_style)
            ])
        
        qa_table = Table(qa_content, colWidths=[0.5*inch, 6.5*inch])
        qa_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8f9fa')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dee2e6')),
        ]))
        story.append(qa_table)
        story.append(Spacer(1, 0.2*inch))
    
    # ========== FOOTER ==========
    story.append(Spacer(1, 0.2*inch))
    footer_style = ParagraphStyle('Footer', fontSize=9, textColor=colors.HexColor('#95a5a6'), alignment=TA_CENTER)
    story.append(Paragraph("———————————————————", footer_style))
    story.append(Paragraph("This report was generated by WorkZone.tech AI Interview Assistant", footer_style))
    story.append(Paragraph(f"Report ID: {report_data['session_id']}", footer_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


# Testing the module

if __name__ == "__main__":
    print("Testing PDF Report Generator Module")
    print("=" * 60)
    
    # Test data
    test_report = {
        "session_id": "test_123_456",
        "candidate_name": "John Doe",
        "position": "Python Developer",
        "overall_score": 75.5,
        "strengths": [
            "Strong Python programming skills",
            "Good understanding of FastAPI framework",
            "Clear communication style"
        ],
        "weaknesses": [
            "Limited experience with MongoDB",
            "Could provide more specific examples",
            "Needs to improve system design knowledge"
        ],
        "technical_fit": "Candidate demonstrates solid Python and web development skills with FastAPI. Has practical experience building APIs but would benefit from more database optimization knowledge.",
        "communication_assessment": "Clear and concise communication. Answers were well-structured and easy to follow. Could be more detailed in explaining complex technical concepts.",
        "recommendations": "Recommend for hire with training on database optimization and system design.",
        "detailed_qa": [
            {
                "question": "What is your experience with Python?",
                "answer": "I have 5 years of Python experience building web APIs and data processing systems.",
                "score": 8,
                "strength": "Provided specific timeframe and use cases",
                "weakness": "Could have mentioned specific frameworks"
            },
            {
                "question": "Tell me about a challenging project.",
                "answer": "I built a high-traffic API that handled 10k requests per second using caching strategies.",
                "score": 7,
                "strength": "Mentioned specific metrics and technical solution",
                "weakness": "Didn't describe the challenges faced"
            }
        ]
    }
    
    try:
        pdf_bytes = generate_pdf_report(test_report)
        
        # Save to file
        output_path = "test_report1.pdf"
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✓ PDF generated successfully: {output_path}")
        print(f"  Size: {len(pdf_bytes)} bytes")
        print(f"  Candidate: {test_report['candidate_name']}")
        print(f"  Score: {test_report['overall_score']}/100")
        
    except Exception as e:
        print(f"✗ Error: {e}")
