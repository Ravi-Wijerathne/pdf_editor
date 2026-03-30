import React from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

interface ToolbarProps {
  onMovePages: (newOrder: number[]) => void;
  onMerge: (pdfBuffers: ArrayBuffer[]) => void;
  onSplit: (pageIndex: number) => void;
  onSave: () => void;
  onToggleEditMode?: () => void;
  hasPdf: boolean;
  isEditMode?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onMovePages,
  onMerge,
  onSplit,
  onSave,
  onToggleEditMode,
  hasPdf,
  isEditMode = false,
}) => {
  const handleMovePages = async () => {
    console.log('handleMovePages called, hasPdf:', hasPdf);
    
    if (!hasPdf) {
      console.log('No PDF loaded, returning');
      alert('Please open a PDF file first');
      return;
    }
    
    const orderStr = prompt('Enter new page order (comma-separated indices, e.g., 1,0,2):') || '';
    console.log('User entered order string:', orderStr);
    
    if (!orderStr.trim()) {
      console.log('Empty order string, returning');
      return;
    }
    
    const newOrder = orderStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    console.log('Parsed order array:', newOrder);
    
    if (newOrder.length === 0) {
      console.log('No valid numbers in order, returning');
      alert('Please enter valid page numbers (e.g., 1,0)');
      return;
    }
    
    console.log('Calling onMovePages with:', newOrder);
    
    try {
      await onMovePages(newOrder);
      console.log('onMovePages call completed');
      alert('Pages reordered successfully! Check the preview.');
    } catch (error) {
      console.error('Error in onMovePages:', error);
      alert('Error reordering pages: ' + error);
    }
  };

  const handleMerge = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (selected && typeof selected === 'string') {
        const contents = await readFile(selected);
        // Convert Uint8Array to ArrayBuffer using a fresh buffer to avoid detached issues
        const freshBuffer = new ArrayBuffer(contents.byteLength);
        new Uint8Array(freshBuffer).set(contents);
        onMerge([freshBuffer]);
      }
    } catch (error) {
      console.error('Error merging:', error);
    }
  };

  const handleSplit = async () => {
    if (!hasPdf) return;
    const pageIndex = parseInt(prompt('Enter page index to remove (0-based):') || '0');
    await onSplit(pageIndex);
  };

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          onClick={handleMovePages}
          disabled={!hasPdf}
          className="btn btn-secondary"
        >
          Move Pages
        </button>
        <button
          onClick={handleMerge}
          className="btn btn-accent"
        >
          Merge
        </button>
        <button
          onClick={handleSplit}
          disabled={!hasPdf}
          className="btn btn-danger"
        >
          Split
        </button>
        <button
          onClick={onSave}
          disabled={!hasPdf}
          className="btn btn-ghost"
        >
          Save
        </button>
      </div>

      {onToggleEditMode && (
        <div className="toolbar-group toolbar-group--end">
          <button
            onClick={onToggleEditMode}
            disabled={!hasPdf}
            className={isEditMode ? 'btn btn-warn' : 'btn btn-outline'}
          >
            {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;