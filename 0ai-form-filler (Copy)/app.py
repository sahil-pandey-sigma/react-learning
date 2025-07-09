import streamlit as st
import os
import tempfile
import subprocess

st.set_page_config(page_title="AI Form Filler", layout="centered")
st.title("📄 Upload Documents for AI Form Filling")

st.markdown("Upload PDF documents to auto-fill forms using your backend script.")

# --- File uploader ---
uploaded_files = st.file_uploader(
    "Upload PDF files", type=["pdf"], accept_multiple_files=True
)

form_name = st.text_input("Form name", value="local_test_form")

if st.button("Run Form Filler"):
    if not uploaded_files:
        st.warning("Please upload at least one PDF file.")
    elif not form_name:
        st.warning("Please enter the form name.")
    else:
        # Save uploaded files to a temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            file_paths = []
            for uploaded_file in uploaded_files:
                file_path = os.path.join(temp_dir, uploaded_file.name)
                with open(file_path, "wb") as f:
                    f.write(uploaded_file.read())
                file_paths.append(file_path)

            # Construct CLI command
            cmd = ["python", "run.py", "--documents"] + file_paths + ["--form", form_name]

            st.info("Running form filling script...")
            try:
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    st.success("✅ Script executed successfully!")
                    st.text(result.stdout)
                else:
                    st.error("❌ Script execution failed.")
                    st.text(result.stderr)
            except Exception as e:
                st.error(f"❌ Error running script: {str(e)}")
