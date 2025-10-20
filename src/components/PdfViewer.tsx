import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import TextEditModal from './TextEditModal';
import { TextItem } from '../utils/pdfUtils';

// Configure PDF.js worker using Vite's URL import
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface PdfViewerProps {
  pdfData: Uint8Array | null;
  refreshKey?: number;
  onPageCountChange: (count: number) => void;
  isEditMode?: boolean;
  onTextEdit?: (pageIndex: number, x: number, y: number, newText: string, fontSize: number, width: number, height: number) => void;
  onTextDelete?: (pageIndex: number, x: number, y: number, width: number, height: number) => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ 
  pdfData, 
  refreshKey, 
  onPageCountChange, 
  isEditMode = false,
  onTextEdit,
  onTextDelete
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [error, setError] = useState<string | null>(null);
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [selectedTextItem, setSelectedTextItem] = useState<TextItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedItem, setHighlightedItem] = useState<TextItem | null>(null);

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
      if (isEditMode) {
        extractTextFromPage(currentPage);
      } else {
        setTextItems([]);
        setHighlightedItem(null);
      }
    }
  }, [pdfDoc, currentPage, scale, isEditMode]);

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

      // If in edit mode and there's a highlighted item, draw the highlight
      if (isEditMode && highlightedItem) {
        drawTextHighlight(context, highlightedItem);
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      setError('Failed to render page.');
    }
  };

  const extractTextFromPage = async (pageNum: number) => {
    if (!pdfDoc) return;

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const textContent = await page.getTextContent();
      
      const items: TextItem[] = [];
      textContent.items.forEach((item: any) => {
        if ('str' in item && item.str.trim()) {
          // Transform coordinates to canvas space
          const transform = item.transform;
          const x = transform[4];
          const y = viewport.height - transform[5]; // Flip Y coordinate
          const fontSize = Math.abs(transform[0]); // Approximate font size
          const width = item.width;

          items.push({
            text: item.str,
            x,
            y: y - fontSize, // Adjust for baseline
            width,
            height: fontSize * 1.2,
            fontSize,
          });
        }
      });

      setTextItems(items);
    } catch (error) {
      console.error('Error extracting text:', error);
    }
  };

  const drawTextHighlight = (
    context: CanvasRenderingContext2D,
    item: TextItem
  ) => {
    context.fillStyle = 'rgba(255, 255, 0, 0.3)'; // Yellow highlight
    context.fillRect(item.x - 2, item.y - 2, item.width + 4, item.height + 4);
    
    // Draw border
    context.strokeStyle = 'rgba(255, 200, 0, 0.8)';
    context.lineWidth = 2;
    context.strokeRect(item.x - 2, item.y - 2, item.width + 4, item.height + 4);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find the text item at the clicked position
    const clickedItem = textItems.find(item => 
      x >= item.x - 5 && 
      x <= item.x + item.width + 5 &&
      y >= item.y - 5 && 
      y <= item.y + item.height + 5
    );

    if (clickedItem) {
      setSelectedTextItem(clickedItem);
      setIsModalOpen(true);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditMode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find the text item at the mouse position
    const hoveredItem = textItems.find(item => 
      x >= item.x - 5 && 
      x <= item.x + item.width + 5 &&
      y >= item.y - 5 && 
      y <= item.y + item.height + 5
    );

    if (hoveredItem !== highlightedItem) {
      setHighlightedItem(hoveredItem || null);
      renderPage(currentPage); // Re-render to show/hide highlight
    }

    // Change cursor style
    canvas.style.cursor = hoveredItem ? 'pointer' : 'default';
  };

  const handleTextSave = (newText: string) => {
    if (!selectedTextItem || !onTextEdit) return;

    // Convert canvas coordinates back to PDF coordinates
    const pdfY = canvasRef.current ? 
      (canvasRef.current.height - selectedTextItem.y) : 
      selectedTextItem.y;

    onTextEdit(
      currentPage - 1, // Convert to 0-based index
      selectedTextItem.x,
      pdfY,
      newText,
      selectedTextItem.fontSize,
      selectedTextItem.width,
      selectedTextItem.height
    );

    setSelectedTextItem(null);
  };

  const handleTextDelete = () => {
    if (!selectedTextItem || !onTextDelete) return;

    // Convert canvas coordinates back to PDF coordinates
    const pdfY = canvasRef.current ? 
      (canvasRef.current.height - selectedTextItem.y) : 
      selectedTextItem.y;

    onTextDelete(
      currentPage - 1, // Convert to 0-based index
      selectedTextItem.x,
      pdfY,
      selectedTextItem.width,
      selectedTextItem.height
    );

    setSelectedTextItem(null);
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
      {isEditMode && (
        <div className="edit-mode-indicator mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <strong>Text Edit Mode Active:</strong> Click on any text to edit or delete it.
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
      <div 
        className="canvas-container bg-gray-50 p-4 rounded shadow overflow-auto"
        ref={containerRef}
      >
        <canvas 
          ref={canvasRef} 
          className="border border-gray-300"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
      </div>

      <TextEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTextItem(null);
        }}
        onSave={handleTextSave}
        onDelete={handleTextDelete}
        initialText={selectedTextItem?.text || ''}
        position={{ x: selectedTextItem?.x || 0, y: selectedTextItem?.y || 0 }}
      />
    </div>
  );
};

export default PdfViewer;