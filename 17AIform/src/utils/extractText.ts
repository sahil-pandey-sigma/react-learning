import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";

// Set the workerSrc to the correct file in public/
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return await extractTextFromPdf(file);
  } else if (file.type.startsWith("image/")) {
    return await extractTextFromImage(file);
  } else {
    throw new Error("Unsupported file type");
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map((item: any) => item.str).join(" ");
    fullText += textItems + "\n";

    // If little/no text, fallback to OCR:
    if (textItems.replace(/\s/g, "").length < 10) {
      // Render page to canvas for OCR
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      const ocrText = await Tesseract.recognize(canvas, "eng");
      fullText += ocrText.data.text + "\n";
    }
  }
  return fullText;
}

async function extractTextFromImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const {
        data: { text },
      } = await Tesseract.recognize(reader.result as string, "eng");
      resolve(text);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
