import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Edit3
} from 'lucide-react';
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

  // Debug logging for modal state
  useEffect(() => {
    console.log('Modal state changed - isModalOpen:', isModalOpen, 'selectedTextItem:', selectedTextItem);
  }, [isModalOpen, selectedTextItem]);

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

  useEffect(() => {
    if (pdfDoc && isEditMode) {
      extractTextFromPage(currentPage);
    } else {
      setTextItems([]);
      setHighlightedItem(null);
    }
  }, [pdfDoc, currentPage, scale, isEditMode]);

  // Re-render canvas when textItems change to draw boxes
  useEffect(() => {
    if (pdfDoc && canvasRef.current && isEditMode && textItems.length > 0) {
      renderPage(currentPage);
    }
  }, [textItems]);

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

      // If in edit mode, draw all text boundaries for debugging
      if (isEditMode && textItems.length > 0) {
        textItems.forEach(item => {
          // Draw semi-transparent box around each text item
          context.strokeStyle = 'rgba(0, 150, 255, 0.5)';
          context.lineWidth = 1;
          context.strokeRect(item.x, item.y, item.width, item.height);
        });
      }

      // If there's a highlighted item, draw a brighter highlight
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
      
      console.log('Extracting text from page', pageNum, 'with scale', scale, 'found items:', textContent.items.length);
      
      const items: TextItem[] = [];
      textContent.items.forEach((item: any, index: number) => {
        if ('str' in item) {
          // Transform coordinates to canvas space
          const transform = item.transform;
          
          // PDF.js transform gives us coordinates at scale 1.0
          // We need to apply the viewport scale to match the rendered canvas
          const x = transform[4] * scale; // Scale X position
          const fontSize = Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]) * scale; // Scale font size
          
          // Y coordinate: PDF.js gives us the baseline position at scale 1.0
          // We need to flip it and scale it because canvas Y increases downward, PDF Y increases upward
          const baselineY = viewport.height - (transform[5] * scale);
          
          // The text box should start above the baseline
          const y = baselineY - fontSize; // Top of the text box
          const width = item.width * scale; // Scale the width
          const height = fontSize * 1.2; // Height of the text box

          console.log(`[${index}] "${item.str.substring(0, 20)}" | x:${x.toFixed(1)} y:${y.toFixed(1)} | w:${width.toFixed(1)} h:${height.toFixed(1)}`);

          items.push({
            text: item.str,
            x,
            y,
            width: Math.max(width, 5), // Ensure minimum width
            height: Math.max(height, 8), // Ensure minimum height
            fontSize,
          });
        }
      });

      console.log('Total text items extracted:', items.length);
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

  const handleTextSave = (newText: string) => {
    if (!selectedTextItem || !onTextEdit) return;

    // Convert scaled canvas coordinates back to unscaled PDF coordinates
    // Remember: we scaled everything by 'scale' factor in extractTextFromPage
    const pdfX = selectedTextItem.x / scale; // Unscale X
    const pdfFontSize = selectedTextItem.fontSize / scale; // Unscale font size
    
    // Convert Y coordinate back to PDF space
    // selectedTextItem.y is the TOP of the text box in canvas space
    // We need to convert this to the BASELINE position in PDF space
    
    // In extractTextFromPage we did: y = baselineY - fontSize
    // So: baselineY = y + fontSize
    // In canvas space (scaled): baselineY_canvas = selectedTextItem.y + selectedTextItem.fontSize
    const baselineY_canvas = selectedTextItem.y + selectedTextItem.fontSize;
    
    // Canvas Y is from top (0) to bottom (height)
    // PDF Y is from bottom (0) to top (height)
    const canvasHeight = canvasRef.current ? canvasRef.current.height : 0;
    const pdfY = (canvasHeight - baselineY_canvas) / scale; // Flip and unscale to get baseline in PDF space

    console.log('Saving text:', newText);
    console.log('Selected item:', selectedTextItem);
    console.log('Canvas height:', canvasHeight);
    console.log('Canvas baseline Y:', baselineY_canvas);
    console.log('PDF baseline Y:', pdfY);
    console.log('PDF coords (unscaled):', pdfX, pdfY, 'fontSize:', pdfFontSize);

    onTextEdit(
      currentPage - 1, // Convert to 0-based index
      pdfX,
      pdfY,
      newText,
      pdfFontSize,
      selectedTextItem.width / scale,
      selectedTextItem.height / scale
    );

    setSelectedTextItem(null);
  };

  const handleTextDelete = () => {
    if (!selectedTextItem || !onTextDelete) return;

    // Convert scaled canvas coordinates back to unscaled PDF coordinates
    const pdfX = selectedTextItem.x / scale; // Unscale X
    
    // Convert Y coordinate back to PDF space
    // selectedTextItem.y is the TOP of the text box
    // For deletion, we use the baseline position
    const baselineY_canvas = selectedTextItem.y + selectedTextItem.fontSize;
    
    // Convert Y coordinate back to PDF space
    const canvasHeight = canvasRef.current ? canvasRef.current.height : 0;
    const pdfY = (canvasHeight - baselineY_canvas) / scale; // Flip and unscale Y

    console.log('Deleting text at PDF baseline coords:', pdfX, pdfY);

    onTextDelete(
      currentPage - 1, // Convert to 0-based index
      pdfX,
      pdfY,
      selectedTextItem.width / scale,
      selectedTextItem.height / scale
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
    <div className="pdf-viewer p-4 flex flex-col h-[calc(100vh-120px)]">
      {error && (
        <div className="error-message mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
          {error}
        </div>
      )}
      
      <div className="controls mb-4 flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= totalPages) {
                  setCurrentPage(val);
                }
              }}
              className="w-12 text-center text-sm font-medium bg-transparent border-none outline-none text-slate-700"
            />
            <span className="text-slate-400 text-sm">/</span>
            <span className="text-slate-600 text-sm font-medium">{totalPages}</span>
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={zoomOut}
            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="px-2 text-sm font-medium text-slate-600 min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={zoomIn}
            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />
          
          <button
            onClick={() => setScale(1.5)}
            className="flex items-center justify-center w-8 h-8 text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200"
            title="Fit to View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        className="canvas-container flex-1 bg-slate-100/50 p-4 rounded-xl shadow-inner border border-slate-200 overflow-auto"
        ref={containerRef}
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'relative', display: 'inline-block', minWidth: '100%', textAlign: 'center' }}>
          <canvas 
            ref={canvasRef} 
            className="shadow-xl rounded-lg mx-auto"
            style={{ 
              display: 'block',
              pointerEvents: isEditMode ? 'none' : 'auto',
            }}
          />
          {isEditMode && canvasRef.current && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${canvasRef.current.width}px`,
                height: `${canvasRef.current.height}px`,
                pointerEvents: 'auto',
                zIndex: 10,
              }}
            >
              {textItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    border: highlightedItem === item ? '2px solid rgba(245, 158, 11, 0.9)' : '2px solid rgba(59, 130, 246, 0.6)',
                    backgroundColor: highlightedItem === item ? 'rgba(251, 191, 36, 0.25)' : 'rgba(59, 130, 246, 0.1)',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                    pointerEvents: 'auto',
                    zIndex: 20,
                    borderRadius: '2px',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedTextItem(item);
                    setIsModalOpen(true);
                  }}
                  onMouseEnter={(e) => {
                    setHighlightedItem(item);
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.zIndex = '30';
                  }}
                  onMouseLeave={(e) => {
                    setHighlightedItem(null);
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.zIndex = '20';
                  }}
                  title={`Click to edit: "${item.text}"`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditMode && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Edit3 className="w-4 h-4" />
          <span>Click on any text to edit or delete it</span>
        </div>
      )}

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