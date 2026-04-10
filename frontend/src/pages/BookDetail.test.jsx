import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookDetail from "./BookDetail";
import { useBookDetail } from "../hooks/useBookDetail";
import { useAuth } from "../context/AuthContext";

jest.mock("../hooks/useBookDetail", () => ({
  useBookDetail: jest.fn(),
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../components/Navbar/Navbar", () => () => <div>Navbar</div>);
jest.mock("../components/Sidebar/Sidebar", () => () => <div>Sidebar</div>);
jest.mock("../components/Breadcrumbs/Breadcrumbs", () => () => (
  <div>Breadcrumbs</div>
));
jest.mock("../components/BookDetail/BookCover", () => () => (
  <div>BookCover</div>
));
jest.mock("../components/BookDetail/BookTags", () => () => (
  <div>BookActions</div>
));
jest.mock("../components/BookDetail/ReviewSection", () => () => (
  <div>ReviewSection</div>
));
jest.mock("../components/Messages/MessageComposer", () => () => (
  <div>MessageComposer</div>
));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    useSearchParams: () => [new URLSearchParams("id=book-1")],
  };
});

describe("BookDetail page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: { _id: "user-1" } });
  });

  test("shows book details when fetch succeeds", () => {
    useBookDetail.mockReturnValue({
      book: {
        id: "book-1",
        title: "Clean Code",
        author: "Robert C. Martin",
        ownerName: "alice",
        description: "A handbook of agile software craftsmanship.",
        genres: ["Software"],
        status: "available",
        canBorrow: true,
        showBorrowButton: true,
        showViewConversationButton: false,
        canReturn: false,
        actionHintText: "",
        ownerId: "owner-1",
      },
      updateBook: jest.fn(),
      isLoading: false,
      errorMessage: "",
    });

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <BookDetail />
      </MemoryRouter>,
    );

    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getByText("Robert C. Martin")).toBeInTheDocument();
    expect(screen.getByText("Owned by: alice")).toBeInTheDocument();
  });

  test("shows error fallback when fetch fails", () => {
    useBookDetail.mockReturnValue({
      book: null,
      updateBook: jest.fn(),
      isLoading: false,
      errorMessage: "This listing has been removed.",
    });

    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <BookDetail />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("This listing has been removed."),
    ).toBeInTheDocument();
  });
});
