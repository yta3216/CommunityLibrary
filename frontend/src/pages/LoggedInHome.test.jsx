import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoggedInHome from "./LoggedInHome";
import useBooks from "../hooks/useBooks";

jest.mock("../hooks/useBooks", () => jest.fn());

jest.mock("../components/Navbar/Navbar", () => () => <div>Navbar</div>);
jest.mock("../components/Sidebar/Sidebar", () => () => <div>Sidebar</div>);
jest.mock("../components/BookForm", () => () => <div>BookForm</div>);

jest.mock("../components/BookCard/BookCard", () => (props) => (
  <div data-testid="book-card">{props.title}</div>
));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

describe("LoggedInHome page", () => {
  const createBook = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows books when fetch succeeds", () => {
    useBooks.mockReturnValue({
      availableBooks: [
        {
          _id: "book-1",
          title: "Refactoring",
          author: "Martin Fowler",
          owner: { username: "owner1" },
          genre: "Software",
          avgReviews: 4,
        },
      ],
      popularBooks: [],
      recentBooks: [],
      isLoading: false,
      errorMessage: null,
      createBook,
    });

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <LoggedInHome />
      </MemoryRouter>
    );

    expect(screen.getByText("All Available Books")).toBeInTheDocument();
    expect(screen.getByText("Refactoring")).toBeInTheDocument();
    expect(screen.queryByText("Loading books...")).not.toBeInTheDocument();
  });

  test("shows error message when book fetch fails", () => {
    useBooks.mockReturnValue({
      availableBooks: [],
      popularBooks: [],
      recentBooks: [],
      isLoading: false,
      errorMessage: "Could not load books right now.",
      createBook,
    });

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <LoggedInHome />
      </MemoryRouter>
    );

    expect(screen.getAllByText("Could not load books right now.").length).toBeGreaterThan(0);
  });
});
