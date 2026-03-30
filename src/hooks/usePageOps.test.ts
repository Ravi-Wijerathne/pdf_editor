import { describe, expect, it, vi } from "vitest";
import { usePageOps } from "./usePageOps";

describe("usePageOps", () => {
  it("exposes expected operations", () => {
    const ops = usePageOps();

    expect(typeof ops.reorderPages).toBe("function");
    expect(typeof ops.mergePages).toBe("function");
    expect(typeof ops.splitPage).toBe("function");
  });

  it("logs operations with provided inputs", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const ops = usePageOps();

    ops.reorderPages([2, 0, 1]);
    ops.mergePages([1, 2]);
    ops.splitPage(4);

    expect(logSpy).toHaveBeenCalledWith("Reordering pages:", [2, 0, 1]);
    expect(logSpy).toHaveBeenCalledWith("Merging pages:", [1, 2]);
    expect(logSpy).toHaveBeenCalledWith("Splitting page:", 4);

    logSpy.mockRestore();
  });
});
