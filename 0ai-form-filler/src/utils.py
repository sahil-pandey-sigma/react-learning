import yaml
import os
import logging

def load_config(filepath):
    """Loads configuration from a YAML file."""
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Configuration file not found: {filepath}")
    try:
        with open(filepath, 'r') as f:
            config = yaml.safe_load(f)
            return config
    except yaml.YAMLError as e:
        logging.error(f"Error parsing YAML file {filepath}: {e}")
        raise # Re-raise the exception after logging

def cleanup_temp_dir(temp_dir):
    """Removes all files from a temporary directory."""
    if os.path.exists(temp_dir):
        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    # Optional: remove subdirectories if needed, but usually temp dir is flat
                    # shutil.rmtree(file_path)
                    pass # For this prototype, assuming flat temp dir
            except Exception as e:
                logging.warning(f"Failed to delete {file_path}. Reason: {e}")
        logging.info(f"Cleaned up temporary directory: {temp_dir}")