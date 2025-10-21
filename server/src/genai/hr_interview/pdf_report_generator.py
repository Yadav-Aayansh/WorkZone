import io
from src.utils.datetime import get_indian_time
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from src.genai.schemas.hr_interview_schemas import InterviewReport

# Conditional import for testing without full config
try:
    from src.core.storage import storage_client
    STORAGE_AVAILABLE = True
except Exception as e:
    STORAGE_AVAILABLE = False
    print(f"⚠ Warning: Storage client not available: {e}")


def generate_pdf_report(report: InterviewReport) -> bytes:
    """
    Generate PDF report from InterviewReport object
    
    Args:
        report: InterviewReport Pydantic model
    
    Returns:
        PDF content as bytes
    """
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
        f"Generated on {get_indian_time().strftime('%B %d, %Y at %I:%M %p')}",
        subtitle_style
    ))
    
    # ========== CANDIDATE INFO ==========
    score_color = colors.HexColor('#27ae60') if report.overall_score >= 70 else \
                  colors.HexColor('#f39c12') if report.overall_score >= 50 else \
                  colors.HexColor('#e74c3c')
    
    info_data = [
        [Paragraph("<b>Candidate Name</b>", body_style),
         Paragraph(report.candidate_name, body_style)],
        [Paragraph("<b>Position Applied</b>", body_style),
         Paragraph(report.position, body_style)],
        [Paragraph("<b>Session ID</b>", body_style),
         Paragraph(report.session_id,
                   ParagraphStyle('SessionID', fontSize=9, textColor=colors.HexColor('#7f8c8d')))],
        [Paragraph("<b>Overall Score</b>", body_style),
         Paragraph(f"<font color='{score_color.hexval()}' size='18'><b>{report.overall_score}/100</b></font>",
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
    for i, strength in enumerate(report.strengths, 1):
        strengths_content.append(Paragraph(f"{i}. {strength}", bullet_style))
    
    weaknesses_content = []
    weaknesses_content.append(Paragraph("<b><font color='#e67e22' size='13'>⚠ Areas for Improvement</font></b>", heading_style))
    for i, weakness in enumerate(report.weaknesses, 1):
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
    tech_box_data = [[Paragraph(report.technical_fit, body_style)]]
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
    comm_box_data = [[Paragraph(report.communication_assessment, body_style)]]
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
    rec_color = colors.HexColor('#d5f4e6') if 'hire' in report.recommendations.lower() and 'not' not in report.recommendations.lower() else \
                colors.HexColor('#fadbd8') if 'reject' in report.recommendations.lower() else \
                colors.HexColor('#fef9e7')
    rec_border = colors.HexColor('#27ae60') if 'hire' in report.recommendations.lower() and 'not' not in report.recommendations.lower() else \
                 colors.HexColor('#e74c3c') if 'reject' in report.recommendations.lower() else \
                 colors.HexColor('#f39c12')
    
    rec_box_data = [[Paragraph(f"<b>{report.recommendations}</b>", body_style)]]
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
    
    for i, qa in enumerate(report.detailed_qa, 1):
        qa_score_color = colors.HexColor('#27ae60') if qa.score >= 7 else \
                         colors.HexColor('#f39c12') if qa.score >= 5 else \
                         colors.HexColor('#e74c3c')
        
        qa_header = [[
            Paragraph(f"<b>Question {i}</b>", ParagraphStyle('QHeader', fontSize=12, textColor=colors.white)),
            Paragraph(f"<b>Score: {qa.score}/10</b>", ParagraphStyle('QScore', fontSize=12, textColor=colors.white, alignment=TA_RIGHT))
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
            [Paragraph("<b>Q:</b>", body_style), Paragraph(qa.question, body_style)],
            [Paragraph("<b>A:</b>", body_style), Paragraph(qa.answer, body_style)],
        ]
        
        if qa.strength:
            qa_content.append([
                Paragraph("<b><font color='#27ae60'>✓</font></b>", body_style),
                Paragraph(qa.strength, body_style)
            ])
        if qa.weakness:
            qa_content.append([
                Paragraph("<b><font color='#e67e22'>⚠</font></b>", body_style),
                Paragraph(qa.weakness, body_style)
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
    story.append(Paragraph(f"Report ID: {report.session_id}", footer_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def generate_and_upload_pdf_report(report: InterviewReport) -> str:
    """
    Generate PDF report and upload to GCP Storage
    
    Args:
        report: InterviewReport Pydantic model
    
    Returns:
        Signed URL of the uploaded PDF
    """
    if not STORAGE_AVAILABLE:
        raise Exception(
            "Storage client not available. Ensure all environment variables are set."
        )
    
    # Generate PDF
    pdf_bytes = generate_pdf_report(report)
    
    # Create a simple file-like object with required attributes
    class PDFFile:
        def __init__(self, filename, content, content_type):
            self.filename = filename
            self.file = io.BytesIO(content)
            self.content_type = content_type
    
    filename = f"{report.session_id}_report.pdf"
    pdf_file = PDFFile(filename, pdf_bytes, "application/pdf")
    
    # Upload to GCP Storage
    folder = f"interview_reports/{report.session_id}"
    blob_name, signed_url = storage_client.upload(pdf_file, folder, expiration=30)
    
    return signed_url


# Testing the module

if __name__ == "__main__":
    print("Testing PDF Report Generator Module (Storage.py + Pydantic)")
    print("=" * 60)
    
    from src.genai.schemas.hr_interview_schemas import DetailedQA
    
    # Test data with Pydantic models
    test_report = InterviewReport(
        session_id="test_123_456",
        candidate_name="John Doe",
        position="Python Developer",
        overall_score=75.5,
        strengths=[
            "Strong Python programming skills",
            "Good understanding of FastAPI framework",
            "Clear communication style"
        ],
        weaknesses=[
            "Limited experience with MongoDB",
            "Could provide more specific examples",
            "Needs to improve system design knowledge"
        ],
        technical_fit="Candidate demonstrates solid Python and web development skills with FastAPI. Has practical experience building APIs but would benefit from more database optimization knowledge.",
        communication_assessment="Clear and concise communication. Answers were well-structured and easy to follow. Could be more detailed in explaining complex technical concepts.",
        recommendations="Recommend for hire with training on database optimization and system design.",
        detailed_qa=[
            DetailedQA(
                question="What is your experience with Python?",
                answer="I have 5 years of Python experience building web APIs and data processing systems.",
                score=8,
                strength="Provided specific timeframe and use cases",
                weakness="Could have mentioned specific frameworks"
            ),
            DetailedQA(
                question="Tell me about a challenging project.",
                answer="I built a high-traffic API that handled 10k requests per second using caching strategies.",
                score=7,
                strength="Mentioned specific metrics and technical solution",
                weakness="Didn't describe the challenges faced"
            )
        ]
    )
    
    try:
        # Test local PDF generation
        print("\n1. Testing Local PDF Generation:")
        print("-" * 60)
        pdf_bytes = generate_pdf_report(test_report)
        output_path = "test_report_storage.pdf"
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
        
        print(f"✓ PDF generated locally: {output_path}")
        print(f"  Size: {len(pdf_bytes):,} bytes")
        print(f"  Contains: {len(test_report.detailed_qa)} Q&A pairs")
        print(f"  Overall Score: {test_report.overall_score}/100")
        
        # Test storage upload
        print("\n2. Testing GCP Storage Upload:")
        print("-" * 60)
        try:
            signed_url = generate_and_upload_pdf_report(test_report)
            print(f"✓ PDF uploaded to GCP Storage successfully")
            print(f"  Signed URL (valid for 30 days):")
            print(f"  {signed_url[:80]}...")
            print(f"\n✓ Report can be downloaded using the signed URL")
            print(f"  Session ID: {test_report.session_id}")
            print(f"  Folder: interview_reports/{test_report.session_id}/")
        except Exception as e:
            print(f"⚠ Storage upload skipped: {e}")
            print("\nTo enable GCP Storage upload, ensure:")
            print("  1. storage.py is properly configured")
            print("  2. Environment variables are set:")
            print("     - GOOGLE_PROJECT_ID")
            print("     - GOOGLE_PRIVATE_KEY")
            print("     - GOOGLE_CLIENT_EMAIL")
            print("     - GCS_BUCKET_NAME")
            print("  3. GCP credentials have write permissions")
        
        print("\n" + "=" * 60)
        print("✓ PDF Report Generator Test Complete")
        print("=" * 60)
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

