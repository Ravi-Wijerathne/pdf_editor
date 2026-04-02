import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PdfViewer from "./PdfViewer";

vi.mock("pdfjs-dist/build/pdf.worker.min.mjs?url", () => ({
  default: "mock-worker.js",
}));

const getDocumentMock = vi.fn();

vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: (...args: any[]) => getDocumentMock(...args),
}));

describe("PdfViewer", () => {
  const onPageCountChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  it("loads pdf and reports page count", async () => {
    const mockPage = {
      getViewport: vi.fn(({ scale }: { scale: number }) => ({ width: 400 * scale, height: 600 * scale })),
      render: vi.fn(() => ({ promise: Promise.resolve() })),
      getTextContent: vi.fn(async () => ({ items: [] })),
    };

    const mockPdfDoc = {
      numPages: 3,
      getPage: vi.fn(async () => mockPage),
    };

    getDocumentMock.mockReturnValue({ promise: Promise.resolve(mockPdfDoc) });

    render(
      <PdfViewer
        pdfData={new Uint8Array([1, 2, 3])}
        onPageCountChange={onPageCountChange}
      />,
    );

    await waitFor(() => {
      expect(onPageCountChange).toHaveBeenCalledWith(3);
      expect(screen.getByText(/Page\s*1\s*of\s*3/)).toBeDefined();
    });
  });

  it("navigates between pages with next and previous controls", async () => {
    const mockPage = {
      getViewport: vi.fn(({ scale }: { scale: number }) => ({ width: 400 * scale, height: 600 * scale })),
      render: vi.fn(() => ({ promise: Promise.resolve() })),
      getTextContent: vi.fn(async () => ({ items: [] })),
    };

    const mockPdfDoc = {
      numPages: 2,
      getPage: vi.fn(async () => mockPage),
    };

    getDocumentMock.mockReturnValue({ promise: Promise.resolve(mockPdfDoc) });

    render(
      <PdfViewer
        pdfData={new Uint8Array([1, 2, 3])}
        onPageCountChange={onPageCountChange}
      />,
    );

    await screen.findByText(/Page\s*1\s*of\s*2/);

    fireEvent.click(screen.getByText("Next"));
    await screen.findByText(/Page\s*2\s*of\s*2/);

    fireEvent.click(screen.getByText("Previous"));
    await screen.findByText(/Page\s*1\s*of\s*2/);
  });

  it("updates viewport scale when zoom controls are used", async () => {
    const viewportScales: number[] = [];

    const mockPage = {
      getViewport: vi.fn(({ scale }: { scale: number }) => {
        viewportScales.push(scale);
        return { width: 400 * scale, height: 600 * scale };
      }),
      render: vi.fn(() => ({ promise: Promise.resolve() })),
      getTextContent: vi.fn(async () => ({ items: [] })),
    };

    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn(async () => mockPage),
    };

    getDocumentMock.mockReturnValue({ promise: Promise.resolve(mockPdfDoc) });

    render(
      <PdfViewer
        pdfData={new Uint8Array([6, 7, 8])}
        onPageCountChange={onPageCountChange}
      />,
    );

    await waitFor(() => {
      expect(viewportScales.length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText("Zoom In"));
    fireEvent.click(screen.getByText("Zoom Out"));

    await waitFor(() => {
      expect(viewportScales.some((s) => Math.abs(s - 1.8) < 0.001)).toBe(true);
      expect(viewportScales.some((s) => Math.abs(s - 1.44) < 0.001)).toBe(true);
    });
  });

  it("shows error message when pdf load fails", async () => {
    getDocumentMock.mockReturnValue({ promise: Promise.reject(new Error("bad pdf")) });

    render(
      <PdfViewer
        pdfData={new Uint8Array([9, 9, 9])}
        onPageCountChange={onPageCountChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to load PDF/i)).toBeDefined();
    });
  });
});
