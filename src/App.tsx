import React from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import PdfViewer from './components/PdfViewer';
import Toolbar from './components/Toolbar';
import { usePdf } from './hooks/usePdf';
import { editTextInPdf, deleteTextInPdf } from './utils/pdfUtils';
// import { usePageOps } from './hooks/usePageOps';
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

  const handleOpenFile = async () => {
    try {
      console.log('Opening file dialog...');
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      console.log('Selected file:', selected);
      if (selected && typeof selected === 'string') {
        console.log('Reading file:', selected);
        const contents = await readFile(selected);
        console.log('File read, size:', contents.length, 'type:', typeof contents, 'constructor:', contents.constructor.name);
        
        // Tauri's readFile returns Uint8Array, convert to ArrayBuffer for loadPdf
        let arrayBuffer: ArrayBuffer;
        if (contents instanceof Uint8Array) {
          // Create a proper ArrayBuffer from Uint8Array
          arrayBuffer = contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength);
        } else {
          // Handle edge case where contents might be something else
          console.warn('Contents is not Uint8Array, converting...', contents);
          const uint8Array = new Uint8Array(contents as any);
          arrayBuffer = uint8Array.buffer;
        }
        
        console.log('ArrayBuffer created, size:', arrayBuffer.byteLength);
        loadPdf(arrayBuffer);
      }
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Error opening file: ' + error);
    }
  };

  const handleSaveAs = async () => {
    if (!pdfData) {
      alert('No PDF data to save');
      return;
    }
    try {
      console.log('Opening save dialog...');
      const filePath = await save({
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      console.log('Save path selected:', filePath);
      if (filePath) {
        console.log('Preparing to write file, data size:', pdfData.byteLength);
        
        // pdfData is already a Uint8Array, use it directly
        console.log('Writing file directly with Uint8Array, size:', pdfData.length);
        await writeFile(filePath, pdfData);
        console.log('File saved successfully to:', filePath);
        alert('PDF saved successfully!');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Error saving file: ' + error);
    }
  };

  const handlePageCountChange = () => {
    // Page count changed
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleTextEdit = async (
    pageIndex: number,
    x: number,
    y: number,
    newText: string,
    fontSize: number,
    _width: number,
    _height: number
  ) => {
    if (!pdfData) return;

    try {
      console.log('Editing text at page', pageIndex, 'position', x, y, 'new text:', newText);
      const updatedPdf = await editTextInPdf(
        pdfData,
        pageIndex,
        x,
        y,
        newText,
        fontSize,
        true // Cover old text
      );
      
      // Update the PDF data with the edited version
      loadPdf(updatedPdf.buffer);
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
      loadPdf(updatedPdf.buffer);
      alert('Text deleted successfully!');
    } catch (error) {
      console.error('Error deleting text:', error);
      alert('Error deleting text: ' + error);
    }
  };

  // const { pdf, loadPdf } = usePdf();
  // const { reorderPages, mergePages, splitPage } = usePageOps();

  return (
    <div className="app min-h-screen bg-gray-50">
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
      <div className="file-controls p-4 bg-white border-b border-gray-300">
        <button
          onClick={handleOpenFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Open PDF
        </button>
      </div>
      <PdfViewer 
        pdfData={pdfData} 
        refreshKey={refreshKey} 
        onPageCountChange={handlePageCountChange}
        isEditMode={isEditMode}
        onTextEdit={handleTextEdit}
        onTextDelete={handleTextDelete}
      />
    </div>
  );
}

export default App;
