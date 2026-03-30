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

## Testing

### Automated tests

```bash
# run all tests once
npm run test

# watch mode while developing tests
npm run test:watch

# run tests with coverage output
npm run test:coverage
```

Coverage reports are generated in `coverage/`.

### Current focus

- Unit tests for core PDF operations in `src/utils/pdfUtils.ts`
- Hook tests for state transitions in `src/hooks/usePdf.ts`
- Component behavior tests for text edit modal and app workflows

### Manual QA checklist

A feature-complete manual checklist is available in `docs/testing-checklist.md`.

## Python script

This repo includes a helper Python script for automatic setup and launch: scripts/run.py

```bash
python scripts/run.py
```

## License

MIT. See LICENSE.