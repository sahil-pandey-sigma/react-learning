import argparse
import sys
import logging
import os
import yaml
import json
from dotenv import load_dotenv

load_dotenv()

try:
    from src.pdf_ocr import process_pdf_and_ocr
    from src.gemini_processor import process_document_with_gemini, consolidate_data_with_gemini
    from src.selenium_filler import fill_online_form
    from src.utils import load_config, cleanup_temp_dir
except ImportError as e:
    logging.error(f"Failed to import source modules: {e}")
    sys.exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.getLogger('selenium').setLevel(logging.WARNING)
logging.getLogger('webdriver_manager').setLevel(logging.WARNING)

def group_data_by_form_steps(flat_data):
    sectioned = {
        "step1": {}, "step2": {}, "step3": {}, "step4": {}
    }
    for key, value in flat_data.items():
        if key in ["full_name", "date_of_birth", "gender", "father_name", "address"]:
            sectioned["step1"][key] = value
        elif key in ["pan_number", "aadhaar_number"]:
            sectioned["step2"][key] = value
        elif key in ["account_number", "ifsc_code", "bank_name"]:
            sectioned["step3"][key] = value
        elif key in ["email", "phone_number"]:
            sectioned["step4"][key] = value
    return sectioned

def main():
    parser = argparse.ArgumentParser(description="AI document extractor and form filler")
    parser.add_argument('--documents', type=str, nargs='+', required=True)
    parser.add_argument('--form', type=str, required=True)
    parser.add_argument('--temp_dir', type=str, default='temp/')
    parser.add_argument('--config_dir', type=str, default='config/')
    parser.add_argument('--skip_fill', action='store_true')
    args = parser.parse_args()

    if not os.path.exists(args.temp_dir):
        os.makedirs(args.temp_dir)
    else:
        cleanup_temp_dir(args.temp_dir)

    try:
        form_mappings = load_config(os.path.join(args.config_dir, 'form_mappings.yaml'))
        gemini_prompts = load_config(os.path.join(args.config_dir, 'gemini_prompts.yaml'))
    except Exception as e:
        logging.error(f"Error loading config: {e}")
        sys.exit(1)

    if 'initial_extraction' not in gemini_prompts or 'consolidation' not in gemini_prompts:
        logging.error("Missing required prompts in gemini_prompts.yaml")
        sys.exit(1)

    extracted_document_results = []
    for doc_path in args.documents:
        if not os.path.exists(doc_path):
            logging.warning(f"Skipping not found document: {doc_path}")
            continue
        try:
            logging.info(f"OCR: {doc_path}")
            ocr_text = process_pdf_and_ocr(doc_path, temp_dir=args.temp_dir)
            if not ocr_text or len(ocr_text.strip()) < 50:
                logging.warning(f"Low OCR content in {doc_path}")
                continue
            prompt = gemini_prompts['initial_extraction']
            gemini_output = process_document_with_gemini(ocr_text, prompt)
            if gemini_output and 'document_type' in gemini_output and 'data' in gemini_output:
                extracted_document_results.append({
                    'doc_path': doc_path,
                    'extracted': gemini_output
                })
        except Exception as e:
            logging.error(f"Error processing {doc_path}: {e}", exc_info=True)

    if not extracted_document_results:
        cleanup_temp_dir(args.temp_dir)
        sys.exit("No documents extracted")

    try:
        consolidation_prompt = gemini_prompts['consolidation']
        consolidated_data = consolidate_data_with_gemini(extracted_document_results, consolidation_prompt)
        if not consolidated_data or not isinstance(consolidated_data, dict):
            cleanup_temp_dir(args.temp_dir)
            sys.exit("Consolidation failed")
        logging.info("Flat consolidated data:")
        logging.info(json.dumps(consolidated_data, indent=2))

        sectioned_data = group_data_by_form_steps(consolidated_data)
        logging.info("Sectioned data for form:")
        logging.info(json.dumps(sectioned_data, indent=2))
    except Exception as e:
        cleanup_temp_dir(args.temp_dir)
        sys.exit(f"Error in consolidation: {e}")

    if args.skip_fill:
        logging.info("--skip_fill detected. Not launching browser.")
        cleanup_temp_dir(args.temp_dir)
        return

    if args.form not in form_mappings:
        cleanup_temp_dir(args.temp_dir)
        sys.exit(f"No form mapping found for '{args.form}'")

    try:
        logging.info("Launching browser to fill form...")
        driver = fill_online_form(args.form, sectioned_data, form_mappings)
        if driver:
            logging.info("Form filling complete. Review and submit in browser.")
            # No input() pause here
            driver.quit()
    except Exception as e:
        logging.error(f"Selenium error: {e}", exc_info=True)

    cleanup_temp_dir(args.temp_dir)

if __name__ == "__main__":
    main()


# import argparse
# import sys
# import logging
# import os
# import json
# from dotenv import load_dotenv

# load_dotenv()

# try:
#     from src.selenium_filler import fill_online_form
#     from src.utils import load_config, cleanup_temp_dir
# except ImportError as e:
#     logging.error(f"Failed to import source modules: {e}")
#     sys.exit(1)

# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logging.getLogger('selenium').setLevel(logging.WARNING)
# logging.getLogger('webdriver_manager').setLevel(logging.WARNING)

# def group_data_by_form_steps(flat_data):
#     sectioned = {
#         "step1": {}, "step2": {}, "step3": {}, "step4": {}
#     }
#     for key, value in flat_data.items():
#         if key in ["full_name", "date_of_birth", "gender", "father_name", "address"]:
#             sectioned["step1"][key] = value
#         elif key in ["pan_number", "aadhaar_number"]:
#             sectioned["step2"][key] = value
#         elif key in ["account_number", "ifsc_code", "bank_name"]:
#             sectioned["step3"][key] = value
#         elif key in ["email", "phone_number"]:
#             sectioned["step4"][key] = value
#     return sectioned

# def main():
#     parser = argparse.ArgumentParser(description="Test AI form filler with dummy data")
#     parser.add_argument('--form', type=str, required=True)
#     parser.add_argument('--config_dir', type=str, default='config/')
#     parser.add_argument('--skip_fill', action='store_true')
#     args = parser.parse_args()

#     try:
#         form_mappings = load_config(os.path.join(args.config_dir, 'form_mappings.yaml'))
#     except Exception as e:
#         logging.error(f"Error loading config: {e}")
#         sys.exit(1)

#     if args.form not in form_mappings:
#         sys.exit(f"No form mapping found for '{args.form}'")

#     # === Dummy Flat Data for Testing ===
#     consolidated_data = {
#         "full_name": "Rajesh Kumar Sharma",
#         "date_of_birth": "1985-08-15",
#         "gender": "Male",
#         "father_name": "Virendra Prasad Sharma",
#         "address": "FLAT NO. 123, BLOCK B, GREEN PARK EXTENSION, NEW DELHI - 110016",
#         "pan_number": "ABCDE1234F",
#         "aadhaar_number": "123456789012",
#         "account_number": "987654321012",
#         "ifsc_code": "HDFC0001234",
#         "bank_name": "HDFC Bank",
#         "email": "rajesh.sharma@example.com",
#         "phone_number": "9876543210"
#     }

#     logging.info("Using dummy test data:")
#     logging.info(json.dumps(consolidated_data, indent=2))

#     sectioned_data = group_data_by_form_steps(consolidated_data)
#     logging.info("Sectioned data:")
#     logging.info(json.dumps(sectioned_data, indent=2))

#     if args.skip_fill:
#         logging.info("--skip_fill detected. Not launching browser.")
#         return

#     try:
#         logging.info("Launching browser to fill form with dummy data...")
#         driver = fill_online_form(args.form, sectioned_data, form_mappings)
#         if driver:
#             logging.info("Form filled. Please review and submit manually.")
#             driver.quit()
#     except Exception as e:
#         logging.error(f"Selenium error: {e}", exc_info=True)

# if __name__ == "__main__":
#     main()
