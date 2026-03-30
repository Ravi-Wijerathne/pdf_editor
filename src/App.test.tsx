import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import { deleteTextInPdf, editTextInPdf } from "./utils/pdfUtils";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("./utils/pdfUtils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils/pdfUtils")>();
  return {
    ...actual,
    editTextInPdf: vi.fn(),
    deleteTextInPdf: vi.fn(),
  };
});

vi.mock("./components/Toolbar", () => ({
  default: (props: any) => (
    <div>
      <button onClick={props.onToggleEditMode}>Toggle Edit</button>
      <button onClick={props.onSave}>Toolbar Save</button>
    </div>
  ),
}));

vi.mock("./components/PdfViewer", () => ({
  default: (props: any) => (
    <div>
      <div>Mock PDF Viewer</div>
      <button
        onClick={() => props.onTextEdit?.(0, 10, 20, "new text", 12, 40, 16)}
      >
        Trigger Text Edit
      </button>
      <button onClick={() => props.onTextDelete?.(0, 11, 21, 41, 17)}>
        Trigger Text Delete
      </button>
    </div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
  });

  it("opens a PDF and renders viewer", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/file.pdf");
    vi.mocked(readFile).mockResolvedValue(new Uint8Array([1, 2, 3]));

    render(<App />);

    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(open).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledWith("C:/tmp/file.pdf");
      expect(screen.getByText("Mock PDF Viewer")).toBeDefined();
    });
  });

  it("saves loaded PDF", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/file.pdf");
    vi.mocked(readFile).mockResolvedValue(new Uint8Array([4, 5, 6]));
    vi.mocked(save).mockResolvedValue("C:/tmp/saved.pdf");

    render(<App />);

    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(screen.getByText("Mock PDF Viewer")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Toolbar Save"));

    await waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenCalledTimes(1);
    });
  });

  it("invokes text edit and delete handlers with loaded pdf", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/file.pdf");
    vi.mocked(readFile).mockResolvedValue(new Uint8Array([7, 8, 9]));
    vi.mocked(editTextInPdf).mockResolvedValue(new Uint8Array([9, 9, 9]));
    vi.mocked(deleteTextInPdf).mockResolvedValue(new Uint8Array([8, 8, 8]));

    render(<App />);

    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(screen.getByText("Mock PDF Viewer")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Trigger Text Edit"));

    await waitFor(() => {
      expect(editTextInPdf).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("Trigger Text Delete"));

    await waitFor(() => {
      expect(deleteTextInPdf).toHaveBeenCalledTimes(1);
    });
  });
});
