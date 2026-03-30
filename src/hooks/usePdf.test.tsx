import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePdf } from "./usePdf";
import { mergePdfs, removePage, reorderPages } from "../utils/pdfUtils";

vi.mock("../utils/pdfUtils", () => ({
  reorderPages: vi.fn(),
  mergePdfs: vi.fn(),
  removePage: vi.fn(),
}));

describe("usePdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads ArrayBuffer into Uint8Array and bumps refresh key", () => {
    const { result } = renderHook(() => usePdf());
    const data = new Uint8Array([1, 2, 3, 4]).buffer;

    act(() => {
      result.current.loadPdf(data);
    });

    expect(result.current.pdfData).not.toBeNull();
    expect(result.current.pdfData).toBeInstanceOf(Uint8Array);
    expect(Array.from(result.current.pdfData ?? [])).toEqual([1, 2, 3, 4]);
    expect(result.current.refreshKey).toBe(1);
  });

  it("does nothing on reorder when pdf is not loaded", async () => {
    const { result } = renderHook(() => usePdf());

    await act(async () => {
      await result.current.applyReorderPages([0]);
    });

    expect(reorderPages).not.toHaveBeenCalled();
  });

  it("applies reorder and updates state", async () => {
    const { result } = renderHook(() => usePdf());
    const initial = new Uint8Array([9, 8, 7]).buffer;
    const reordered = new Uint8Array([7, 8, 9]);

    vi.mocked(reorderPages).mockResolvedValue(reordered);

    act(() => {
      result.current.loadPdf(initial);
    });

    await act(async () => {
      await result.current.applyReorderPages([0]);
    });

    await waitFor(() => {
      expect(reorderPages).toHaveBeenCalledTimes(1);
      expect(result.current.pdfData).toEqual(reordered);
      expect(result.current.refreshKey).toBe(2);
    });
  });

  it("applies merge and updates state", async () => {
    const { result } = renderHook(() => usePdf());
    const merged = new Uint8Array([1, 1, 1]);

    vi.mocked(mergePdfs).mockResolvedValue(merged);

    await act(async () => {
      await result.current.applyMergePdfs([new Uint8Array([5]).buffer, new Uint8Array([6]).buffer]);
    });

    await waitFor(() => {
      expect(mergePdfs).toHaveBeenCalledTimes(1);
      expect(result.current.pdfData).toEqual(merged);
      expect(result.current.refreshKey).toBe(1);
    });
  });

  it("applies remove page and updates state", async () => {
    const { result } = renderHook(() => usePdf());
    const initial = new Uint8Array([4, 4, 4]).buffer;
    const removed = new Uint8Array([4, 4]);

    vi.mocked(removePage).mockResolvedValue(removed);

    act(() => {
      result.current.loadPdf(initial);
    });

    await act(async () => {
      await result.current.applyRemovePage(0);
    });

    await waitFor(() => {
      expect(removePage).toHaveBeenCalledTimes(1);
      expect(result.current.pdfData).toEqual(removed);
      expect(result.current.refreshKey).toBe(2);
    });
  });
});
