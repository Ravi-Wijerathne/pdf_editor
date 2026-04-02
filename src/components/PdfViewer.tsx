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

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  pdfData, 
  refreshKey, 
  onPageCountChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    <div className="viewer-root">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="viewer-toolbar">
        <div className="viewer-toolbar__group">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="btn btn-outline"
          >
            Previous
          </button>
          <span className="viewer-page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>

        <div className="viewer-toolbar__group">
          <button
            onClick={zoomOut}
            className="btn btn-outline"
          >
            Zoom Out
          </button>
          <button
            onClick={zoomIn}
            className="btn btn-outline"
          >
            Zoom In
          </button>
        </div>
      </div>

      <div 
        className="canvas-stage"
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        <div className="canvas-frame" style={{ position: 'relative', display: 'inline-block' }}>
          <canvas 
            ref={canvasRef} 
            className="pdf-canvas"
            style={{ 
              display: 'block',
              pointerEvents: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;