import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TextEditModal from "./TextEditModal";

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  onDelete: vi.fn(),
  initialText: "Original",
  position: { x: 10, y: 20 },
};

describe("TextEditModal", () => {
  it("does not render when closed", () => {
    render(<TextEditModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText("Edit Text")).toBeNull();
  });

  it("saves edited text and closes", () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(<TextEditModal {...baseProps} onSave={onSave} onClose={onClose} />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Updated" },
    });
    fireEvent.click(screen.getByText("Save"));

    expect(onSave).toHaveBeenCalledWith("Updated");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("deletes text and closes", () => {
    const onDelete = vi.fn();
    const onClose = vi.fn();

    render(<TextEditModal {...baseProps} onDelete={onDelete} onClose={onClose} />);

    fireEvent.click(screen.getByText("Delete"));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when backdrop is clicked", () => {
    const onClose = vi.fn();

    const { container } = render(<TextEditModal {...baseProps} onClose={onClose} />);
    const backdrop = container.firstChild as HTMLElement;

    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
