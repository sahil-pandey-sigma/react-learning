import os
import sys
import logging
import tempfile
from PIL import Image  # Part of Pillow
import pytesseract
import pypdf  # Optional, currently unused

# Setup logging
logging.basicConfig(level=logging.INFO)

# Import pdf2image and its exceptions
try:
    from pdf2image import convert_from_path
    from pdf2image.exceptions import PDFPageCountError, PDFSyntaxError
    logging.info("pdf2image imported successfully.")
except ImportError:
    logging.error("pdf2image is not installed. Please install it: pip install pdf2image")
    sys.exit(1)

# Configure Tesseract executable path if needed
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Check if Tesseract is available
try:
    version = pytesseract.get_tesseract_version()
    logging.info(f"Tesseract found, version: {version}")
except pytesseract.TesseractNotFoundError:
    logging.error("Tesseract is not installed or not in your system's PATH. Please install it.")
    logging.error("Refer to README.md for installation instructions.")
    sys.exit(1)

# Function to perform Tesseract OCR on a Pillow Image object
def ocr_image(image: Image.Image):
    """Performs Tesseract OCR on a Pillow Image object."""
    if image is None:
        return ""

    try:
        # Optional preprocessing:
        # image = image.convert('L')  # Convert to grayscale
        # from PIL import ImageFilter
        # image = image.filter(ImageFilter.SHARPEN)
        text = pytesseract.image_to_string(image, lang='eng')
        return text.strip()
    except pytesseract.TesseractNotFoundError:
        logging.error("Tesseract executable not found during OCR processing.")
        return ""
    except Exception as e:
        logging.error(f"Error during OCR processing: {e}")
        return ""

# Main processing function
def process_pdf_and_ocr(pdf_path: str, temp_dir: str, pages_to_process=None):
    """
    Processes a PDF file, converts pages to images using pdf2image,
    performs OCR using Tesseract, and returns concatenated text.

    Args:
        pdf_path (str): Path to the PDF file.
        temp_dir (str): Directory to save temporary images.
        pages_to_process (list, optional): 1-based page numbers to process.

    Returns:
        str: OCR-extracted text from specified pages.
    """
    all_text = []
    images = []

    try:
        logging.info("Converting PDF pages to images using pdf2image...")

        first_page = pages_to_process[0] if pages_to_process else 1
        last_page = pages_to_process[-1] if pages_to_process else None

        images = convert_from_path(pdf_path, first_page=first_page, last_page=last_page, dpi=300)

        logging.info(f"Successfully converted {len(images)} pages to images.")

    except (PDFPageCountError, PDFSyntaxError) as e:
        logging.error(f"Could not read PDF file: {pdf_path}. Error: {e}")
        return ""
    # except PDFPopplerPathError:
    #     logging.error("Poppler is not installed or not in your system's PATH.")
    #     logging.error("Please install Poppler and add its 'bin' directory to your system's PATH.")
    #     return ""
    except Exception as e:
        logging.error(f"Unexpected error during PDF to image conversion: {e}")
        return ""

    if not images:
        logging.warning(f"No images generated from PDF {pdf_path}. Cannot perform OCR.")
        return ""

    for i, image in enumerate(images):
        original_page_number = first_page + i
        if pages_to_process is not None and original_page_number not in pages_to_process:
            continue

        logging.info(f"Performing OCR on page {original_page_number}...")
        page_text = ocr_image(image)

        if page_text:
            all_text.append(f"[--- Page {original_page_number} ---]\n{page_text}")
            # Optionally save image for debugging
            # image_path = os.path.join(temp_dir, f"{os.path.basename(pdf_path)}_page_{original_page_number}.png")
            # image.save(image_path)
        else:
            logging.warning(f"No text obtained from OCR for page {original_page_number}.")

    for image in images:
        try:
            image.close()
        except Exception:
            pass

    return "\n".join(all_text)
