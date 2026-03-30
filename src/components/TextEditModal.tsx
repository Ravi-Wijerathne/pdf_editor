import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    console.log('TextEditModal isOpen changed:', isOpen);
    console.log('TextEditModal initialText:', initialText);
  }, [isOpen, initialText]);

  if (!isOpen) {
    console.log('Modal not rendering - isOpen is false');
    return null;
  }

  console.log('Modal is rendering!');

  const handleSave = () => {
    console.log('Save button clicked, text:', text);
    onSave(text);
    onClose();
  };

  const handleDelete = () => {
    console.log('Delete button clicked');
    onDelete();
    onClose();
  };

  return (
    <div 
      className="modal-backdrop"
      onClick={(e) => {
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          console.log('Backdrop clicked, closing modal');
          onClose();
        }
      }}
    >
      <div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">
          Edit Text
        </h2>
        
        <div className="modal-field">
          <label className="modal-label">
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="modal-textarea"
            rows={4}
            autoFocus
          />
        </div>

        <div className="modal-meta">
          <p>Position: x={Math.round(position.x)}, y={Math.round(position.y)}</p>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleSave}
            className="btn btn-primary"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditModal;
