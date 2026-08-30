import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";

export const contentProcessor = {
  async extractText(fileBuffer: Buffer, fileType: string): Promise<string> {
    console.log(`Extracting text from ${fileType}...`);

    try {
      switch (fileType) {
        case "pdf":
          return await this.extractFromPDF(fileBuffer);
        case "docx":
          return await this.extractFromDOCX(fileBuffer);
        case "txt":
        case "json":
          return fileBuffer.toString("utf-8");
        case "image":
        case "png":
        case "jpg":
        case "jpeg":
        case "webp":
          return await this.extractFromImage(fileBuffer);
        default:
          return `Text extraction not supported for file type: ${fileType}. Please use PDF, DOCX, TXT, JSON, or Image formats.`;
      }
    } catch (error) {
      console.error(`Error extracting text from ${fileType}:`, error);
      return "Text extraction failed. The file may be corrupted or in an unsupported format.";
    }
  },

  async extractFromPDF(buffer: Buffer): Promise<string> {
    try {
      const parse = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || pdfParse;
      const data = await parse(buffer);
      return data.text || "No text content found in PDF.";
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw error;
    }
  },

  async extractFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "No text content found in DOCX.";
    } catch (error) {
      console.error("DOCX extraction error:", error);
      throw error;
    }
  },

  async extractFromImage(buffer: Buffer): Promise<string> {
    try {
      console.log("Running OCR on image...");
      const result = await Tesseract.recognize(buffer, "eng");
      return result.data.text || "No text could be extracted from this image.";
    } catch (error) {
      console.error("Image OCR error:", error);
      throw error;
    }
  },

  chunkText(text: string, maxTokens: number = 3000): string[] {
    // Rough estimation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    const chunks: string[] = [];

    if (text.length <= maxChars) {
      return [text];
    }

    // Split by paragraphs first, then by sentences
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = "";

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChars) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        // If single paragraph is too long, split by sentences
        if (paragraph.length > maxChars) {
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChars) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = sentence + " ";
            } else {
              currentChunk += sentence + " ";
            }
          }
        } else {
          currentChunk = paragraph + "\n\n";
        }
      } else {
        currentChunk += paragraph + "\n\n";
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  },
};
