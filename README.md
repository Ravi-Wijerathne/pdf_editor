# PDF Editor

A powerful desktop PDF editor built with Tauri, React, and TypeScript. Edit PDFs with ease using a modern, cross-platform interface.

## Features

- 📄 **Open PDF Files** - Load and view PDF documents
- 🔄 **Reorder Pages** - Rearrange pages in any order
- 🔗 **Merge PDFs** - Combine multiple PDF files into one
- ✂️ **Split PDFs** - Remove specific pages from documents
- 💾 **Save Changes** - Export your edited PDFs
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux

## Screenshots

![PDF Editor Interface](docs/screenshot.png)

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

### Reordering Pages

1. Make sure a PDF is loaded
2. Click the **"Move Pages"** button in the toolbar
3. Enter the current total number of pages when prompted
4. Enter the new page order as comma-separated numbers (0-based indexing)
   - Example: For a 3-page PDF, enter `2,0,1` to move page 3 to first, page 1 to second, and page 2 to third
5. The preview will update immediately to show the new page order

### Merging PDFs

1. Click the **"Merge"** button in the toolbar
2. Select multiple PDF files to merge with your current document
3. The files will be combined in the order selected
4. Use **"Save"** to export the merged PDF

### Splitting/Removing Pages

1. Click the **"Split"** button in the toolbar
2. Enter the page index (0-based) of the page you want to remove
   - Example: Enter `0` to remove the first page, `1` to remove the second page
3. The page will be removed from the document

### Saving Your Work

1. After making any edits, click the **"Save"** button
2. Choose a location and filename for your edited PDF
3. Click **"Save"** to export the document

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open PDF | `Ctrl+O` (Windows/Linux) / `Cmd+O` (macOS) |
| Save PDF | `Ctrl+S` (Windows/Linux) / `Cmd+S` (macOS) |
| Zoom In | `Ctrl++` (Windows/Linux) / `Cmd++` (macOS) |
| Zoom Out | `Ctrl+-` (Windows/Linux) / `Cmd+-` (macOS) |

## Technical Details

### Built With

- **[Tauri](https://tauri.app/)** - Desktop application framework
- **[React](https://reactjs.org/)** - Frontend UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[PDF.js](https://mozilla.github.io/pdf.js/)** - PDF rendering engine
- **[PDF-lib](https://pdf-lib.js.org/)** - PDF manipulation library
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vite](https://vitejs.dev/)** - Build tool and development server

### Architecture

```
├── src/
│   ├── components/         # React components
│   │   ├── PdfViewer.tsx  # PDF rendering and display
│   │   └── Toolbar.tsx    # Action buttons and controls
│   ├── hooks/             # Custom React hooks
│   │   └── usePdf.ts      # PDF state management
│   ├── utils/             # Utility functions
│   │   └── pdfUtils.ts    # PDF manipulation functions
│   └── App.tsx            # Main application component
├── src-tauri/             # Tauri backend (Rust)
└── public/                # Static assets
```

### Data Flow

1. **File Loading**: Tauri file dialog → File system read → ArrayBuffer → Uint8Array
2. **PDF Processing**: Uint8Array → pdf-lib manipulation → New Uint8Array
3. **Rendering**: Uint8Array → PDF.js worker → Canvas rendering
4. **Saving**: Uint8Array → Tauri file system write

## Troubleshooting

### Common Issues

**Problem**: PDF won't open
- **Solution**: Ensure the file is a valid PDF and not corrupted
- **Solution**: Try opening a different PDF to test if the issue is file-specific

**Problem**: Application won't start
- **Solution**: Make sure all dependencies are installed
- **Solution**: Try rebuilding the application with `npm run tauri build`

**Problem**: Changes aren't saving
- **Solution**: Check file permissions in the save location
- **Solution**: Try saving to a different directory

### Getting Help

If you encounter issues:
1. Check the [Issues](https://github.com/Ravi-Wijerathne/pdf_editor/issues) page for known problems
2. Open a new issue with detailed information about your problem
3. Include your operating system and PDF Editor version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF rendering capabilities
- [PDF-lib](https://pdf-lib.js.org/) for PDF manipulation features
- [Tauri](https://tauri.app/) for the amazing desktop app framework
- The open source community for the incredible tools and libraries

---

**Made with ❤️ by [Ravi Wijerathne](https://github.com/Ravi-Wijerathne)**
