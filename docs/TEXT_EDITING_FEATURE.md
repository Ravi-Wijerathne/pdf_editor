# PDF Text Editing Feature

## Overview

This document describes the implementation of the PDF text editing feature that allows users to edit and delete text directly in PDF documents, similar to Adobe Acrobat's text editing capabilities.

## Architecture

### Components

#### 1. TextEditModal (`src/components/TextEditModal.tsx`)
- Modal dialog component for text editing
- Features:
  - Text input area for editing
  - Save button to apply changes
  - Delete button to remove text
  - Cancel button to close without changes
  - Displays position information

#### 2. PdfViewer (`src/components/PdfViewer.tsx`)
Enhanced with text editing capabilities:
- **Text Extraction**: Uses PDF.js `getTextContent()` to extract text items with positions
- **Visual Highlighting**: Draws yellow highlights on text when hovering in edit mode
- **Click Handling**: Detects clicks on text items and opens edit modal
- **Coordinate Transformation**: Converts between canvas and PDF coordinate systems

#### 3. Toolbar (`src/components/Toolbar.tsx`)
- Added "Edit Text" button to toggle edit mode
- Visual indicator when edit mode is active (checkmark)

#### 4. App (`src/App.tsx`)
- Manages edit mode state
- Handles text edit and delete operations
- Coordinates between UI and PDF manipulation functions

### Utilities

#### PDF Manipulation (`src/utils/pdfUtils.ts`)

##### `editTextInPdf()`
- Overlays new text on top of old text
- Draws a white rectangle to cover old text first
- Uses pdf-lib's `drawRectangle()` and `drawText()` methods
- Embeds Helvetica font for text rendering

##### `deleteTextInPdf()`
- Covers text with a white rectangle
- Effectively "deletes" text by making it invisible

## User Workflow

1. **Open PDF**: User opens a PDF file using the "Open PDF" button
2. **Enable Edit Mode**: User clicks "Edit Text" button in toolbar
3. **Select Text**: User hovers over text (highlighted in yellow) and clicks
4. **Edit/Delete**: Modal opens with options to:
   - Edit the text content
   - Delete the text entirely
   - Cancel the operation
5. **Apply Changes**: Changes are applied to the PDF in memory
6. **Save**: User saves the edited PDF using "Save" button

## Technical Implementation

### Text Extraction Process

```typescript
// Extract text content from PDF page
const textContent = await page.getTextContent();

// Transform to canvas coordinates
textContent.items.forEach((item: any) => {
  const transform = item.transform;
  const x = transform[4];
  const y = viewport.height - transform[5]; // Flip Y coordinate
  const fontSize = Math.abs(transform[0]);
  // ... create TextItem
});
```

### Text Editing Process

```typescript
// 1. Cover old text with white rectangle
page.drawRectangle({
  x: x - 2,
  y: y - 2,
  width: textWidth + 4,
  height: textHeight + 4,
  color: rgb(1, 1, 1), // white
});

// 2. Draw new text
page.drawText(newText, {
  x,
  y,
  size: fontSize,
  font,
  color: rgb(0, 0, 0),
});
```

### Coordinate Systems

The implementation handles two coordinate systems:

1. **Canvas Coordinates** (PDF.js rendering)
   - Origin at top-left
   - Y increases downward

2. **PDF Coordinates** (pdf-lib manipulation)
   - Origin at bottom-left
   - Y increases upward

Conversion: `pdfY = canvasHeight - canvasY`

## Technologies Used

### PDF.js
- **Purpose**: Text extraction and rendering
- **Key Features**:
  - `getTextContent()`: Extracts text with positions
  - Text item transformation matrices for positioning
  - Canvas rendering for display

### pdf-lib
- **Purpose**: PDF content stream manipulation
- **Key Features**:
  - `drawText()`: Add text to PDF
  - `drawRectangle()`: Cover/delete text
  - `embedFont()`: Use standard fonts
  - Content stream regeneration

## Limitations and Future Improvements

### Current Limitations
1. Uses overlay approach (covers old text) rather than true content stream parsing
2. Fixed to Helvetica font
3. Approximate font size matching
4. Cannot edit complex formatted text (bold, italic, etc.)
5. May not perfectly match original text position

### Potential Improvements
1. **True Content Stream Editing**:
   - Parse PDF content streams directly
   - Modify existing text operators
   - Preserve original formatting

2. **Font Matching**:
   - Detect and use original fonts
   - Support embedded fonts

3. **Advanced Features**:
   - Support text with multiple styles
   - Handle rotated text
   - Support text in forms
   - Multi-line text editing

4. **Backend Integration** (via Tauri):
   - Use Apache PDFBox (Java) for advanced operations
   - Integrate PyPDF2/pypdf (Python) for complex parsing
   - Use qpdf or Poppler (C++) for low-level manipulation

## Testing

### Manual Testing Steps
1. Open a PDF with text content
2. Enable "Edit Text" mode
3. Hover over various text elements (should highlight)
4. Click on text to open edit modal
5. Edit text and save (verify changes appear)
6. Delete text (verify text disappears)
7. Save edited PDF to file
8. Reopen saved PDF to verify persistence

### Edge Cases to Test
- Multi-line text
- Text near page edges
- Small font sizes
- Large font sizes
- Special characters
- Non-English characters
- Rotated text

## Security Considerations

- All PDF operations run client-side
- No external API calls for PDF manipulation
- Uses trusted libraries (PDF.js, pdf-lib)
- CodeQL analysis passed with no alerts
- File operations use Tauri's secure file system API

## Performance

- Text extraction is performed per page (on-demand)
- PDF regeneration is incremental (only modified pages)
- Uses Web Workers for PDF.js rendering
- Minimal memory footprint (works with PDF data in memory)
