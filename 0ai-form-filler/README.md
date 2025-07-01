# Document Data Extractor and Form Filler Prototype

This project is a Python prototype to extract data from various PDF documents (like Aadhaar, PAN, Passbook) using Google Tesseract OCR and Gemini Pro AI, and then use that data to automatically fill an online web form using Selenium. The final form submission is left to the user for review and verification.

**Note:** This is a prototype demonstrating the core workflow. It requires significant external setup and may not be robust for all document variations or complex web forms.

## Features

*   Accepts multiple PDF document paths as input.
*   Uses Google Tesseract for OCR to extract text from PDFs.
*   Uses Gemini Pro to:
    *   Identify the type of each document generically.
    *   Extract relevant structured data from each document.
    *   Consolidate data from multiple documents into a single profile.
*   Fills out a target online form using Selenium based on configured mappings.
*   Pauses after filling the form, allowing the user to review and manually submit in their browser.

## Prerequisites

1.  **Python 3.7+**: Make sure Python is installed.
2.  **Python Virtual Environment**: Recommended to manage dependencies.
3.  **Google Tesseract OCR Engine**: Must be installed and in your system's PATH.
    *   [Installation Guide](https://tesseract-ocr.github.io/tessdoc/Installation.html)
4.  **Poppler**: Required by Pillow to render PDF pages as images. Must be installed and in your system's PATH.
    *   [Installation Guide](https://pypdfium2.readthedocs.io/en/main/usage_basic.html#installing-poppler) (Or search for "install poppler [your OS]")
5.  **Google Cloud Account & Gemini Pro API Key**: Required to use the `google-generativeai` SDK. Obtain an API key from Google AI Studio or Google Cloud Console.
    *   Set the API key as an environment variable: `export GOOGLE_API_KEY='YOUR_API_KEY'` (Linux/macOS) or `$env:GOOGLE_API_KEY="YOUR_API_KEY"` (Windows PowerShell).
6.  **Web Browser**: Chrome, Firefox, or Edge.
7.  **Browser Driver**: Selenium needs a driver for your chosen browser (e.g., chromedriver for Chrome). `webdriver-manager` will *attempt* to download this automatically, but manual installation might be needed sometimes.

## Setup

1.  **Clone or download** this project.
2.  **Navigate** to the project directory in your terminal.
3.  **Create and activate** a virtual environment:
    ```bash
    python -m venv venv
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    .\venv\Scripts\activate
    ```
4.  **Install** the Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
5.  **Install External Dependencies**: Ensure Tesseract and Poppler are installed and in your system's PATH. Install your chosen web browser. `webdriver-manager` will try to handle the browser driver.
6.  **Set Gemini API Key**: Set the `GOOGLE_API_KEY` environment variable.
7.  **Add Sample Documents**: Place your sample PDF documents in the `samples/` directory.
8.  **Configure Mappings and Prompts**: Review and edit the files in the `config/` directory:
    *   `config/gemini_prompts.yaml`: Adjust the prompts for document processing and consolidation as needed.
    *   `config/form_mappings.yaml`: **Crucially**, define the Selenium locators and map them to the expected keys from the *consolidated* data output by Gemini.

## Usage

Run the main script from the command line, providing the paths to your documents and the name of the target form defined in `config/form_mappings.yaml`.

```bash
python run.py --documents samples/aadhaar_sample.pdf samples/pan_sample.pdf samples/passbook_sample.pdf --form banking_account_opening --temp_dir temp/ --config_dir config/