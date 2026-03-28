import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit3 } from 'lucide-react';

interface TextEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newText: string) => void;
  onDelete: () => void;
  initialText: string;
  position: { x: number; y: number };
}

const TextEditModal: React.FC<TextEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialText,
  position,
}) => {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90vw] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              Edit Text
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              rows={4}
              autoFocus
              placeholder="Enter text..."
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span>Position:</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">x: {Math.round(position.x)}</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">y: {Math.round(position.y)}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditModal;
