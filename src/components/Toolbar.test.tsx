import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Toolbar from "./Toolbar";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readFile: vi.fn(),
}));

describe("Toolbar", () => {
  const onMovePages = vi.fn();
  const onMerge = vi.fn();
  const onSplit = vi.fn();
  const onSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => undefined);
    vi.spyOn(window, "prompt").mockImplementation(() => null);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  const renderToolbar = (hasPdf = true) =>
    render(
      <Toolbar
        onMovePages={onMovePages}
        onMerge={onMerge}
        onSplit={onSplit}
        onSave={onSave}
        hasPdf={hasPdf}
      />,
    );

  it("disables move pages when no pdf is loaded", () => {
    renderToolbar(false);

    const moveButton = screen.getByText("Move Pages");

    expect(moveButton).toBeDisabled();
    fireEvent.click(moveButton);
    expect(window.alert).not.toHaveBeenCalled();
    expect(onMovePages).not.toHaveBeenCalled();
  });

  it("parses page order and calls onMovePages", async () => {
    vi.mocked(window.prompt).mockReturnValue("2, 0, 1");

    renderToolbar(true);
    fireEvent.click(screen.getByText("Move Pages"));

    await waitFor(() => {
      expect(onMovePages).toHaveBeenCalledWith([2, 0, 1]);
      expect(window.alert).toHaveBeenCalledWith("Pages reordered successfully! Check the preview.");
    });
  });

  it("alerts on invalid page order input", async () => {
    vi.mocked(window.prompt).mockReturnValue("abc, def");

    renderToolbar(true);
    fireEvent.click(screen.getByText("Move Pages"));

    await waitFor(() => {
      expect(onMovePages).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Please enter valid page numbers (e.g., 1,0)");
    });
  });

  it("does not move pages when prompt is empty", async () => {
    vi.mocked(window.prompt).mockReturnValue("   ");

    renderToolbar(true);
    fireEvent.click(screen.getByText("Move Pages"));

    await waitFor(() => {
      expect(onMovePages).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalledWith("Pages reordered successfully! Check the preview.");
    });
  });

  it("alerts when move pages callback throws", async () => {
    vi.mocked(window.prompt).mockReturnValue("1,0");
    onMovePages.mockRejectedValueOnce(new Error("reorder failed"));

    renderToolbar(true);
    fireEvent.click(screen.getByText("Move Pages"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Error reordering pages"));
    });
  });

  it("merges selected pdf buffer", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/second.pdf");
    vi.mocked(readFile).mockResolvedValue(new Uint8Array([10, 20, 30]));

    renderToolbar(true);
    fireEvent.click(screen.getByText("Merge"));

    await waitFor(() => {
      expect(open).toHaveBeenCalledTimes(1);
      expect(readFile).toHaveBeenCalledWith("C:/tmp/second.pdf");
      expect(onMerge).toHaveBeenCalledTimes(1);
    });

    const [buffers] = onMerge.mock.calls[0] as [ArrayBuffer[]];
    expect(buffers).toHaveLength(1);
    expect(Array.from(new Uint8Array(buffers[0]))).toEqual([10, 20, 30]);
  });

  it("does nothing when merge dialog is canceled", async () => {
    vi.mocked(open).mockResolvedValue(null);

    renderToolbar(true);
    fireEvent.click(screen.getByText("Merge"));

    await waitFor(() => {
      expect(readFile).not.toHaveBeenCalled();
      expect(onMerge).not.toHaveBeenCalled();
    });
  });

  it("handles merge read errors without calling onMerge", async () => {
    vi.mocked(open).mockResolvedValue("C:/tmp/second.pdf");
    vi.mocked(readFile).mockRejectedValue(new Error("read failed"));

    renderToolbar(true);
    fireEvent.click(screen.getByText("Merge"));

    await waitFor(() => {
      expect(onMerge).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("splits using prompted page index", async () => {
    vi.mocked(window.prompt).mockReturnValue("3");

    renderToolbar(true);
    fireEvent.click(screen.getByText("Split"));

    await waitFor(() => {
      expect(onSplit).toHaveBeenCalledWith(3);
    });
  });

  it("uses default split index when prompt is canceled", async () => {
    vi.mocked(window.prompt).mockReturnValue(null);

    renderToolbar(true);
    fireEvent.click(screen.getByText("Split"));

    await waitFor(() => {
      expect(onSplit).toHaveBeenCalledWith(0);
    });
  });

  it("calls onSave when save is clicked", () => {
    renderToolbar(true);

    fireEvent.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables split button when no pdf is loaded", () => {
    renderToolbar(false);

    expect(screen.getByText("Split")).toBeDisabled();
  });
});
