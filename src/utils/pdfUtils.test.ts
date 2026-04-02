import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  insertText,
  mergePdfs,
  removePage,
  reorderPages,
} from "./pdfUtils";

const createPdfWithPageWidths = async (widths: number[]) => {
  const doc = await PDFDocument.create();
  widths.forEach((w) => doc.addPage([w, 400]));
  return doc.save();
};

describe("pdfUtils", () => {
  it("reorders pages by provided order", async () => {
    const source = await createPdfWithPageWidths([210, 310, 410]);

    const reordered = await reorderPages(source, [2, 0, 1]);
    const result = await PDFDocument.load(reordered);

    expect(result.getPageCount()).toBe(3);
    expect(result.getPage(0).getWidth()).toBe(410);
    expect(result.getPage(1).getWidth()).toBe(210);
    expect(result.getPage(2).getWidth()).toBe(310);
  });

  it("merges multiple PDFs preserving total page count", async () => {
    const first = await createPdfWithPageWidths([200, 220]);
    const second = await createPdfWithPageWidths([300]);

    const merged = await mergePdfs([first, second]);
    const result = await PDFDocument.load(merged);

    expect(result.getPageCount()).toBe(3);
    expect(result.getPage(0).getWidth()).toBe(200);
    expect(result.getPage(2).getWidth()).toBe(300);
  });

  it("removes a page by index", async () => {
    const source = await createPdfWithPageWidths([200, 300, 400]);

    const updated = await removePage(source, 1);
    const result = await PDFDocument.load(updated);

    expect(result.getPageCount()).toBe(2);
    expect(result.getPage(0).getWidth()).toBe(200);
    expect(result.getPage(1).getWidth()).toBe(400);
  });

  it("inserts text and returns a valid PDF", async () => {
    const source = await createPdfWithPageWidths([240]);

    const updated = await insertText(source, 0, "Hello", 30, 40, 14);
    const result = await PDFDocument.load(updated);

    expect(result.getPageCount()).toBe(1);
  });
});
