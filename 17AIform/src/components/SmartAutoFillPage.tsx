import React, { useRef, useState } from "react";
import DocumentUploadButton from "./DocumentUploader";
import BankingForm from "./BankingForm";
import { extractTextFromFile } from "../utils/extractText";
import geminiAutofillPrompt from "../utils/gemeniPrompt";

// Paste your Gemini API key here (for prototype ONLY)
const GEMINI_API_KEY = "AIzaSyAeUpUXADmtM9mCW61plPHEUS0tvLpVm8c";

async function callGeminiForMapping(
  extractedText: string
): Promise<Record<string, string>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = geminiAutofillPrompt + extractedText;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
    const clean = jsonMatch ? jsonMatch[1] : text;
    return JSON.parse(clean);
  } catch {
    return {};
  }
}

export default function SmartAutoFillPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<any>(null);

  const handleFilesSelected = async (files: File[]) => {
    setLoading(true);
    setError(null);
    const texts: { [filename: string]: string } = {};
    for (const file of files) {
      try {
        texts[file.name] = await extractTextFromFile(file);
      } catch (err) {
        texts[file.name] = "Error extracting text: " + (err as Error).message;
      }
    }

    try {
      const allText = Object.values(texts).join("\n");
      let aiFields = await callGeminiForMapping(allText);

      // Optional alias mapping
      const aliasMap = {
        "Mobile Number": "phone",
        "Registered Address": "address",
        Branch: "branchName",
        // Add more if needed
      };
      Object.entries(aiFields).forEach(([key, value]) => {
        if (aliasMap[key]) {
          aiFields[aliasMap[key]] = value;
        }
      });

      console.log("AI fields returned by Gemini:", aiFields);

      if (formRef.current && typeof formRef.current.fillFromAi === "function") {
        formRef.current.fillFromAi(aiFields);
      }
    } catch (e) {
      setError("AI mapping failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 px-2 py-8">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Smart Banking/KYC Autofill
          </h2>
          <DocumentUploadButton onFilesSelected={handleFilesSelected} />
        </div>
        {loading && (
          <div className="mb-4 text-blue-600">Processing, please wait...</div>
        )}
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <BankingForm ref={formRef} />
      </div>
    </div>
  );
}
