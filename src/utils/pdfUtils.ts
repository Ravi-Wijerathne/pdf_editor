import { PDFDocument, rgb } from 'pdf-lib';

// Placeholder utility functions for pdf-lib operations
export const loadPdfDocument = (data: Uint8Array) => {
  console.log('Loading PDF document', data.length);
  return null;
};

export const savePdfDocument = (doc: any) => {
  console.log('Saving PDF document', doc);
  return new Uint8Array();
};

export const insertText = async (
  pdfData: ArrayBuffer,
  pageIndex: number,
  text: string,
  x: number,
  y: number,
  fontSize: number = 12
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfData);
  const page = pdfDoc.getPage(pageIndex);
  page.drawText(text, { x, y, size: fontSize });
  return pdfDoc.save();
};

export const highlightArea = async (
  pdfData: ArrayBuffer,
  pageIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
  color = rgb(1, 1, 0)
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfData);
  const page = pdfDoc.getPage(pageIndex);
  page.drawRectangle({ x, y, width, height, color, opacity: 0.5 });
  return pdfDoc.save();
};

export const reorderPages = async (
  pdfData: ArrayBuffer,
  newOrder: number[]
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfData);
  const newPdf = await PDFDocument.create();

  for (const index of newOrder) {
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [index]);
    newPdf.addPage(copiedPage);
  }

  return newPdf.save();
};

export const mergePdfs = async (
  pdfBuffers: ArrayBuffer[]
): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const pdf = await PDFDocument.load(buffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  return mergedPdf.save();
};

export const removePage = async (
  pdfData: ArrayBuffer,
  pageIndex: number
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfData);
  pdfDoc.removePage(pageIndex);
  return pdfDoc.save();
};