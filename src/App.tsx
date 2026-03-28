import React from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import { FileUp, FileDown, Loader2, FileText } from 'lucide-react';
import PdfViewer from './components/PdfViewer';
import Toolbar from './components/Toolbar';
import { usePdf } from './hooks/usePdf';
import { editTextInPdf, deleteTextInPdf } from './utils/pdfUtils';
import './App.css';

function App() {
  const {
    pdfData,
    loadPdf,
    applyReorderPages,
    applyMergePdfs,
    applyRemovePage,
    refreshKey,
  } = usePdf();
  
  const [isEditMode, setIsEditMode] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleOpenFile = async () => {
    setIsLoading(true);
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (selected && typeof selected === 'string') {
        const contents = await readFile(selected);
        
        let arrayBuffer: ArrayBuffer;
        if (contents instanceof Uint8Array) {
          arrayBuffer = contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength);
        } else {
          const uint8Array = new Uint8Array(contents as any);
          arrayBuffer = uint8Array.buffer;
        }
        
        loadPdf(arrayBuffer);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Error opening file: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAs = async () => {
    if (!pdfData) {
      alert('No PDF data to save');
      return;
    }
    try {
      const filePath = await save({
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (filePath) {
        await writeFile(filePath, pdfData);
        alert('PDF saved successfully!');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file: ' + error);
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handlePageCountChange = (_count: number) => {};

  const handleTextEdit = async (
    pageIndex: number,
    x: number,
    y: number,
    newText: string,
    fontSize: number,
    width: number,
    height: number
  ) => {
    if (!pdfData) return;

    try {
      console.log('App handleTextEdit - Editing text at page', pageIndex, 'position', x, y, 'new text:', newText, 'old dimensions:', width, height);
      const updatedPdf = await editTextInPdf(
        pdfData,
        pageIndex,
        x,
        y,
        newText,
        fontSize,
        width,  // Pass old text width
        height, // Pass old text height
        true    // Cover old text
      );
      
      // Update the PDF data with the edited version
      loadPdf(updatedPdf.buffer as ArrayBuffer);
      alert('Text edited successfully!');
    } catch (error) {
      console.error('Error editing text:', error);
      alert('Error editing text: ' + error);
    }
  };

  const handleTextDelete = async (
    pageIndex: number,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!pdfData) return;

    try {
      console.log('Deleting text at page', pageIndex, 'position', x, y);
      const updatedPdf = await deleteTextInPdf(
        pdfData,
        pageIndex,
        x,
        y,
        width,
        height
      );
      
      // Update the PDF data with the edited version
      loadPdf(updatedPdf.buffer as ArrayBuffer);
      alert('Text deleted successfully!');
    } catch (error) {
      console.error('Error deleting text:', error);
      alert('Error deleting text: ' + error);
    }
  };

  // const { pdf, loadPdf } = usePdf();
  // const { reorderPages, mergePages, splitPage } = usePageOps();

  return (
    <div className="app min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toolbar
        onMovePages={applyReorderPages}
        onMerge={async (buffers) => {
          if (pdfData) {
            await applyMergePdfs([pdfData, ...buffers]);
          } else {
            await applyMergePdfs(buffers);
          }
        }}
        onSplit={applyRemovePage}
        onSave={handleSaveAs}
        onToggleEditMode={handleToggleEditMode}
        hasPdf={!!pdfData}
        isEditMode={isEditMode}
      />
      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <button
          onClick={handleOpenFile}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
          Open PDF
        </button>
        {pdfData && (
          <button
            onClick={handleSaveAs}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-lg font-medium text-sm shadow-md hover:shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-200 active:scale-95"
          >
            <FileDown className="w-4 h-4" />
            Save
          </button>
        )}
      </div>
      {!pdfData ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-8">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-inner">
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">No PDF Loaded</h2>
            <p className="text-slate-500 mb-6">Open a PDF file to start viewing and editing</p>
            <button
              onClick={handleOpenFile}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
              Choose PDF File
            </button>
          </div>
        </div>
      ) : (
        <PdfViewer 
          pdfData={pdfData} 
          refreshKey={refreshKey} 
          onPageCountChange={handlePageCountChange}
          isEditMode={isEditMode}
          onTextEdit={handleTextEdit}
          onTextDelete={handleTextDelete}
        />
      )}
    </div>
  );
}

export default App;
