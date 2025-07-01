import logging
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select # Import Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager # Use Chrome for example
from selenium.webdriver.chrome.service import Service as ChromeService


def get_browser_driver():
    """Initializes and returns a Selenium WebDriver."""
    try:
        # Use webdriver-manager to handle driver download/setup
        service = ChromeService(ChromeDriverManager().install())

        # Configure Chrome options - ensure it's NOT headless for user review
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless') # REMOVE THIS LINE FOR VISIBLE BROWSER
        options.add_argument('--start-maximized') # Optional: Start browser maximized
        # options.add_argument('--incognito') # Optional: Use incognito mode

        driver = webdriver.Chrome(service=service, options=options)
        logging.info("Chrome browser initiated.")
        return driver

    except WebDriverException as e:
        logging.error(f"Failed to initialize WebDriver: {e}")
        logging.error("Please ensure Chrome browser is installed and the driver is compatible or install manually.")
        logging.error("webdriver_manager attempts to manage this, but manual intervention may be needed.")
        return None


def fill_online_form(form_name, data_to_fill, form_mappings, timeout=20):
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait, Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import NoSuchElementException, TimeoutException
    import logging

    driver = None

    if form_name not in form_mappings or 'url' not in form_mappings[form_name]:
        logging.error(f"Form '{form_name}' not found in mappings or missing 'url'. Cannot proceed with form filling.")
        return None

    form_url = form_mappings[form_name]['url']
    field_mappings = {k: v for k, v in form_mappings[form_name].items() if k != 'url'}

    try:
        driver = get_browser_driver()
        if driver is None:
            return None

        logging.info(f"Navigating to URL: {form_url}")
        driver.get(form_url)

        if field_mappings:
            first_locator = list(field_mappings.keys())[0]
            logging.info(f"Waiting for key element '{first_locator}' to be visible and clickable...")
            WebDriverWait(driver, timeout).until(EC.element_to_be_clickable((By.CSS_SELECTOR, first_locator)))
        else:
            WebDriverWait(driver, timeout).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

        logging.info("Page loaded or key element found.")
        logging.info("Starting to fill form fields...")

        for field_locator, data_key in field_mappings.items():
            if data_key in data_to_fill:
                value_to_fill = data_to_fill[data_key]
                logging.info(f"  Attempting to fill field '{field_locator}' with data key '{data_key}' = '{value_to_fill}'")

                if value_to_fill is None or value_to_fill == "":
                    logging.debug(f"  Skipping empty value for field '{field_locator}' (data key: '{data_key}').")
                    continue

                value_to_fill_str = str(value_to_fill)

                try:
                    element = WebDriverWait(driver, 5).until(
                        EC.visibility_of_element_located((By.CSS_SELECTOR, field_locator))
                    )
                    WebDriverWait(driver, 2).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, field_locator))
                    )

                    tag_name = element.tag_name.lower()
                    input_type = element.get_attribute('type')

                    if tag_name == 'input' and input_type in ('text', 'password', 'email', 'tel', 'number', 'date'):
                        logging.debug(f"  Attempting to fill input field '{field_locator}' of type '{input_type}'...")

                        if input_type == "date":
                            driver.execute_script("""
                                arguments[0].value = arguments[1];
                                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                            """, element, value_to_fill_str)
                            logging.info(f"  Set date field '{field_locator}' with '{value_to_fill_str}' using JS.")
                        else:
                            element.clear()
                            element.send_keys(value_to_fill_str)
                            logging.info(f"  Filled text field '{field_locator}' with '{value_to_fill_str}'.")

                    elif tag_name == 'textarea':
                        element.clear()
                        element.send_keys(value_to_fill_str)
                        logging.info(f"  Filled textarea '{field_locator}' with '{value_to_fill_str}'.")

                    elif tag_name == 'select':
                        select_element = Select(element)
                        try:
                            select_element.select_by_value(value_to_fill_str)
                            logging.info(f"  Selected dropdown '{field_locator}' by value '{value_to_fill_str}'.")
                        except NoSuchElementException:
                            select_element.select_by_visible_text(value_to_fill_str)
                            logging.info(f"  Selected dropdown '{field_locator}' by visible text '{value_to_fill_str}'.")

                    else:
                        logging.warning(f"  Field '{field_locator}' is a <{tag_name}> type='{input_type}'. Unsupported field type. Skipping.")

                except NoSuchElementException:
                    logging.warning(f"  Could not find element with locator: {field_locator}. Skipping.")
                except TimeoutException:
                    logging.warning(f"  Timeout waiting for element with locator: {field_locator}. Skipping.")
                except Exception as e:
                    logging.error(f"  An error occurred filling field '{field_locator}': {e}", exc_info=True)
            else:
                logging.warning(f"  Data key '{data_key}' not found in extracted data. Skipping field '{field_locator}'.")

        logging.info("Finished attempting to fill all mapped fields.")
        return driver

    except Exception as e:
        logging.error(f"An unexpected error occurred during form filling: {e}", exc_info=True)
        print("\n>>> An unexpected error occurred during form filling. Check logs above.")
        input(">>> Press Enter to close the browser...")
        if driver:
            driver.quit()
        return None
