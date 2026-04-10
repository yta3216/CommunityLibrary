import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BookForm from "./BookForm";

describe("BookForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("submits trimmed payload when all fields are valid", async () => {
    const onSubmit = jest.fn().mockResolvedValue({});

    render(<BookForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("ISBN"), {
      target: { value: " 978410100001 " },
    });
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: " Clean Code " },
    });
    fireEvent.change(screen.getByLabelText("Author"), {
      target: { value: " Robert C. Martin " },
    });
    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: " Software " },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: " Practical guide for writing better code. " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        isbn: "978410100001",
        title: "Clean Code",
        author: "Robert C. Martin",
        genre: "Software",
        description: "Practical guide for writing better code.",
      });
    });
  });

  test("shows validation error and does not submit when required field is missing", async () => {
    const onSubmit = jest.fn().mockResolvedValue({});

    render(<BookForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("ISBN"), {
      target: { value: "978410100001" },
    });
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Clean Code" },
    });
    fireEvent.change(screen.getByLabelText("Author"), {
      target: { value: "Robert C. Martin" },
    });
    fireEvent.change(screen.getByLabelText("Genre"), {
      target: { value: "Software" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByText("All fields are required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
