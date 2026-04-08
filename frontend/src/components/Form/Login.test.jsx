import React from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import { useAuth } from "../../context/AuthContext";
// current component is designed that screen transitions are handled using `useAuth.signIn`.

// mocked `useAuth` and `location.assign` to account for this difference.

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("Login component", () => {
  const mockSignIn = jest.fn();
  const mockAssign = jest.fn();
  const originalLocation = window.location;

  // runs before each test, sets up mockes for useAuth and windon.location.assign
  // this ensure that each test start with clean state and prevents side efects
  beforeEach(() => {
    useAuth.mockReturnValue({ signIn: mockSignIn });
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        assign: mockAssign,
      },
    });
  });

  // runs after each test, restores original window.location and clears all mocks
  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    jest.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
      // MemoryRouter is used to provide routing context for components
      // wrapping Login component with MemoryRouter let us test components that rely on routing features
    );
  };

  test("renders login form inputs and button", () => {
    renderLogin();

    expect(screen.getByLabelText("Email or Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Are you not a robot?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  });

  test("allows user to type in inputs", () => {
    renderLogin();
    //simulate typing text, React Testing Library
    fireEvent.change(screen.getByLabelText("Email or Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });

    expect(screen.getByLabelText("Email or Username")).toHaveValue("john123");
    expect(screen.getByLabelText("Password")).toHaveValue("123456");

    fireEvent.click(
      screen.getByRole("checkbox", { name: "Are you not a robot?" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Are you not a robot?" }),
    ).toBeChecked();
  });

  test("submits credentials and redirects after successful login", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { role: "member" } });

    renderLogin();
    //simulate Filling form
    fireEvent.change(screen.getByLabelText("Email or Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Are you not a robot?" }),
    );
    //click login - simulates submit button
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("john123", "123456");
      expect(mockAssign).toHaveBeenCalledWith("/home");
    });
  });
});
