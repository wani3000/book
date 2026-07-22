from __future__ import annotations

import argparse
from pathlib import Path
from tempfile import NamedTemporaryFile

from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A5
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


WEBSITE_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = WEBSITE_ROOT.parent

BOOKS = (
    {
        "product": "codex",
        "source": WORKSPACE_ROOT / "output/pdf/codex-solo-service-playbook.pdf",
        "cover": WEBSITE_ROOT / "public/ebook-cover.png",
        "deployed": WEBSITE_ROOT / "public/library-assets/codex-7461d974.pdf",
        "background": "#070d3e",
    },
    {
        "product": "career",
        "source": WORKSPACE_ROOT / "output/pdf/career-design-philip.pdf",
        "cover": WEBSITE_ROOT / "public/career-cover.png",
        "deployed": WEBSITE_ROOT / "public/library-assets/career-4e8b1d67.pdf",
        "background": "#ffffff",
    },
    {
        "product": "jane",
        "source": WORKSPACE_ROOT / "output/pdf/flight-attendant-to-it-seonara.pdf",
        "cover": WEBSITE_ROOT / "public/jane-cover.png",
        "deployed": WEBSITE_ROOT / "public/library-assets/jane-fc5efcfd.pdf",
        "background": "#f5efe8",
        "author": "제인",
    },
)


def make_cover_page(image_path: Path, background: str, output_path: Path) -> None:
    page_width, page_height = A5
    image = ImageReader(str(image_path))
    image_width, image_height = image.getSize()
    scale = min(page_width / image_width, page_height / image_height)
    draw_width = image_width * scale
    draw_height = image_height * scale

    pdf = canvas.Canvas(str(output_path), pagesize=A5)
    pdf.setFillColor(HexColor(background))
    pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
    pdf.drawImage(
        image,
        (page_width - draw_width) / 2,
        (page_height - draw_height) / 2,
        width=draw_width,
        height=draw_height,
        preserveAspectRatio=True,
        mask="auto",
    )
    pdf.showPage()
    pdf.save()


def copy_outline(reader: PdfReader, writer: PdfWriter) -> None:
    def add_items(items: list, parent=None) -> None:
        previous = None
        for item in items:
            if isinstance(item, list):
                add_items(item, previous or parent)
                continue
            page_number = reader.get_destination_page_number(item)
            if page_number < 0:
                continue
            previous = writer.add_outline_item(item.title, page_number, parent=parent)

    add_items(reader.outline)


def replace_first_page(pdf_path: Path, cover_path: Path, background: str, author: str | None = None) -> None:
    with NamedTemporaryFile(suffix="-cover.pdf", delete=False) as cover_file:
        temporary_cover = Path(cover_file.name)
    with NamedTemporaryFile(suffix="-book.pdf", delete=False) as book_file:
        temporary_book = Path(book_file.name)

    try:
        make_cover_page(cover_path, background, temporary_cover)
        source_reader = PdfReader(str(pdf_path))
        cover_reader = PdfReader(str(temporary_cover))
        writer = PdfWriter()
        writer.add_page(cover_reader.pages[0])
        for page in source_reader.pages[1:]:
            writer.add_page(page)
        copy_outline(source_reader, writer)
        metadata = dict(source_reader.metadata or {})
        if author:
            metadata["/Author"] = author
        if metadata:
            writer.add_metadata(metadata)
        with temporary_book.open("wb") as destination:
            writer.write(destination)
        temporary_book.replace(pdf_path)
    finally:
        temporary_cover.unlink(missing_ok=True)
        temporary_book.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="웹 상세페이지 표지를 전자책 PDF 첫 페이지에 적용합니다.")
    parser.add_argument("--product", choices=["codex", "career", "jane"], help="한 권만 갱신합니다. 생략하면 세 권을 모두 갱신합니다.")
    args = parser.parse_args()
    for book in BOOKS:
        if args.product and book["product"] != args.product:
            continue
        replace_first_page(book["source"], book["cover"], book["background"], book.get("author"))
        book["deployed"].write_bytes(book["source"].read_bytes())
        print(f"updated: {book['source'].name} -> {book['deployed'].name}")


if __name__ == "__main__":
    main()
