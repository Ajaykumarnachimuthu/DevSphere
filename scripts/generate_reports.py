import os
import re
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

DOC_MD_PATH = r"docs\academic-reports\DEVSPHERE_COMPLETE_PROJECT_REPORT.md"
DOCX_OUT_PATH = r"docs\academic-reports\DEVSPHERE_COMPLETE_PROJECT_REPORT.docx"
PDF_OUT_PATH = r"docs\academic-reports\DEVSPHERE_COMPLETE_PROJECT_REPORT.pdf"

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>'))

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_docx(markdown_text):
    print("Generating DOCX...")
    doc = docx.Document()
    
    # Page setup - A4 with 1 inch margins
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "DevSphere — Academic Project Report (21CSE354T)"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.runs[0].font.size = Pt(8.5)
        hp.runs[0].font.color.rgb = RGBColor(120, 120, 120)

    # Styles
    styles = doc.styles
    normal_style = styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    lines = markdown_text.split('\n')
    i = 0
    in_code_block = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_table(tbl_lines):
        if not tbl_lines:
            return
        # Parse markdown table
        rows_data = []
        for l in tbl_lines:
            if re.match(r'^\s*\|?\s*:?-+:?\s*\|', l):
                continue  # separator
            parts = [c.strip() for c in l.strip().strip('|').split('|')]
            if parts and any(parts):
                rows_data.append(parts)
        if not rows_data:
            return
        
        num_cols = max(len(r) for r in rows_data)
        # normalize row length
        for r in rows_data:
            while len(r) < num_cols:
                r.append("")
                
        table = doc.add_table(rows=len(rows_data), cols=num_cols)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = True
        
        # Apply style
        for r_idx, row in enumerate(table.rows):
            is_header = (r_idx == 0)
            for c_idx, cell in enumerate(row.cells):
                cell.text = rows_data[r_idx][c_idx]
                p = cell.paragraphs[0]
                p.paragraph_format.line_spacing = 1.05
                p.paragraph_format.space_after = Pt(2)
                p.paragraph_format.space_before = Pt(2)
                
                if is_header:
                    set_cell_background(cell, "1E3A8A") # Navy
                    set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
                    for run in p.runs:
                        run.font.bold = True
                        run.font.color.rgb = RGBColor(255, 255, 255)
                        run.font.size = Pt(9.5)
                else:
                    if r_idx % 2 == 1:
                        set_cell_background(cell, "F8FAFC")
                    else:
                        set_cell_background(cell, "FFFFFF")
                    set_cell_margins(cell, top=80, bottom=80, left=150, right=150)
                    for run in p.runs:
                        run.font.size = Pt(9)
        doc.add_paragraph() # spacing

    while i < len(lines):
        line = lines[i]

        # Code block
        if line.startswith("```"):
            if in_code_block:
                in_code_block = False
                # flush code block
                tbl = doc.add_table(rows=1, cols=1)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = tbl.rows[0].cells[0]
                set_cell_background(cell, "F1F5F9")
                set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
                cp = cell.paragraphs[0]
                cp.paragraph_format.space_after = Pt(0)
                cp.paragraph_format.line_spacing = 1.0
                crun = cp.add_run('\n'.join(code_lines))
                crun.font.name = 'Consolas'
                crun.font.size = Pt(8.5)
                crun.font.color.rgb = RGBColor(30, 41, 59)
                code_lines = []
                doc.add_paragraph()
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue
        
        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Tables
        if '|' in line and not line.strip().startswith('#'):
            if not in_table:
                in_table = True
                table_lines = [line]
            else:
                table_lines.append(line)
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                flush_table(table_lines)
                table_lines = []

        # Headings
        if line.startswith('# '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(16)
            p.paragraph_format.space_after = Pt(8)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(line[2:].strip())
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = RGBColor(30, 58, 138) # Dark blue
        elif line.startswith('## '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(line[3:].strip())
            run.font.size = Pt(15)
            run.font.bold = True
            run.font.color.rgb = RGBColor(37, 99, 235) # Blue
        elif line.startswith('### '):
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(line[4:].strip())
            run.font.size = Pt(12)
            run.font.bold = True
            run.font.color.rgb = RGBColor(71, 85, 105) # Slate
        elif line.startswith('---'):
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(6)
            p.add_run("_______________________________________________________________________________").font.color.rgb = RGBColor(226, 232, 240)
        elif line.startswith('- ') or line.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            clean_text = line[2:].strip()
            # formatting bold inside
            parts = re.split(r'(\*\*.*?\*\*)', clean_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    p.add_run(part)
        elif re.match(r'^\d+\.\s', line):
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            clean_text = re.sub(r'^\d+\.\s', '', line).strip()
            parts = re.split(r'(\*\*.*?\*\*)', clean_text)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    p.add_run(part)
        elif line.strip():
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.line_spacing = 1.15
            parts = re.split(r'(\*\*.*?\*\*)', line.strip())
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    r = p.add_run(part[2:-2])
                    r.font.bold = True
                else:
                    p.add_run(part)

        i += 1

    if in_table:
        flush_table(table_lines)

    doc.save(DOCX_OUT_PATH)
    print(f"DOCX created successfully at: {DOCX_OUT_PATH}")

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # skip cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header
        self.drawString(54, 800, "DevSphere — Academic Project Report | Course 21CSE354T")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 794, 541, 794)
        
        # Footer
        self.line(54, 50, 541, 50)
        self.drawString(54, 38, "SRM Institute of Science and Technology — Spring Boot Framework Activity")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(541, 38, page_str)
        self.restoreState()

def create_pdf(markdown_text):
    print("Generating PDF...")
    doc = SimpleDocTemplate(
        PDF_OUT_PATH,
        pagesize=A4,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
        spaceAfter=6
    )

    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#2563EB'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    code_style = ParagraphStyle(
        'CustomCode',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#0F172A'),
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#1E293B')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=body_style,
        leftIndent=15,
        spaceAfter=3
    )

    story = []
    lines = markdown_text.split('\n')
    i = 0
    in_code = False
    code_lines = []
    in_table = False
    table_lines = []

    def flush_pdf_table(tbl_lines):
        if not tbl_lines:
            return
        rows_data = []
        for l in tbl_lines:
            if re.match(r'^\s*\|?\s*:?-+:?\s*\|', l):
                continue
            parts = [c.strip() for c in l.strip().strip('|').split('|')]
            if parts and any(parts):
                rows_data.append(parts)
        if not rows_data:
            return

        num_cols = max(len(r) for r in rows_data)
        for r in rows_data:
            while len(r) < num_cols:
                r.append("")

        table_data = []
        for r_idx, row in enumerate(rows_data):
            row_cells = []
            is_h = (r_idx == 0)
            for c_idx, cell in enumerate(row):
                # Clean markdown formatting inside cell
                clean = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', cell)
                clean = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', clean)
                style_to_use = table_header_style if is_h else table_cell_style
                row_cells.append(Paragraph(clean, style_to_use))
            table_data.append(row_cells)

        # Distribute column widths across available width (approx 487 pt)
        col_width = 487.0 / num_cols
        t = Table(table_data, colWidths=[col_width]*num_cols)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
            ('TOPPADDING', (0, 0), (-1, 0), 5),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 1), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(Spacer(1, 4))
        story.append(t)
        story.append(Spacer(1, 8))

    while i < len(lines):
        line = lines[i]

        if line.startswith("```"):
            if in_code:
                in_code = False
                chunk_size = 22
                for c_start in range(0, max(1, len(code_lines)), chunk_size):
                    sub_lines = code_lines[c_start:c_start + chunk_size]
                    code_text = "<br/>".join([c.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace(" ", "&nbsp;") for c in sub_lines])
                    if not code_text.strip():
                        continue
                    code_p = Paragraph(code_text, code_style)
                    code_table = Table([[code_p]], colWidths=[487])
                    code_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
                        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                        ('TOPPADDING', (0, 0), (-1, -1), 4),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                        ('LEFTPADDING', (0, 0), (-1, -1), 8),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                    ]))
                    story.append(Spacer(1, 2))
                    story.append(code_table)
                story.append(Spacer(1, 6))
                code_lines = []
            else:
                in_code = True
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        if '|' in line and not line.strip().startswith('#'):
            if not in_table:
                in_table = True
                table_lines = [line]
            else:
                table_lines.append(line)
            i += 1
            continue
        else:
            if in_table:
                in_table = False
                flush_pdf_table(table_lines)
                table_lines = []

        if line.startswith('# '):
            story.append(Paragraph(line[2:].strip(), h1_style))
        elif line.startswith('## '):
            # Page break for major sections (SECTION 1 to SECTION 26)
            if re.match(r'^##\s+SECTION\s+\d+', line):
                story.append(PageBreak())
            story.append(Paragraph(line[3:].strip(), h2_style))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:].strip(), h3_style))
        elif line.startswith('---'):
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceAfter=6))
        elif line.startswith('- ') or line.startswith('* '):
            text = line[2:].strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', text)
            story.append(Paragraph(f"• {text}", bullet_style))
        elif re.match(r'^\d+\.\s', line):
            text = line.strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', text)
            story.append(Paragraph(text, bullet_style))
        elif line.strip():
            text = line.strip()
            text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'`(.*?)`', r'<font name="Courier">\1</font>', text)
            story.append(Paragraph(text, body_style))

        i += 1

    if in_table:
        flush_pdf_table(table_lines)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF created successfully at: {PDF_OUT_PATH}")

if __name__ == '__main__':
    with open(DOC_MD_PATH, 'r', encoding='utf-8') as f:
        md_content = f.read()
    create_docx(md_content)
    create_pdf(md_content)
