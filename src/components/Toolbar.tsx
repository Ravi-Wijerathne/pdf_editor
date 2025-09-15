import React from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs';

interface ToolbarProps {
  onAddText: (pageIndex: number, text: string, x: number, y: number, fontSize?: number) => void;
  onHighlight: (pageIndex: number, x: number, y: number, width: number, height: number) => void;
  onMovePages: (newOrder: number[]) => void;
  onMerge: (pdfBuffers: ArrayBuffer[]) => void;
  onSplit: (pageIndex: number) => void;
  onSave: () => void;
  hasPdf: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onAddText,
  onHighlight,
  onMovePages,
  onMerge,
  onSplit,
  onSave,
  hasPdf,
}) => {
  const handleAddText = async () => {
    if (!hasPdf) return;
    const pageIndex = parseInt(prompt('Enter page index (0-based):') || '0');
    const text = prompt('Enter text:') || '';
    const x = parseFloat(prompt('Enter x coordinate:') || '100');
    const y = parseFloat(prompt('Enter y coordinate:') || '100');
    const fontSize = parseInt(prompt('Enter font size:') || '12');
    await onAddText(pageIndex, text, x, y, fontSize);
  };

  const handleHighlight = async () => {
    if (!hasPdf) return;
    const pageIndex = parseInt(prompt('Enter page index (0-based):') || '0');
    const x = parseFloat(prompt('Enter x coordinate:') || '100');
    const y = parseFloat(prompt('Enter y coordinate:') || '100');
    const width = parseFloat(prompt('Enter width:') || '200');
    const height = parseFloat(prompt('Enter height:') || '50');
    await onHighlight(pageIndex, x, y, width, height);
  };

  const handleMovePages = async () => {
    if (!hasPdf) return;
    const orderStr = prompt('Enter new page order (comma-separated indices, e.g., 1,0,2):') || '';
    const newOrder = orderStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    await onMovePages(newOrder);
  };

  const handleMerge = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
      });
      if (selected && typeof selected === 'string') {
        const contents = await readFile(selected);
        onMerge([contents.buffer]);
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
    <div className="toolbar bg-gray-100 p-4 border-b border-gray-300">
      <div className="flex space-x-2">
        <button
          onClick={handleAddText}
          disabled={!hasPdf}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Add Text
        </button>
        <button
          onClick={handleHighlight}
          disabled={!hasPdf}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Highlight
        </button>
        <button
          onClick={handleMovePages}
          disabled={!hasPdf}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Move Pages
        </button>
        <button
          onClick={handleMerge}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Merge
        </button>
        <button
          onClick={handleSplit}
          disabled={!hasPdf}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Split
        </button>
        <button
          onClick={onSave}
          disabled={!hasPdf}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Toolbar;