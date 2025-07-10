import React, { useRef } from "react";

interface DocumentUploadButtonProps {
  onFilesSelected: (files: File[]) => void;
}

const DocumentUploadButton: React.FC<DocumentUploadButtonProps> = ({
  onFilesSelected,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleButtonClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
      >
        Upload Documents
      </button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        multiple
        accept="application/pdf,image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default DocumentUploadButton;
