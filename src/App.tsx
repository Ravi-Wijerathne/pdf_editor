import { useEffect, useRef, useState } from 'react';
import { open, save } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile } from '@tauri-apps/plugin-fs';
import PdfViewer from './components/PdfViewer';
import Toolbar from './components/Toolbar';
import { usePdf } from './hooks/usePdf';
// import { usePageOps } from './hooks/usePageOps';
import './App.css';

type NotificationType = 'success' | 'error' | 'info';

interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
}

function App() {
  const {
    pdfData,
    loadPdf,
    applyReorderPages,
    applyMergePdfs,
    applyRemovePage,
    refreshKey,
  } = usePdf();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notificationRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const dismissLatestNotification = () => {
    setNotifications((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const latest = prev[prev.length - 1];
      return prev.filter((item) => item.id !== latest.id);
    });
  };

  const pushNotification = (message: string, type: NotificationType = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  };

  useEffect(() => {
    if (notifications.length === 0) {
      return;
    }

    const latest = notifications[notifications.length - 1];
    notificationRefs.current[latest.id]?.focus();
  }, [notifications]);

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
      pushNotification('Error opening file: ' + error, 'error');
    }
  };

  const handleSaveAs = async () => {
    if (!pdfData) {
      pushNotification('No PDF data to save', 'info');
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
        pushNotification('PDF saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      pushNotification('Error saving file: ' + error, 'error');
    }
  };

  const handlePageCountChange = () => {
    // Page count changed
  };

  // const { pdf, loadPdf } = usePdf();
  // const { reorderPages, mergePages, splitPage } = usePageOps();

  return (
    <div className="app-shell">
      <div className="notification-stack" aria-live="polite" aria-atomic="false">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`notification notification--${item.type}`}
            role={item.type === 'error' ? 'alert' : 'status'}
            aria-live={item.type === 'error' ? 'assertive' : 'polite'}
            tabIndex={0}
            ref={(element) => {
              notificationRefs.current[item.id] = element;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                dismissLatestNotification();
              }
            }}
          >
            <span>{item.message}</span>
            <button
              className="notification__close"
              onClick={() => {
                dismissNotification(item.id);
              }}
              aria-label="Dismiss notification"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="app-shell__glow app-shell__glow--left" />
      <div className="app-shell__glow app-shell__glow--right" />

      <div className="app-frame">
        <header className="app-header">
          <div>
            <p className="app-eyebrow">Tauri PDF Workspace</p>
            <h1>PDF Editor</h1>
            <p className="app-subtitle">Open, merge, reorder, split, and save PDFs with a cleaner workspace.</p>
          </div>
          <button
            onClick={handleOpenFile}
            className="btn btn-primary"
          >
            Open PDF
          </button>
        </header>

        <section className="app-panel">
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
            onNotify={pushNotification}
            hasPdf={!!pdfData}
          />
        </section>

        <section className="app-panel app-panel--viewer">
          <PdfViewer 
            pdfData={pdfData} 
            refreshKey={refreshKey} 
            onPageCountChange={handlePageCountChange}
          />
        </section>
      </div>
    </div>
  );
}

export default App;
