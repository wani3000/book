from __future__ import annotations

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
        "source": WORKSPACE_ROOT / "output/pdf/codex-solo-service-playbook.pdf",
        "cover": WEBSITE_ROOT / "public/ebook-cover.png",
        "deployed": WEBSITE_ROOT / "public/library-assets/codex-7f3c2a91.pdf",
        "background": "#070d3e",
    },
    {
        "source": WORKSPACE_ROOT / "output/pdf/career-design-philip.pdf",
        "cover": WEBSITE_ROOT / "public/career-cover.png",
        "deployed": WEBSITE_ROOT / "public/library-assets/career-4e8b1d67.pdf",
        "background": "#ffffff",
    },
    {
        "source": WORKSPACE_ROOT / "output/pdf/flight-attendant-to-it-seonara.pdf",
        "cover": WEBSITE_ROOT / "public/jane-cover.png",
        "deployed": WEBSITE_ROOT / "public/library-assets/jane-9a6d5c20.pdf",
        "background": "#f5efe8",
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


def replace_first_page(pdf_path: Path, cover_path: Path, background: str) -> None:
    with NamedTemporaryFile(suffix="-cover.pdf", delete=False) as cover_file:
        temporary_cover = Path(cover_file.name)
    with NamedTemporaryFile(suffix="-book.pdf", delete=False) as book_file:
        temporary_book = Path(book_file.name)

    try:
        make_cover_page(cover_path, background, temporary_cover)
        source_reader = PdfReader(str(pdf_path))
        cover_reader = PdfReader(str(temporary_cover))
        writer = PdfWriter()
        writer.clone_document_from_reader(source_reader)
        del writer.pages[0]
        writer.insert_page(cover_reader.pages[0], 0)
        if source_reader.metadata:
            writer.add_metadata(dict(source_reader.metadata))
        with temporary_book.open("wb") as destination:
            writer.write(destination)
        temporary_book.replace(pdf_path)
    finally:
        temporary_cover.unlink(missing_ok=True)
        temporary_book.unlink(missing_ok=True)


def main() -> None:
    for book in BOOKS:
        replace_first_page(book["source"], book["cover"], book["background"])
        book["deployed"].write_bytes(book["source"].read_bytes())
        print(f"updated: {book['source'].name} -> {book['deployed'].name}")


if __name__ == "__main__":
    main()
