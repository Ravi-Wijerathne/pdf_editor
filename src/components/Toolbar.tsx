import React from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';
import { 
  Files, 
  Scissors, 
  Save, 
  Edit3, 
  Eye, 
  ArrowRightLeft
} from 'lucide-react';

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
    if (!hasPdf) {
      alert('Please open a PDF file first');
      return;
    }
    
    const orderStr = prompt('Enter new page order (comma-separated indices, e.g., 1,0,2):') || '';
    
    if (!orderStr.trim()) {
      return;
    }
    
    const newOrder = orderStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    
    if (newOrder.length === 0) {
      alert('Please enter valid page numbers (e.g., 1,0)');
      return;
    }
    
    try {
      await onMovePages(newOrder);
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
    <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="flex items-center px-4 py-2 gap-3">
        <div className="flex-1 flex items-center">
          <h1 className="text-sm font-semibold text-slate-800">PDF Editor</h1>
        </div>

        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={handleMovePages}
              disabled={!hasPdf}
              title="Reorder Pages"
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Move</span>
            </button>
            
            <div className="w-px h-5 bg-slate-300" />
            
            <button
              onClick={handleMerge}
              title="Merge PDFs"
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <Files className="w-3.5 h-3.5" />
              <span>Merge</span>
            </button>
            
            <button
              onClick={handleSplit}
              disabled={!hasPdf}
              title="Remove Page"
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>

            <div className="w-px h-5 bg-slate-300" />

            <button
              onClick={onSave}
              disabled={!hasPdf}
              title="Save PDF"
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onToggleEditMode}
            disabled={!hasPdf}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isEditMode 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:shadow-lg' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isEditMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {isEditMode ? 'Edit Mode' : 'View Mode'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
