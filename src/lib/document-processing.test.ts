import { describe, expect, it } from "vitest";
import { Document, Packer, Paragraph } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { articleChunks, chunkParts, extractDocument, MAX_UPLOAD_BYTES, validateUpload } from "./document-processing";

describe("secure document processing", () => {
  it("validates and extracts normalized text files", async () => {
    const data = Buffer.from("First line.\r\n\r\nSecond line.");
    expect(validateUpload("guide.txt", "text/plain", data.length, data)).toMatchObject({ sourceType: "TXT", extension: "txt" });
    expect(await extractDocument("TXT", data)).toEqual([{ content: "First line.\n\nSecond line.", section: "Text" }]);
  });
  it("extracts valid PDF pages and DOCX paragraphs with citation metadata", async () => {
    const pdf = await PDFDocument.create(); const page = pdf.addPage(); const font = await pdf.embedFont(StandardFonts.Helvetica); page.drawText("PDF support guidance", { x: 40, y: 700, font }); const pdfData = Buffer.from(await pdf.save());
    const pdfChunks = await extractDocument("PDF", pdfData); expect(pdfChunks[0]).toMatchObject({ pageNumber: 1, section: "Page 1", metadata: { page: 1 } }); expect(pdfChunks[0].content).toContain("support guidance");
    const docxData = Buffer.from(await Packer.toBuffer(new Document({ sections: [{ children: [new Paragraph("First DOCX section"), new Paragraph("Second DOCX section")] }] })));
    const docxChunks = await extractDocument("DOCX", docxData); expect(docxChunks.map(c => c.content).join(" ")).toContain("First DOCX section"); expect(docxChunks[0].section).toMatch(/Paragraph/);
  });
  it("rejects empty, oversized, mismatched, binary, and suspicious files", () => {
    expect(() => validateUpload("empty.txt", "text/plain", 0, Buffer.alloc(0))).toThrow(/empty/);
    expect(() => validateUpload("large.txt", "text/plain", MAX_UPLOAD_BYTES + 1, Buffer.from("x"))).toThrow(/5 MB/);
    expect(() => validateUpload("attack.exe", "application/octet-stream", 3, Buffer.from("abc"))).toThrow(/Supported/);
    expect(() => validateUpload("fake.pdf", "application/pdf", 3, Buffer.from("abc"))).toThrow(/signature/);
    expect(() => validateUpload("binary.txt", "text/plain", 3, Buffer.from([1, 0, 2]))).toThrow(/binary/);
  });
  it("handles corrupted and empty sources with useful errors", async () => {
    await expect(extractDocument("DOCX", Buffer.from("PKbroken"))).rejects.toThrow(/corrupted|readable/);
    await expect(extractDocument("PDF", Buffer.from("%PDF-broken"))).rejects.toThrow(/corrupted|encrypted|unsupported/);
    await expect(extractDocument("TXT", Buffer.from("   "))).rejects.toThrow(/no readable/);
  });
  it("keeps deterministic chunk order and metadata", () => {
    const chunks = chunkParts([{ content: "abcdefgh", pageNumber: 2, section: "Page 2", metadata: { page: 2 } }], 3);
    expect(chunks.map(c => c.content)).toEqual(["abc", "def", "gh"]);
    expect(chunks.every(c => c.pageNumber === 2 && c.metadata?.page === 2)).toBe(true);
    expect(articleChunks("Article text")[0].section).toBe("Article");
  });
});
