import mammoth from "mammoth";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export type SourceType = "PDF" | "DOCX" | "TXT";
export type ExtractedPart = { content: string; pageNumber?: number; section?: string; metadata?: Record<string, string | number> };

const formats = {
  pdf: { mime: ["application/pdf"], type: "PDF" as const },
  docx: { mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], type: "DOCX" as const },
  txt: { mime: ["text/plain", "application/octet-stream"], type: "TXT" as const },
};

export function validateUpload(name: string, mime: string, size: number, data: Buffer) {
  if (size <= 0 || data.length <= 0) throw new Error("The selected file is empty");
  if (size > MAX_UPLOAD_BYTES || data.length > MAX_UPLOAD_BYTES) throw new Error("Files must be 5 MB or smaller");
  const ext = name.toLowerCase().split(".").pop() as keyof typeof formats;
  const format = formats[ext];
  if (!format || !format.mime.includes(mime.toLowerCase())) throw new Error("Supported formats are PDF, DOCX, and TXT");
  if (ext === "pdf" && !data.subarray(0, 5).equals(Buffer.from("%PDF-"))) throw new Error("The PDF signature is invalid");
  if (ext === "docx" && !(data[0] === 0x50 && data[1] === 0x4b)) throw new Error("The DOCX container is invalid");
  if (ext === "txt" && data.includes(0)) throw new Error("The text file contains unsafe binary content");
  return { extension: ext, sourceType: format.type, mimeType: mime.toLowerCase() };
}

const normalize = (value: string) => value.replace(/\r\n?/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

export function chunkParts(parts: ExtractedPart[], limit = 1200) {
  const chunks: ExtractedPart[] = [];
  for (const part of parts) {
    const text = normalize(part.content);
    for (let start = 0; start < text.length; start += limit) {
      const content = text.slice(start, start + limit).trim();
      if (content) chunks.push({ ...part, content });
    }
  }
  return chunks;
}

export async function extractDocument(type: SourceType, data: Buffer): Promise<ExtractedPart[]> {
  if (type === "TXT") {
    const text = normalize(new TextDecoder("utf-8", { fatal: true }).decode(data));
    if (!text) throw new Error("The text file contains no readable content");
    return chunkParts([{ content: text, section: "Text" }]);
  }
  if (type === "DOCX") {
    let result;
    try { result = await mammoth.extractRawText({ buffer: data }); } catch { throw new Error("The DOCX file is corrupted or unsupported"); }
    const paragraphs = normalize(result.value).split(/\n\s*\n/).filter(Boolean).map((content, index) => ({ content, section: `Paragraph ${index + 1}` }));
    const chunks = chunkParts(paragraphs);
    if (!chunks.length) throw new Error("The DOCX file contains no readable text");
    return chunks;
  }
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(data), useWorkerFetch: false }).promise;
    const pages: ExtractedPart[] = [];
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number); const content = await page.getTextContent();
      const text = content.items.map(item => "str" in item ? item.str : "").join(" ");
      if (normalize(text)) pages.push({ content: text, pageNumber: number, section: `Page ${number}`, metadata: { page: number } });
    }
    const chunks = chunkParts(pages);
    if (!chunks.length) throw new Error("The PDF contains no extractable text");
    return chunks;
  } catch (error) {
    if (error instanceof Error && error.message.includes("no extractable")) throw error;
    throw new Error("The PDF is corrupted, encrypted, or unsupported");
  }
}

export function articleChunks(text: string) {
  const chunks = chunkParts([{ content: text, section: "Article" }]);
  if (!chunks.length) throw new Error("Article content cannot be empty");
  return chunks;
}
