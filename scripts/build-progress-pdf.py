"""Render the public project-progress Markdown to a matching PDF."""

from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "PROJECT_PROGRESS.md"
OUTPUT = ROOT / "public" / "findmycharlie-progress.pdf"

pdfmetrics.registerFont(TTFont("Arial", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")
pdfmetrics.registerFont(TTFont("EBGaramond", str(ROOT / "public" / "fonts" / "eb-garamond.ttf")))

INK = colors.HexColor("#243239")
BLUE = colors.HexColor("#0A3A65")
YELLOW = colors.HexColor("#FFF176")
PALE = colors.HexColor("#FFFBE1")
MUTED = colors.HexColor("#5C696F")

title = ParagraphStyle("Title", fontName="EBGaramond", fontSize=25, leading=28, textColor=BLUE, spaceAfter=4)
subtitle = ParagraphStyle("Subtitle", fontName="Arial", fontSize=8.4, leading=12, textColor=MUTED, spaceAfter=11)
heading = ParagraphStyle("Heading", fontName="EBGaramond", fontSize=14, leading=16, textColor=BLUE, spaceBefore=6, spaceAfter=3, keepWithNext=True)
body = ParagraphStyle("Body", fontName="Arial", fontSize=8.0, leading=10.5, textColor=INK, spaceAfter=4, allowWidows=0, allowOrphans=0)
cell = ParagraphStyle("Cell", parent=body, fontSize=7.2, leading=9.3, spaceAfter=0)
cell_head = ParagraphStyle("CellHead", parent=cell, fontName="Arial-Bold", textColor=BLUE)
bullet = ParagraphStyle("Bullet", parent=body, leftIndent=10, firstLineIndent=-7, spaceAfter=2)


def markup(value: str) -> str:
    value = html.escape(value.strip())
    value = re.sub(r"\[([^]]+)\]\((https?://[^)]+)\)", r'<link href="\2" color="#165C9C">\1</link>', value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\*([^*]+)\*", r"<i>\1</i>", value)
    value = value.replace("&lt;br/&gt;", "<br/>")
    return value


def parse(md: str):
    blocks = []
    lines = md.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith("# "):
            blocks.append(Paragraph(markup(line[2:]), title))
            i += 1
            sub = []
            while i < len(lines) and lines[i].strip() and not lines[i].startswith("#"):
                sub.append(lines[i].strip())
                i += 1
            if sub:
                blocks.append(Paragraph(markup("<br/>".join(sub)), subtitle))
            continue
        if line.startswith("## "):
            blocks.append(Paragraph(markup(line[3:]), heading))
            i += 1
            continue
        if line.startswith("| "):
            rows = []
            while i < len(lines) and lines[i].lstrip().startswith("|"):
                parts = [p.strip() for p in lines[i].strip().strip("|").split("|")]
                if not all(set(p) <= {"-", ":", " "} for p in parts):
                    rows.append([Paragraph(markup(p), cell_head if not rows else cell) for p in parts])
                i += 1
            width = 7.2 * inch
            table = Table(rows, colWidths=[1.55 * inch, width - 1.55 * inch], repeatRows=1, hAlign="LEFT")
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), YELLOW),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 2.4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.4),
                ("LINEBELOW", (0, -1), (-1, -1), .5, colors.HexColor("#D7D9D1")),
            ]))
            blocks.extend([table, Spacer(1, 5)])
            continue
        if line.startswith("- "):
            blocks.append(Paragraph("• " + markup(line[2:]), bullet))
            i += 1
            continue
        para = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", "|", "- ")):
            para.append(lines[i].strip())
            i += 1
        blocks.append(Paragraph(markup(" ".join(para)), body))
    return blocks


class ProgressDoc(BaseDocTemplate):
    def __init__(self, filename):
        super().__init__(filename, pagesize=letter, leftMargin=.65 * inch, rightMargin=.65 * inch, topMargin=.72 * inch, bottomMargin=.58 * inch,
                         title="FindMyCharlie: project progress", author="Jia Hao Liang", subject="Development timeline, problems fixed, and measured site activity")
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate(id="main", frames=[frame], onPage=self.decorate))

    @staticmethod
    def decorate(canvas, doc):
        canvas.saveState()
        w, h = letter
        canvas.setFillColor(YELLOW)
        canvas.rect(0, h - .22 * inch, w, .22 * inch, stroke=0, fill=1)
        canvas.setFont("Arial", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(.65 * inch, .35 * inch, "FindMyCharlie  •  project progress  •  October 2026")
        canvas.drawRightString(w - .65 * inch, .35 * inch, str(doc.page))
        canvas.restoreState()


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    ProgressDoc(str(OUTPUT)).build(parse(SOURCE.read_text()))
    print(OUTPUT)
