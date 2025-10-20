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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
      }}
      onClick={(e) => {
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          console.log('Backdrop clicked, closing modal');
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          width: '400px',
          maxWidth: '90%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
          Edit Text
        </h2>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>
            Text Content
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            rows={4}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
          <p>Position: x={Math.round(position.x)}, y={Math.round(position.y)}</p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Delete
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px 16px',
              backgroundColor: '#d1d5db',
              color: '#374151',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditModal;
