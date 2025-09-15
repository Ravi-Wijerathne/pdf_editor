import { useState } from 'react';
import { insertText, highlightArea, reorderPages, mergePdfs, removePage } from '../utils/pdfUtils';

export const usePdf = () => {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-renders

  const loadPdf = (data: ArrayBuffer) => {
    // Convert ArrayBuffer to Uint8Array consistently
    const uint8Data = new Uint8Array(data);
    setPdfData(uint8Data);
    setRefreshKey(prev => prev + 1);
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
      // newData is already a Uint8Array from pdf-lib
      setPdfData(newData);
      setRefreshKey(prev => prev + 1);
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
      // newData is already a Uint8Array from pdf-lib
      setPdfData(newData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error highlighting area:', error);
    }
  };

  const applyReorderPages = async (newOrder: number[]) => {
    if (!pdfData) return;
    try {
      console.log('Applying reorder pages:', newOrder);
      const newData = await reorderPages(pdfData, newOrder);
      console.log('Reorder completed, new data size:', newData.byteLength);
      
      // newData is already a Uint8Array from pdf-lib
      setPdfData(newData);
      setRefreshKey(prev => prev + 1);
      console.log('PDF data updated after reorder - refresh key will be:', refreshKey + 1);
      
    } catch (error) {
      console.error('Error reordering pages:', error);
    }
  };

  const applyMergePdfs = async (pdfBuffers: (Uint8Array | ArrayBuffer)[]) => {
    try {
      const newData = await mergePdfs(pdfBuffers);
      // newData is already a Uint8Array from pdf-lib
      setPdfData(newData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error merging PDFs:', error);
    }
  };

  const applyRemovePage = async (pageIndex: number) => {
    if (!pdfData) return;
    try {
      const newData = await removePage(pdfData, pageIndex);
      // newData is already a Uint8Array from pdf-lib
      setPdfData(newData);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error removing page:', error);
    }
  };

  return {
    pdfData,
    refreshKey,
    loadPdf,
    applyInsertText,
    applyHighlightArea,
    applyReorderPages,
    applyMergePdfs,
    applyRemovePage,
  };
};