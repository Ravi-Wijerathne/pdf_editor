import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock("./components/Toolbar", () => ({
  default: (props: any) => (
    <div>
      <button onClick={props.onSave}>Toolbar Save</button>
    </div>
  ),
}));

vi.mock("./components/PdfViewer", () => ({
  default: (props: any) => (
    <div>
      <div>Mock PDF Viewer</div>
      <div>{props.refreshKey}</div>
    </div>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
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

  it("does nothing when open dialog is canceled", async () => {
    vi.mocked(open).mockResolvedValue(null);

    render(<App />);
    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(open).toHaveBeenCalledTimes(1);
      expect(readFile).not.toHaveBeenCalled();
    });
  });

  it("shows notification when opening a file fails", async () => {
    vi.mocked(open).mockRejectedValue(new Error("dialog failed"));

    render(<App />);
    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(screen.getByText(/Error opening file/i)).toBeDefined();
    });
  });

  it("shows notification when save is requested without loaded pdf", async () => {
    render(<App />);
    fireEvent.click(screen.getByText("Toolbar Save"));

    await waitFor(() => {
      expect(screen.getByText("No PDF data to save")).toBeDefined();
      expect(save).not.toHaveBeenCalled();
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  it("does not write file when save dialog is canceled", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/file.pdf");
    vi.mocked(readFile).mockResolvedValue(new Uint8Array([2, 2, 2]));
    vi.mocked(save).mockResolvedValue(null);

    render(<App />);
    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(screen.getByText("Mock PDF Viewer")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Toolbar Save"));

    await waitFor(() => {
      expect(save).toHaveBeenCalledTimes(1);
      expect(writeFile).not.toHaveBeenCalled();
    });
  });

  it("shows notification when save fails", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/file.pdf");
    vi.mocked(readFile).mockResolvedValue(new Uint8Array([3, 3, 3]));
    vi.mocked(save).mockRejectedValue(new Error("save failed"));

    render(<App />);
    fireEvent.click(screen.getByText("Open PDF"));

    await waitFor(() => {
      expect(screen.getByText("Mock PDF Viewer")).toBeDefined();
    });

    fireEvent.click(screen.getByText("Toolbar Save"));

    await waitFor(() => {
      expect(screen.getByText(/Error saving file/i)).toBeDefined();
    });
  });

});
