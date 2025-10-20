import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Placeholder utility functions for pdf-lib operations
export const loadPdfDocument = (data: Uint8Array) => {
  console.log('Loading PDF document', data.length);
  return null;
};

export const savePdfDocument = (doc: any) => {
  console.log('Saving PDF document', doc);
  return new Uint8Array();
};

// Text item interface for extracted text
export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

// Extract text items with positions from a PDF page
export const extractTextItems = async (
  _pdfData: Uint8Array | ArrayBuffer,
  _pageIndex: number
): Promise<TextItem[]> => {
  // This function will be implemented in the component using PDF.js
  // as it provides better text extraction capabilities
  return [];
};

export const insertText = async (
  pdfData: Uint8Array | ArrayBuffer,
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
  pdfData: Uint8Array | ArrayBuffer,
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
  pdfData: Uint8Array | ArrayBuffer,
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
  pdfBuffers: (Uint8Array | ArrayBuffer)[]
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
  pdfData: Uint8Array | ArrayBuffer,
  pageIndex: number
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfData);
  pdfDoc.removePage(pageIndex);
  return pdfDoc.save();
};

// Edit text in PDF by overlaying new text at specified position
export const editTextInPdf = async (
  pdfData: Uint8Array | ArrayBuffer,
  pageIndex: number,
  x: number,
  y: number,
  newText: string,
  fontSize: number = 12,
  oldTextWidth: number = 0,
  oldTextHeight: number = 0,
  coverOldText: boolean = true
): Promise<Uint8Array> => {
  console.log('editTextInPdf called:', { pageIndex, x, y, newText, fontSize, oldTextWidth, oldTextHeight, coverOldText });
  
  const pdfDoc = await PDFDocument.load(pdfData);
  const page = pdfDoc.getPage(pageIndex);
  const pageHeight = page.getHeight();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Note: pdf-lib Y coordinate starts from BOTTOM of page
  // We receive Y as distance from bottom (already converted)
  console.log('Page height:', pageHeight, 'Y position:', y);
  
  // If covering old text, draw a white rectangle first
  if (coverOldText) {
    // Use the OLD text width/height to cover the original text
    const coverWidth = oldTextWidth > 0 ? oldTextWidth + 10 : font.widthOfTextAtSize(newText, fontSize) + 10;
    const coverHeight = oldTextHeight > 0 ? oldTextHeight + 6 : fontSize * 1.5;
    
    // Draw white rectangle to cover old text
    page.drawRectangle({
      x: x - 5,
      y: y - fontSize * 0.25, // Adjust for baseline
      width: coverWidth,
      height: coverHeight,
      color: rgb(1, 1, 1), // white
    });
    
    console.log('Drew white rectangle to cover old text:', { x: x - 5, y: y - fontSize * 0.25, width: coverWidth, height: coverHeight });
  }
  
  // Draw the new text
  page.drawText(newText, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
  
  console.log('Drew new text:', newText, 'at', x, y, 'with font size:', fontSize);
  
  return pdfDoc.save();
};

// Delete text by covering it with a white rectangle
export const deleteTextInPdf = async (
  pdfData: Uint8Array | ArrayBuffer,
  pageIndex: number,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Uint8Array> => {
  console.log('deleteTextInPdf called:', { pageIndex, x, y, width, height });
  
  const pdfDoc = await PDFDocument.load(pdfData);
  const page = pdfDoc.getPage(pageIndex);
  
  // Cover the text with a white rectangle
  page.drawRectangle({
    x: x - 2,
    y: y - height * 0.2, // Adjust for baseline
    width: width + 4,
    height: height * 1.2,
    color: rgb(1, 1, 1), // white
  });
  
  console.log('Drew white rectangle to delete text');
  
  return pdfDoc.save();
};