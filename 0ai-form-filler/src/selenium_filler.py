import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, WebDriverException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService


def get_browser_driver():
    """Initializes and returns a Selenium WebDriver."""
    try:
        service = ChromeService(ChromeDriverManager().install())

        options = webdriver.ChromeOptions()
        options.add_argument('--start-maximized')

        driver = webdriver.Chrome(service=service, options=options)
        logging.info("Chrome browser initiated.")
        return driver

    except WebDriverException as e:
        logging.error(f"Failed to initialize WebDriver: {e}")
        return None


def fill_online_form(form_name, sectioned_data, form_mappings, timeout=20):
    driver = None

    if form_name not in form_mappings or 'url' not in form_mappings[form_name]:
        logging.error(f"Form '{form_name}' not found in mappings or missing 'url'.")
        return None

    form_url = form_mappings[form_name]['url']
    full_mapping = {k: v for k, v in form_mappings[form_name].items() if k != 'url'}

    try:
        driver = get_browser_driver()
        if driver is None:
            return None

        logging.info(f"Navigating to URL: {form_url}")
        driver.get(form_url)

        for step_num in range(1, 5):
            step_key = f"step{step_num}"
            if step_key not in sectioned_data:
                logging.info(f"[!] Skipping missing section: {step_key}")
                continue

            current_heading = f"Step {step_num}"
            WebDriverWait(driver, timeout).until(
                EC.presence_of_element_located((By.XPATH, f"//h2[contains(text(), '{current_heading}')]"))
            )
            logging.info(f"[✓] {current_heading} loaded.")

            logging.info(f"[→] Filling {step_key}...")
            fill_step(driver, sectioned_data[step_key], full_mapping)

            if step_num < 4:
                next_heading = f"Step {step_num + 1}"
                print(f"[⇨] Please review Step {step_num} and click 'Save & Next' in the browser.")
                logging.info(f"[⇨] Waiting for user to click 'Save & Next' and load {next_heading}...")
                try:
                    WebDriverWait(driver, 120).until(
                        EC.presence_of_element_located((By.XPATH, f"//h2[contains(text(), '{next_heading}')]"))
                    )
                    logging.info(f"[✓] Detected move to {next_heading}")
                except TimeoutException:
                    logging.warning(f"[!] Timeout waiting for {next_heading}. Proceeding anyway.")

        logging.info("[✓] All steps filled.")
        return driver

    except Exception as e:
        logging.error(f"An unexpected error occurred during form filling: {e}", exc_info=True)
        if driver:
            driver.quit()
        return None


def fill_step(driver, step_data, full_mapping):
    for field_locator, data_key in full_mapping.items():
        if data_key not in step_data:
            continue
        value = step_data[data_key]
        if not value:
            continue

        try:
            element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, field_locator))
            )
            WebDriverWait(driver, 2).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, field_locator))
            )

            tag = element.tag_name.lower()
            input_type = element.get_attribute('type')

            if tag == 'input' and input_type in ('text', 'password', 'email', 'tel', 'number', 'date'):
                if input_type == 'date':
                    driver.execute_script("""
                        arguments[0].value = arguments[1];
                        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                    """, element, str(value))
                else:
                    element.clear()
                    element.send_keys(str(value))
            elif tag == 'textarea':
                element.clear()
                element.send_keys(str(value))
            elif tag == 'select':
                select = Select(element)
                try:
                    select.select_by_value(str(value))
                except NoSuchElementException:
                    select.select_by_visible_text(str(value))
            else:
                logging.warning(f"Unsupported field type: <{tag}> {field_locator}")

        except Exception as e:
            logging.warning(f"Error filling field {field_locator}: {e}")
