import React from "react";
import DocumentUploader from "./DocumentUploader";
import BankingForm from "./BankingForm";
import { extractTextFromFile } from "../utils/extractText";

export default function BankingFormPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [extractedTexts, setExtractedTexts] = React.useState<{
    [filename: string]: string;
  }>({});
  const [extracting, setExtracting] = React.useState(false);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setExtracting(true);
    const texts: { [filename: string]: string } = {};

    for (const file of selectedFiles) {
      try {
        texts[file.name] = await extractTextFromFile(file);
      } catch (err) {
        texts[file.name] = "Error extracting text: " + (err as Error).message;
      }
    }

    setExtractedTexts(texts);
    setExtracting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 px-2 py-8">
      <div className="w-full max-w-3xl">
        <DocumentUploader onFilesSelected={handleFilesSelected} />

        {extracting && (
          <div className="flex items-center text-blue-600 mb-4 space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <span>Extracting text from files, please wait...</span>
          </div>
        )}

        {Object.keys(extractedTexts).length > 0 && (
          <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2 text-blue-800">
              Extracted Text Preview:
            </h3>
            {Object.entries(extractedTexts).map(([filename, text]) => (
              <div key={filename} className="mb-4">
                <div className="font-medium text-gray-700">{filename}</div>
                <pre className="bg-white p-2 rounded border text-xs max-h-64 overflow-auto whitespace-pre-wrap">
                  {text}
                </pre>
              </div>
            ))}
          </div>
        )}

        <BankingForm />
      </div>
    </div>
  );
}
