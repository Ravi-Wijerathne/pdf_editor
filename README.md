# PDF Editor

A powerful desktop PDF editor built with Tauri, React, and TypeScript. Edit PDFs with ease using a modern, cross-platform interface - featuring Adobe Acrobat-like text editing capabilities.

## ✨ Features

- 📄 **Open & View PDFs** - Load and view PDF documents with smooth rendering
- ✏️ **Edit Text in PDFs** - Click-to-edit text directly in PDFs (like Adobe Acrobat)
  - Interactive text selection with visual highlighting
  - Edit existing text content
  - Delete unwanted text
  - Real-time preview of changes
- 🔄 **Reorder Pages** - Rearrange pages in any order
- 🔗 **Merge PDFs** - Combine multiple PDF files into one
- ✂️ **Remove Pages** - Delete specific pages from documents
- � **Zoom Controls** - Zoom in/out for better visibility
- 📍 **Page Navigation** - Easy navigation between pages
- �💾 **Save Changes** - Export your edited PDFs
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux
- 🎨 **Modern UI** - Clean, intuitive interface with visual feedback

## Installation

### Download Pre-built Binaries

1. Go to the [Releases](https://github.com/Ravi-Wijerathne/pdf_editor/releases) page
2. Download the appropriate installer for your operating system:
   - **Windows**: `pdf-editor_0.1.0_x64-setup.exe` or `pdf-editor_0.1.0_x64_en-US.msi`
   - **macOS**: `pdf-editor_0.1.0_x64.dmg` (when available)
   - **Linux**: `pdf-editor_0.1.0_amd64.deb` or `pdf-editor_0.1.0_x86_64.AppImage` (when available)
3. Run the installer and follow the setup instructions

### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://rustup.rs/) (latest stable version)
- [Git](https://git-scm.com/)

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ravi-Wijerathne/pdf_editor.git
   cd pdf_editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri dev
   ```

4. **Build for production**
   ```bash
   npm run tauri build
   ```

## How to Use

### Opening a PDF

1. Launch the PDF Editor application
2. Click the **"Open PDF"** button
3. Select a PDF file from your computer
4. The PDF will load and display in the viewer

### Navigating Pages

- Use the **Previous** and **Next** buttons above the PDF preview to navigate between pages
- Use **Zoom In** and **Zoom Out** buttons to adjust the view
- The page counter shows your current position (e.g., "Page 1 of 5")

### Editing Text (Interactive Mode)

The PDF Editor features an advanced text editing system that allows you to modify text content directly in PDFs, similar to Adobe Acrobat.

#### Activating Edit Mode

1. Make sure a PDF is loaded
2. Click the **"Edit Text"** button in the toolbar
3. The button will turn green and show **"✓ Edit Text Mode"** when active
4. A blue notification banner will appear showing the number of editable text items found

#### How Text Editing Works

**Visual Feedback:**
- All editable text in the PDF will be outlined with blue boxes
- Hover over any text - it will highlight in **yellow** with a thicker border
- The cursor will change to a pointer when hovering over editable text
- Text boxes scale properly with zoom level

**Editing Text:**
1. **Click** on any blue box containing the text you want to edit
2. A **modal dialog** will appear with:
   - The current text content in an editable textarea
   - Position information (X, Y coordinates)
   - Three action buttons: **Save**, **Delete**, and **Cancel**

3. **To Edit:**
   - Modify the text in the textarea
   - Click **"Save"** to apply changes
   - The old text will be covered with a white rectangle
   - New text will be drawn at the same position
   - PDF automatically reloads to show changes

4. **To Delete:**
   - Click **"Delete"** in the modal
   - The text will be removed (covered with white)
   - PDF automatically reloads

5. **To Cancel:**
   - Click **"Cancel"** or click outside the modal
   - No changes will be made

#### Important Notes

- Text editing uses coordinate-based replacement (covers old text, draws new text)
- Font size is preserved from the original text
- Works at any zoom level - coordinates are automatically scaled
- Changes are immediately visible after saving
- Remember to use the **"Save"** button in the toolbar to export your edited PDF to a file

#### Exiting Edit Mode

1. Click the **"Edit Text"** button again to disable editing mode
2. Blue boxes will disappear
3. Normal viewing mode is restored

### Reordering Pages

1. Make sure a PDF is loaded
2. Click the **"Move Pages"** button in the toolbar
3. Enter the new page order as comma-separated numbers (0-based indexing)
   - Example: For a 3-page PDF, enter `2,0,1` to move:
     - Page 3 (index 2) to first position
     - Page 1 (index 0) to second position  
     - Page 2 (index 1) to third position
4. Click OK and the PDF will reload with pages in the new order
5. Use **"Save"** to export the reordered PDF

### Merging PDFs

1. Click the **"Merge"** button in the toolbar
2. Select one or more PDF files from the file dialog
3. The selected PDFs will be merged with your current document
4. Pages from the new PDFs are added after the current document's pages
5. Use **"Save"** to export the merged PDF

### Removing Pages

1. Click the **"Split"** button in the toolbar
2. Enter the page index (0-based) of the page you want to remove
   - Example: Enter `0` to remove the first page, `1` to remove the second page
3. Click OK and the page will be removed
4. The PDF will reload without the removed page
5. Use **"Save"** to export the modified PDF

### Saving Your Work

1. After making any edits, click the **"Save"** button
2. Choose a location and filename for your edited PDF
3. Click **"Save"** to export the document

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open PDF | Click "Open PDF" button |
| Save PDF | Click "Save" button |
| Zoom In | Click "Zoom In" button |
| Zoom Out | Click "Zoom Out" button |
| Next Page | Click "Next" button |
| Previous Page | Click "Previous" button |
| Edit Text Mode | Click "Edit Text" button |

> **Note**: Keyboard shortcuts are currently controlled through button clicks. Custom keyboard shortcuts may be added in future versions.

## Technical Details

### Built With

- **[Tauri](https://tauri.app/)** v2 - Lightweight desktop application framework
- **[React](https://reactjs.org/)** v19 - Frontend UI library with modern hooks
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript for reliability
- **[PDF.js](https://mozilla.github.io/pdf.js/)** v5.4 - Mozilla's PDF rendering and text extraction engine
- **[PDF-lib](https://pdf-lib.js.org/)** v1.17 - PDF content manipulation and editing library
- **[TailwindCSS](https://tailwindcss.com/)** v4 - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** v7 - Lightning-fast build tool and development server

### Key Technologies Explained

**Text Editing Architecture:**
- **PDF.js** extracts text content with precise positioning data (X, Y coordinates, font size)
- Custom overlay layer renders interactive clickable boxes over each text item
- **PDF-lib** handles PDF content stream manipulation for text replacement
- Coordinate transformation system converts between canvas space and PDF space
- White rectangle technique covers old text before drawing new text

**Coordinate System:**
- Canvas: Y-axis increases from top (0) to bottom (height)
- PDF: Y-axis increases from bottom (0) to top (height)
- All coordinates are scaled based on zoom level for accuracy

### Architecture

```
├── src/
│   ├── components/              # React components
│   │   ├── PdfViewer.tsx       # PDF rendering, text extraction & editing UI
│   │   ├── TextEditModal.tsx   # Text editing dialog component
│   │   ├── Toolbar.tsx         # Action buttons and controls
│   │   └── PageControls.tsx    # Page navigation controls
│   ├── hooks/                  # Custom React hooks
│   │   ├── usePdf.ts           # PDF state management
│   │   └── usePageOps.ts       # Page operation handlers
│   ├── utils/                  # Utility functions
│   │   └── pdfUtils.ts         # PDF manipulation functions (edit, delete, merge, etc.)
│   ├── styles/                 # Global styles
│   │   └── globals.css         # TailwindCSS imports
│   └── App.tsx                 # Main application component
├── src-tauri/                  # Tauri backend (Rust)
│   ├── src/
│   │   ├── main.rs             # Tauri app initialization
│   │   └── lib.rs              # Library exports
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
└── public/                     # Static assets
    └── pdf.worker.js           # PDF.js web worker
```

### Data Flow

1. **File Loading**: 
   - User clicks "Open PDF" → Tauri file dialog
   - File system read → Uint8Array
   - Passed to PDF processing pipeline

2. **PDF Rendering**: 
   - Uint8Array → PDF.js document loading
   - PDF.js worker renders to HTML5 Canvas
   - Canvas displays in React component

3. **Text Extraction** (Edit Mode):
   - PDF.js extracts text content with positioning data
   - Transform coordinates from PDF space to canvas space
   - Scale coordinates based on zoom level
   - Create interactive overlay boxes

4. **Text Editing**:
   - User clicks text box → Opens modal with current text
   - User modifies text → Coordinates converted back to PDF space
   - pdf-lib draws white rectangle (covers old text)
   - pdf-lib draws new text at same position
   - Returns new Uint8Array → Reload PDF viewer

5. **Page Operations**:
   - pdf-lib manipulates page structure
   - Returns modified Uint8Array
   - PDF viewer reloads with changes

6. **Saving**: 
   - Current Uint8Array → Tauri file dialog
   - User selects save location → File system write
   - Success notification

## 🐛 Troubleshooting

### Common Issues

**Problem**: PDF won't open
- **Solution**: Ensure the file is a valid PDF and not corrupted
- **Solution**: Check file permissions
- **Solution**: Try opening a different PDF to isolate the issue

**Problem**: Text editing doesn't show blue boxes
- **Solution**: Make sure "Edit Text Mode" is enabled (button should be green)
- **Solution**: The PDF might be scanned/image-based (no text layer)
- **Solution**: Try zooming in/out and re-enabling edit mode

**Problem**: Edited text appears in wrong position
- **Solution**: This should be fixed in the current version
- **Solution**: Try editing at 100% zoom (scale 1.0) for best accuracy
- **Solution**: Report the issue with the specific PDF file

**Problem**: Text editing modal doesn't appear
- **Solution**: Check browser console for errors (F12 in dev mode)
- **Solution**: Ensure you're clicking on the blue text boxes
- **Solution**: Try reloading the PDF

**Problem**: Application won't start
- **Solution**: Reinstall the application
- **Solution**: Check system requirements
- **Solution**: Review error logs in the terminal

**Problem**: Changes aren't saving
- **Solution**: Check file permissions in the save location
- **Solution**: Try saving to a different directory
- **Solution**: Ensure you have enough disk space

### Known Limitations

- Text editing uses overlay technique (doesn't modify original PDF structure)
- Font matching may not be exact (uses Helvetica as default)
- Scanned PDFs (images) cannot be edited without OCR
- Complex PDF features (forms, signatures) are not supported for editing

### Getting Help

If you encounter issues:
1. Check the [Issues](https://github.com/Ravi-Wijerathne/pdf_editor/issues) page for known problems
2. Open a new issue with:
   - Your operating system and version
   - PDF Editor version
   - Steps to reproduce the problem
   - Sample PDF file (if possible)
   - Screenshots or error messages

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/pdf_editor.git`
3. Create a feature branch: `git checkout -b feature/AmazingFeature`
4. Install dependencies: `npm install`
5. Start development server: `npm run tauri dev`
6. Make your changes and test thoroughly
7. Commit your changes: `git commit -m 'Add some AmazingFeature'`
8. Push to the branch: `git push origin feature/AmazingFeature`
9. Open a Pull Request

### Coding Standards

- Use TypeScript for type safety
- Follow existing code formatting
- Add comments for complex logic
- Test all features before submitting
- Update documentation as needed

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) by Mozilla - For excellent PDF rendering capabilities
- [PDF-lib](https://pdf-lib.js.org/) - For powerful PDF manipulation features
- [Tauri](https://tauri.app/) - For the amazing lightweight desktop app framework
- [React](https://reactjs.org/) - For the robust UI framework
- The open source community for incredible tools and inspiration

## 📞 Contact

**Ravi Wijerathne**
- GitHub: [@Ravi-Wijerathne](https://github.com/Ravi-Wijerathne)
- Repository: [pdf_editor](https://github.com/Ravi-Wijerathne/pdf_editor)

---

**⭐ If you find this project useful, please consider giving it a star on GitHub!**

**Made with ❤️ using Tauri, React, and TypeScript**
