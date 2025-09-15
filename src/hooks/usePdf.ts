import { useState } from 'react';
import { insertText, highlightArea, reorderPages, mergePdfs, removePage } from '../utils/pdfUtils';

export const usePdf = () => {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  const loadPdf = (data: ArrayBuffer) => {
    setPdfData(data);
  };

  const applyInsertText = async (
    pageIndex: number,
    text: string,
    x: number,
    y: number,
    fontSize: number = 12
  ) => {
    if (!pdfData) return;
    try {
      const newData = await insertText(pdfData, pageIndex, text, x, y, fontSize);
      setPdfData(newData.buffer as ArrayBuffer);
    } catch (error) {
      console.error('Error inserting text:', error);
    }
  };

  const applyHighlightArea = async (
    pageIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!pdfData) return;
    try {
      const newData = await highlightArea(pdfData, pageIndex, x, y, width, height);
      setPdfData(newData.buffer as ArrayBuffer);
    } catch (error) {
      console.error('Error highlighting area:', error);
    }
  };

  const applyReorderPages = async (newOrder: number[]) => {
    if (!pdfData) return;
    try {
      const newData = await reorderPages(pdfData, newOrder);
      setPdfData(newData.buffer as ArrayBuffer);
    } catch (error) {
      console.error('Error reordering pages:', error);
    }
  };

  const applyMergePdfs = async (pdfBuffers: ArrayBuffer[]) => {
    try {
      const newData = await mergePdfs(pdfBuffers);
      setPdfData(newData.buffer as ArrayBuffer);
    } catch (error) {
      console.error('Error merging PDFs:', error);
    }
  };

  const applyRemovePage = async (pageIndex: number) => {
    if (!pdfData) return;
    try {
      const newData = await removePage(pdfData, pageIndex);
      setPdfData(newData.buffer as ArrayBuffer);
    } catch (error) {
      console.error('Error removing page:', error);
    }
  };

  return {
    pdfData,
    loadPdf,
    applyInsertText,
    applyHighlightArea,
    applyReorderPages,
    applyMergePdfs,
    applyRemovePage,
  };
};