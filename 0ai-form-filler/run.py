import argparse
import sys
import logging
import os
import yaml
import json
from dotenv import load_dotenv # Optional: for loading API key from .env

# Load environment variables (e.g., GOOGLE_API_KEY)
load_dotenv()

# Import functions from src modules (assuming they exist)
try:
    from src.pdf_ocr import process_pdf_and_ocr
    from src.gemini_processor import process_document_with_gemini, consolidate_data_with_gemini
    from src.selenium_filler import fill_online_form
    from src.utils import load_config, cleanup_temp_dir # Import cleanup utility
except ImportError as e:
    logging.error(f"Failed to import source modules: {e}")
    logging.error("Please ensure you are running the script from the project root directory.")
    sys.exit(1)


# Set up basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# Set Selenium logging level higher to reduce verbosity from webdriver_manager etc.
logging.getLogger('selenium').setLevel(logging.WARNING)
logging.getLogger('webdriver_manager').setLevel(logging.WARNING)


def main():
    parser = argparse.ArgumentParser(description="Automated document data extraction and form filling tool.")

    parser.add_argument(
        '--documents',
        type=str,
        nargs='+', # '+' means one or more arguments are required
        required=True,
        help="Paths to the PDF document files (e.g., --documents path/to/doc1.pdf path/to/doc2.pdf)"
    )

    parser.add_argument(
        '--form',
        type=str,
        required=True, # This argument is mandatory
        help="Name or identifier of the target online form (e.g., 'local_test_form'). Requires a corresponding mapping in config/form_mappings.yaml"
    )

    parser.add_argument(
        '--temp_dir',
        type=str,
        default='temp/', # Default to the 'temp' directory
        help="Directory to store temporary files like images generated from PDFs. Will be created if it doesn't exist."
    )

    parser.add_argument(
        '--config_dir',
        type=str,
        default='config/',
        help="Directory containing configuration files (form_mappings.yaml, gemini_prompts.yaml)."
    )
    
    # Optional argument to skip the form filling step
    parser.add_argument(
        '--skip_fill',
        action='store_true', # Store True when the flag is present
        help="Skip the Selenium form filling step after data extraction and consolidation."
    )


    args = parser.parse_args()

    # --- Prepare directories ---
    if not os.path.exists(args.temp_dir):
        os.makedirs(args.temp_dir)
        logging.info(f"Created temporary directory: {args.temp_dir}")
    else:
        # Optional: Clean temp dir at the start of each run
        logging.info(f"Temporary directory {args.temp_dir} already exists. Cleaning up previous files.")
        cleanup_temp_dir(args.temp_dir)


    # --- Load Configurations ---
    form_mappings = {}
    gemini_prompts = {}
    try:
        form_mappings = load_config(os.path.join(args.config_dir, 'form_mappings.yaml'))
        gemini_prompts = load_config(os.path.join(args.config_dir, 'gemini_prompts.yaml'))
        logging.info("Configuration files loaded.")
    except FileNotFoundError as e:
        logging.error(f"Error loading configuration: {e}")
        sys.exit(1)
    except yaml.YAMLError as e:
        logging.error(f"Error parsing configuration files: {e}")
        sys.exit(1)
    except Exception as e:
         logging.error(f"An unexpected error occurred loading config: {e}")
         sys.exit(1)

    # Check if necessary prompts exist
    if 'initial_extraction' not in gemini_prompts or 'consolidation' not in gemini_prompts:
         logging.error("Missing required prompts ('initial_extraction' or 'consolidation') in gemini_prompts.yaml")
         sys.exit(1)

    # --- Process Each Document ---
    extracted_document_results = [] # List to hold structured data from each document

    logging.info(f"Processing {len(args.documents)} documents...")

    for doc_path in args.documents:
        if not os.path.exists(doc_path):
            logging.warning(f"Document not found, skipping: {doc_path}")
            continue

        logging.info(f"Processing document: {doc_path}")

        try:
            # 1. Process PDF and get OCR text
            # process_pdf_and_ocr needs to handle the Poppler/Image conversion and Tesseract call
            logging.info("  Running OCR...")
            full_ocr_text = process_pdf_and_ocr(doc_path, temp_dir=args.temp_dir)

            if not full_ocr_text or len(full_ocr_text.strip()) < 50: # Basic check for sufficient text
                 logging.warning(f"  Could not get enough text from {doc_path} via OCR. Skipping extraction for this document.")
                 continue

            # 2. Use Gemini for Classification and Initial Extraction
            logging.info("  Sending text to Gemini for initial processing...")
            initial_extraction_prompt = gemini_prompts['initial_extraction']
            # Expect Gemini to return JSON like {'document_type': '...', 'data': {...}}
            gemini_output = process_document_with_gemini(full_ocr_text, initial_extraction_prompt)

            if gemini_output and isinstance(gemini_output, dict) and 'document_type' in gemini_output and 'data' in gemini_output and isinstance(gemini_output['data'], dict):
                logging.info(f"  Gemini identified document type: {gemini_output['document_type']}")
                logging.info(f"  Gemini extracted initial data: {json.dumps(gemini_output['data'], indent=2)[:500]}...") # Log snippet
                extracted_document_results.append({
                    'doc_path': doc_path, # Keep track of the source file
                    'extracted': gemini_output # Store the structured output from Gemini
                })
            else:
                 logging.warning(f"  Gemini did not return expected structured output (dict with 'document_type' and 'data' keys) for {doc_path}.")
                 # Optionally log the raw Gemini response for debugging
                 # logging.warning(f"  Raw Gemini response (if available): {gemini_output}")


        except Exception as e:
            # Catch potential errors during processing one document to allow others to proceed
            logging.error(f"  Error processing {doc_path}: {e}", exc_info=True)


    # --- Consolidate Data using Gemini ---
    if not extracted_document_results:
        logging.error("No data was successfully extracted from any document for consolidation. Exiting.")
        # Cleanup temp files even on error
        cleanup_temp_dir(args.temp_dir)
        sys.exit(1)

    logging.info(f"Consolidating data from {len(extracted_document_results)} documents using Gemini...")

    consolidated_data = None
    try:
        consolidation_prompt = gemini_prompts['consolidation']
        # Pass the list of all initial extracted results to Gemini
        consolidated_data = consolidate_data_with_gemini(extracted_document_results, consolidation_prompt)

        if not consolidated_data or not isinstance(consolidated_data, dict):
             logging.error("Gemini failed to consolidate data or returned invalid format. Exiting.")
             # Cleanup temp files even on error
             cleanup_temp_dir(args.temp_dir)
             sys.exit(1)

        logging.info(f"Consolidated Data: {json.dumps(consolidated_data, indent=2)}") # Pretty print consolidated data

    except Exception as e:
         logging.error(f"An error occurred during data consolidation with Gemini: {e}", exc_info=True)
         # Cleanup temp files even on error
         cleanup_temp_dir(args.temp_dir)
         sys.exit(1)


    # --- Map Consolidated Data to Target Form Fields ---
    if args.form not in form_mappings:
        logging.error(f"No form mapping found for target form: '{args.form}'. Please check config/form_mappings.yaml")
        # Cleanup temp files even on error
        cleanup_temp_dir(args.temp_dir)
        sys.exit(1)

    target_form_mapping = form_mappings[args.form]
    logging.info(f"Using mapping for form: '{args.form}'")

    # Prepare data for form filling - this involves looking up values in consolidated_data
    # based on the keys/paths specified in target_form_mapping.
    data_to_fill = {}
    # Exclude 'url' key from mappings when preparing data for filling
    field_map_only = {k: v for k, v in target_form_mapping.items() if k != 'url'}

    for field_locator, data_key in field_map_only.items():
        # data_key is expected to be a key from the consolidated_data dictionary
        try:
             # Check if data_key exists and is not None in consolidated_data
             if data_key in consolidated_data and consolidated_data[data_key] is not None:
                 # Ensure data is string for Selenium, handle booleans etc. if needed
                 value_to_fill = consolidated_data[data_key]
                 data_to_fill[field_locator] = str(value_to_fill)
                 # log value to fill, but maybe censor sensitive data in logs in a real tool
                 logging.debug(f"  Mapping '{data_key}' to field '{field_locator}' with value '{data_to_fill[field_locator]}'")
             else:
                 # Field might be optional or data wasn't found/consolidated
                 logging.debug(f"  Data field '{data_key}' required for form field '{field_locator}' not found or is null in consolidated data. This field will be left empty.")
                 # We don't add it to data_to_fill if not found; selenium_filler skips if not in dict.

        except Exception as e:
             logging.warning(f"  Error mapping data field '{data_key}' to form field '{field_locator}': {e}")


    if not data_to_fill and not args.skip_fill:
         logging.warning("No data could be mapped to the target form fields based on provided documents and mapping.")
         print("\n>>> No data was available to fill the form.")
         # cleanup_temp_dir(args.temp_dir) # Already in finally
         input(">>> Press Enter to exit...")
         sys.exit(0) # Exit gracefully if no data and not skipping fill

    logging.info(f"Data prepared for form filling ({len(data_to_fill)} fields): {data_to_fill}")

    # --- Use Selenium to fill the form (unless skip_fill is set) ---
    driver_instance = None # Initialize driver_instance outside try
    try:
        if not args.skip_fill:
            try:
                logging.info(f"Launching browser and filling form '{args.form}'...")
                # fill_online_form now returns the driver instance or None
                driver_instance = fill_online_form(args.form, consolidated_data, form_mappings)

                if driver_instance: # Check if driver was successfully created and returned
                    logging.info("  Selenium form filling complete.")
                    print("\n>>> Browser should have opened and form filled now.")
                    print(">>> Please **review the form** in the opened browser window, make any corrections, and click the 'Simulate Submit' button manually.")
                    # Pause the script execution while the browser stays open
                    input(">>> Press Enter in this console window after you have reviewed and submitted the form, or closed the browser...")
                else:
                     # fill_online_form would have logged the error
                     print("\n>>> Failed to open browser or fill form. Check logs above.")
                     # No need to ask for input here, fill_online_form might have already done it or driver is None

            except Exception as e:
                # Catch any unexpected errors during the selenium call itself
                logging.error(f"An unexpected error occurred during the Selenium phase: {e}", exc_info=True)
                print("\n>>> An unexpected error occurred. Check logs above.")
                # No input here, as the error might be critical and prevent interaction
                # driver_instance will be None or the error happened before it could be used
        else:
             logging.info("--skip_fill flag detected. Skipping Selenium form filling step.")
             print("\n>>> Selenium form filling skipped as requested.")
             # Pause to allow user to see console logs if needed
             # input(">>> Press Enter to exit...") # Optional pause here

    # --- Cleanup ---
    finally:
        if driver_instance:
            logging.info("Quitting browser.")
            driver_instance.quit()

        logging.info("Cleaning up temporary files...")
        cleanup_temp_dir(args.temp_dir)

    logging.info("Script finished.")


if __name__ == "__main__":
    main()