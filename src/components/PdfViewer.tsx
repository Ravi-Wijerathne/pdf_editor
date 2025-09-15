import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerProps {
  pdfData: Uint8Array | null;
  refreshKey?: number;
  onPageCountChange: (count: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfData, refreshKey, onPageCountChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PdfViewer useEffect triggered - pdfData:', !!pdfData, 'refreshKey:', refreshKey);
    if (pdfData) {
      console.log('About to call loadPdf with data size:', pdfData.byteLength);
      loadPdf(pdfData);
    } else {
      console.log('No pdfData, clearing viewer');
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
      onPageCountChange(0);
    }
  }, [pdfData, refreshKey, onPageCountChange]);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  const loadPdf = async (data: Uint8Array | ArrayBuffer) => {
    try {
      setError(null);
      console.log('Loading PDF with data size:', data.byteLength);
      console.log('Data type:', data.constructor.name);
      
      // Create a fresh copy of the data to avoid detached ArrayBuffer issues
      let pdfData: Uint8Array;
      if (data instanceof ArrayBuffer) {
        // Create a completely new Uint8Array with copied data
        pdfData = new Uint8Array(data.byteLength);
        pdfData.set(new Uint8Array(data));
      } else {
        // Create a copy of the Uint8Array to ensure it's not detached
        pdfData = new Uint8Array(data.byteLength);
        pdfData.set(data);
      }
      
      console.log('Created fresh PDF data copy, size:', pdfData.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      onPageCountChange(pdf.numPages);
      console.log('PDF loaded successfully, pages:', pdf.numPages);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError(`Failed to load PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
      onPageCountChange(0);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
      setError('Failed to render page.');
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale(scale * 1.2);
  };

  const zoomOut = () => {
    setScale(Math.max(scale * 0.8, 0.5));
  };

  return (
    <div className="pdf-viewer p-4">
      {error && (
        <div className="error-message mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="controls mb-4 flex items-center space-x-4 bg-white p-2 rounded shadow">
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={zoomOut}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Zoom Out
        </button>
        <button
          onClick={zoomIn}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Zoom In
        </button>
      </div>
      <div className="canvas-container bg-gray-50 p-4 rounded shadow overflow-auto">
        <canvas ref={canvasRef} className="border border-gray-300" />
      </div>
    </div>
  );
};

export default PdfViewer;