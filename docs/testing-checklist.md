# Testing Checklist

Use this checklist for local manual QA before creating a release candidate.

## Test Data

- `simple.pdf`: 1 page with selectable text
- `multi-page.pdf`: at least 5 pages with mixed text
- `damaged.pdf`: corrupted or invalid PDF
- `unicode-name.pdf`: file name with non-ASCII characters

## Open/View

- Open a valid PDF and verify first page renders.
- Verify page count is correct.
- Navigate previous/next pages and verify content changes.
- Enter a page number manually and confirm navigation.
- Verify zoom in, zoom out, and fit-to-view controls.

## Edit Text

- Enable edit mode and verify text regions are clickable.
- Click a text item, update text, save, and verify on canvas.
- Repeat edit on multiple pages.
- Cancel modal and confirm no change is applied.

## Delete Text

- Select text in edit mode and delete it.
- Confirm deleted region is covered and no crash occurs.
- Repeat delete near page edges and with small text.

## Page Operations

- Reorder pages and verify new sequence in viewer.
- Remove a page and verify page count decreases.
- Insert a blank page and verify count increases.
- Merge with another PDF and verify total page count.

## Save/Export

- Save edited document to a new file.
- Reopen saved file and verify edits persist.
- Save without a loaded PDF and verify user feedback.

## Error Handling

- Try opening `damaged.pdf` and verify clear error messaging.
- Cancel open/save dialogs and verify app stays stable.
- Trigger file permission issue (read-only destination) and verify error feedback.

## Regression Smoke

- Open -> Edit -> Delete -> Reorder -> Save in a single session.
- Reopen final output and verify all operations persisted.
- Verify app remains responsive during repeated operations.
