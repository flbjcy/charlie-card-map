"""Render the public project-progress Markdown to a matching PDF."""

from __future__ import annotations

import html
import json
import re
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import BaseDocTemplate, Flowable, Frame, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "PROJECT_PROGRESS.md"
OUTPUT = ROOT / "public" / "findmycharlie-progress.pdf"
HOURLY = ROOT / "report-data" / "hourly-activity-2026-10-28T1608Z.json"

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


class HourlyCharts(Flowable):
    def __init__(self):
        super().__init__()
        self.width = 7.2 * inch
        self.height = 3.55 * inch
        data = json.loads(HOURLY.read_text())["hours"]
        by_hour = {int(item["hour"]): item for item in data}
        first, last = min(by_hour), max(by_hour)
        self.hours = [
            by_hour.get(hour, {"hour": hour, "views": 0, "communityReports": 0})
            for hour in range(first, last + 1, 3600000)
        ]

    def draw(self):
        c = self.canv
        tz = ZoneInfo("America/New_York")
        left, right = 30, self.width - 8
        plot_width = right - left
        n = len(self.hours)
        for base, key, title, color in [
            (142, "views", "Page views per hour", BLUE),
            (12, "communityReports", "Community reports submitted per hour", colors.HexColor("#BF6D21")),
        ]:
            values = [int(row[key]) for row in self.hours]
            maximum = max(1, max(values))
            c.setFillColor(INK)
            c.setFont("Arial-Bold", 8)
            c.drawString(left, base + 104, title)
            c.setFont("Arial", 7)
            c.setFillColor(MUTED)
            c.drawRightString(right, base + 104, f"{sum(values)} total")
            c.setStrokeColor(colors.HexColor("#D8DCD7"))
            for fraction in (0, .5, 1):
                y = base + 12 + 82 * fraction
                c.line(left, y, right, y)
                c.setFont("Arial", 6.3)
                c.drawRightString(left - 5, y - 2, str(round(maximum * fraction)))
            stride = plot_width / n
            c.setFillColor(color)
            for i, value in enumerate(values):
                if value:
                    c.rect(left + i * stride + 1, base + 12, max(1.5, stride - 2), 82 * value / maximum, stroke=0, fill=1)
            c.setFillColor(MUTED)
            for i, row in enumerate(self.hours):
                local = datetime.fromtimestamp(row["hour"] / 1000, tz)
                if local.hour in (0, 6, 12, 18):
                    c.drawCentredString(left + (i + .5) * stride, base, local.strftime("%b %-d %-I%p"))


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
            if line == "## Hourly activity":
                blocks.append(PageBreak())
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
        if para[0].startswith("The charts in the PDF use a snapshot"):
            blocks.extend([Spacer(1, 8), HourlyCharts(), Spacer(1, 8)])
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
