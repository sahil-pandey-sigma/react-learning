from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import UnexpectedAlertPresentException

import time

def wait_for_value(driver, element, expected_value, timeout=5):
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: element.get_attribute('value') == expected_value
        )
        return True
    except TimeoutException:
        print(f"[!] Value not reflected in DOM for '{expected_value}'")
        return False

def fill_input(driver, key, value):
    try:
        input_el = driver.find_element(By.NAME, key)
    except:
        try:
            input_el = driver.find_element(By.CSS_SELECTOR, f"[data-testid='{key}']")
        except:
            print(f"[!] Could not locate field: {key}")
            return False

    input_type = input_el.get_attribute("type") or ""
    tag = input_el.tag_name.lower()

    try:
        if tag == "select":
            driver.execute_script("""
                const select = arguments[0];
                const value = arguments[1];
                select.value = value;
                select.dispatchEvent(new Event('input', { bubbles: true }));
                select.dispatchEvent(new Event('change', { bubbles: true }));
            """, input_el, value)
            wait_for_value(driver, input_el, value)
            print(f"[✓] Selected '{value}' for <select> '{key}'")

        elif input_type == "date":
            formatted = value.strip()
            if "/" in formatted:
                parts = formatted.split("/")
                if len(parts[2]) == 4:
                    formatted = f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"

            driver.execute_script("""
                const input = arguments[0];
                const val = arguments[1];
                const lastValue = input.value;
                input.value = val;
                const tracker = input._valueTracker;
                if (tracker) {
                    tracker.setValue(lastValue);
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            """, input_el, formatted)
            wait_for_value(driver, input_el, formatted)
            print(f"[✓] Set date '{key}' with value: {formatted}")

        else:
            input_el.clear()
            input_el.send_keys(value)
            wait_for_value(driver, input_el, value)
            print(f"[✓] Filled '{key}' with '{value}'")

        return True

    except Exception as e:
        print(f"[!] Could not type into field '{key}': {e}")
        return False

def wait_for_step_heading(driver, step_number, timeout=10):
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, f"//h2[contains(text(), 'Step {step_number}')]"))
        )
        print(f"[✓] Step {step_number} loaded.")
    except TimeoutException:
        print(f"[!] Timeout waiting for Step {step_number}.")

def get_field_name(key):
    key_map = {
        "full_name": "fullName",
        "date_of_birth": "dob",
        "gender": "gender",
        "father_name": "fathersName",
        "address": "permanentAddress",
        "pan_number": "panNumber",
        "aadhaar_number": "aadhaarNumber",
        "account_number": "accountNumber",
        "ifsc_code": "ifscCode",
        "bank_name": "bankName",
        "email": "email",
        "phone_number": "phoneNumber"
    }
    return key_map.get(key, key)

def fill_step(driver, fields):
    for key, value in fields.items():
        if not value:
            continue  # Skip null or empty fields
        html_key = get_field_name(key)
        fill_input(driver, html_key, value)
    time.sleep(0.5)

def fill_online_form(form_name, sectioned_data, form_mappings):
    if 'url' not in form_mappings[form_name]:
        print(f"[!] No URL found for form: {form_name}")
        return None

    form_url = form_mappings[form_name]['url']

    options = webdriver.ChromeOptions()
    options.add_experimental_option("detach", True)  # Keeps browser open after script ends
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    driver.get(form_url)
    print(f"[✓] Opened form: {form_url}")

    try:
        for step_num in range(1, 5):
            step_key = f"step{step_num}"
            if step_key not in sectioned_data:
                print(f"[!] Skipping missing section: {step_key}")
                continue

            wait_for_step_heading(driver, step_num)
            print(f"[→] Filling {step_key}...")
            fill_step(driver, sectioned_data[step_key])

            if step_num < 4:
                next_step = step_num + 1
                print(f"[⇨] Waiting for user to click 'Save & Next' for Step {step_num}...")
                while True:
                    try:
                        WebDriverWait(driver, 2).until(
                            EC.presence_of_element_located((By.XPATH, f"//h2[contains(text(), 'Step {next_step}')]"))
                        )
                        print(f"[✓] Detected move to Step {next_step}.")
                        break
                    except UnexpectedAlertPresentException:
                        print("[!] Alert is present. Please resolve it manually in browser.")
                        time.sleep(1)  # short delay before retry
                    except TimeoutException:
                        print("[…] Still waiting for next step. Ensure you clicked 'Save & Next' in browser.")
                        time.sleep(1)
            else:
                print("[⇨] Final step filled.")
                print("[🧍] Script complete. You can now review and submit the form manually in the browser.")
                return  # Do not close browser, leave it open for manual interaction

        print("[✓] All steps filled.")
    except Exception as e:
        print(f"[!] Error during form filling: {e}")
        print("[!] Check for alerts or manual validation errors.")
        return driver  # Return driver even on error so browser remains open
