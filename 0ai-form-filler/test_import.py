# test_import.py
import sys
try:
    from pdf2image import convert_from_path
    print("Successfully imported pdf2image")
except ImportError as e:
    print(f"ImportError: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Unexpected error during import: {e}")
    sys.exit(1)