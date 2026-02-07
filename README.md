# PDF Editor

Desktop PDF editor built with Tauri, React, and TypeScript.

## Features

- Open and view PDFs
- Edit text directly in PDFs
- Reorder, merge, and remove pages
- Zoom and page navigation
- Save edited PDFs

## Install (prebuilt)

Download a release from:
https://github.com/Ravi-Wijerathne/pdf_editor/releases

## Build from source

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- Git

### Steps

```bash
git clone https://github.com/Ravi-Wijerathne/pdf_editor.git
cd pdf_editor
npm install
npm run tauri dev
```

### Production build

```bash
npm run tauri build
```

## Python script

This repo includes a helper Python script for automatic setup and launch: run.py

```bash
python run.py
```

## License

MIT. See LICENSE.