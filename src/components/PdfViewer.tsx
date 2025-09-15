import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js';

interface PdfViewerProps {
  pdfData: ArrayBuffer | null;
  onPageCountChange: (count: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfData, onPageCountChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pdfData) {
      loadPdf(pdfData);
    } else {
      setPdfDoc(null);
      setTotalPages(0);
      setCurrentPage(1);
      onPageCountChange(0);
    }
  }, [pdfData, onPageCountChange]);

  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale]);

  const loadPdf = async (data: ArrayBuffer) => {
    try {
      setError(null);
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      onPageCountChange(pdf.numPages);
    } catch (error) {
      console.error('Error loading PDF:', error);
      setError('Failed to load PDF. Please check if the file is valid.');
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