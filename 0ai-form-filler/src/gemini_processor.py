import google.generativeai as genai
import os
import logging
import json
import time
import sys # Import sys

# Configure Gemini API
# Needs GOOGLE_API_KEY environment variable set
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
    logging.info("Gemini API configured.")
except KeyError:
    logging.error("GOOGLE_API_KEY environment variable not set. Please set it.")
    logging.error("Refer to README.md for instructions.")
    sys.exit(1) # Exit if API key is missing

# Choose the specific model you know is available and works with your key
# Based on your finding, use gemini-1.5-flash-latest
GEMINI_MODEL = 'models/gemini-1.5-flash-latest'

# Optional: Add a check here to see if this model is available
# try:
#      model_info = genai.get_model(GEMINI_MODEL)
#      if 'generateContent' not in model_info.supported_generation_methods:
#           logging.error(f"Model '{GEMINI_MODEL}' does not support generateContent.")
#           sys.exit(1)
#      logging.info(f"Using Gemini model: {GEMINI_MODEL}")
# except Exception as e:
#      logging.error(f"Could not retrieve info for model '{GEMINI_MODEL}' or it's not available: {e}")
#      logging.error("Run the model listing script/code to find available models.")
#      sys.exit(1)


def call_gemini_api(prompt_text, max_retries=3, delay=5):
    """Helper function to call Gemini API with retries."""
    # Ensure prompt_text is not excessively long for the model
    # You might need to truncate text or use a model with a larger context window
    # Gemini 1.5 Flash has a large context window (1M tokens), so this is less likely to be an issue
    # compared to older models, but it's still good to be aware.

    model = genai.GenerativeModel(GEMINI_MODEL)

    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt_text)

            # Check for blocked content or empty response
            if not response.candidates:
                 logging.warning(f"Gemini API returned no candidates (attempt {attempt + 1}). Safety settings might have blocked the content. Prompt start: {prompt_text[:100]}...")
                 # Log safety ratings if available
                 if response.prompt_feedback and response.prompt_feedback.safety_ratings:
                      logging.warning("Prompt Safety Ratings:")
                      for rating in response.prompt_feedback.safety_ratings:
                           logging.warning(f"  {rating.category}: {rating.probability}")

                 # If blocked on the last attempt, return None
                 if attempt == max_retries - 1:
                      logging.error("Max retries reached due to content blocking or empty response.")
                      return None
                 else:
                      logging.info(f"Retrying Gemini API call in {delay} seconds...")
                      time.sleep(delay)
                      continue # Go to the next attempt

            # Extract text from the response
            # response.text might raise ValueError if content is blocked (handled above)
            try:
                return response.text.strip()
            except ValueError:
                 logging.warning("Gemini response text is not available (potentially blocked content).")
                 # This case should ideally be covered by checking candidates above, but as a fallback:
                 if attempt == max_retries - 1:
                      logging.error("Max retries reached and response text remains unavailable.")
                      return None
                 else:
                      logging.info(f"Retrying Gemini API call in {delay} seconds...")
                      time.sleep(delay)
                      continue # Go to the next attempt


        except Exception as e:
            logging.error(f"Error calling Gemini API (Attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                logging.info(f"Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logging.error("Max retries reached for Gemini API call.")
                return None # Return None after all retries fail

    return None # Should not be reached if retries work or fail


def process_document_with_gemini(ocr_text: str, initial_extraction_prompt: str):
    """
    Uses Gemini to classify a document and extract initial data.
    Expects Gemini to return a JSON string.
    """
    logging.info("  Sending text to Gemini for initial processing (classification + extraction)...")
    # Ensure the prompt and text fit within the model's context window
    # Gemini 1.5 Flash has a 1M token window, which is huge, so this is usually fine.
    prompt = f"{initial_extraction_prompt}\n\nDocument Text:\n{ocr_text}"
    gemini_raw_response = call_gemini_api(prompt)

    if not gemini_raw_response:
        logging.warning("  Gemini initial processing returned empty or invalid response.")
        return None

    # Try to parse the response as JSON
    try:
        # Gemini might include markdown ```json ... ```
        # Need to strip it
        cleaned_response = gemini_raw_response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith('```'):
                 cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip() # Strip whitespace after removing markdown

        extracted_data = json.loads(cleaned_response)
        return extracted_data
    except json.JSONDecodeError as e:
        logging.error(f"  Gemini initial processing response was not valid JSON: {e}")
        logging.error(f"  Raw Gemini response: {gemini_raw_response}") # Log original raw response
        return None
    except Exception as e:
        logging.error(f"  An unexpected error occurred processing Gemini's initial response: {e}")
        logging.error(f"  Raw Gemini response: {gemini_raw_response}")
        return None


def consolidate_data_with_gemini(list_of_extracted_data: list, consolidation_prompt: str):
    """
    Uses Gemini to consolidate data from multiple documents.
    Expects list_of_extracted_data to be a list of dictionaries,
    each ideally having {'doc_path': '...', 'extracted': {'document_type': '...', 'data': {...}}}.
    Expects Gemini to return a single JSON string representing the consolidated profile.
    """
    logging.info("  Sending extracted data to Gemini for consolidation...")

    # Prepare the data to send to Gemini
    # Send the list of initial extraction results as a JSON string
    data_for_gemini = json.dumps(list_of_extracted_data, indent=2)

    # Ensure the prompt and data fit within the model's context window
    # Again, 1M token window is large, usually not an issue unless you have very long documents/many documents.
    prompt = f"{consolidation_prompt}\n\nExtracted Data from Documents:\n{data_for_gemini}"
    gemini_raw_response = call_gemini_api(prompt)

    if not gemini_raw_response:
        logging.warning("  Gemini consolidation returned empty or invalid response.")
        return None

    # Try to parse the consolidated response as JSON
    try:
        # Strip markdown ```json ... ```
        cleaned_response = gemini_raw_response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith('```'):
                 cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip() # Strip whitespace after removing markdown


        consolidated_data = json.loads(cleaned_response)
        return consolidated_data
    except json.JSONDecodeError as e:
        logging.error(f"  Gemini consolidation response was not valid JSON: {e}")
        logging.error(f"  Raw Gemini response: {gemini_raw_response}") # Log original raw response
        return None
    except Exception as e:
        logging.error(f"  An unexpected error occurred processing Gemini's consolidation response: {e}")
        logging.error(f"  Raw Gemini response: {gemini_raw_response}")
        return None