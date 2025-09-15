import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import PdfViewer from './components/PdfViewer';
import Toolbar from './components/Toolbar';
import PageControls from './components/PageControls';
import { usePdf } from './hooks/usePdf';
// import { usePageOps } from './hooks/usePageOps';
import './App.css';

function App() {
  const {
    pdfData,
    loadPdf,
    applyInsertText,
    applyHighlightArea,
    applyReorderPages,
    applyMergePdfs,
    applyRemovePage,
  } = usePdf();

  const handleOpenFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (selected && typeof selected === 'string') {
        const contents = await readFile(selected);
        loadPdf(contents.buffer);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleSaveAs = async () => {
    if (!pdfData) return;
    try {
      const filePath = await save({
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (filePath) {
        await writeFile(filePath, new Uint8Array(pdfData));
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const handlePageCountChange = () => {
    // Page count changed
  };

  // const { pdf, loadPdf } = usePdf();
  // const { reorderPages, mergePages, splitPage } = usePageOps();

  return (
    <div className="app min-h-screen bg-gray-50">
      <Toolbar
        onAddText={applyInsertText}
        onHighlight={applyHighlightArea}
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
        hasPdf={!!pdfData}
      />
      <div className="file-controls p-4 bg-white border-b border-gray-300">
        <button
          onClick={handleOpenFile}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Open PDF
        </button>
      </div>
      <PdfViewer pdfData={pdfData} onPageCountChange={handlePageCountChange} />
      <PageControls />
    </div>
  );
}

export default App;
