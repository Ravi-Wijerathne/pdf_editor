import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PageControls from "./PageControls";

describe("PageControls", () => {
  it("renders navigation controls", () => {
    render(<PageControls />);

    expect(screen.getByText("Previous Page")).toBeDefined();
    expect(screen.getByText("Page 1 of 1")).toBeDefined();
    expect(screen.getByText("Next Page")).toBeDefined();
  });
});
