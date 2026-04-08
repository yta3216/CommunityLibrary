import React from "react";
import { MemoryRouter } from "react-router-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import Register from "./Register";
import { registerUser } from "../../api/auth";
import { useNavigate } from "react-router-dom";

// replace registerUser API with a mock function to control its behavior during tests
jest.mock("../../api/auth", () => ({
  registerUser: jest.fn(),
}));

// mock useNavigate to test navigation without actually changing routes
jest.mock("react-router-dom", () => {
  // keep the real router helpers, but replace useNavigate with a mock
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

// test within this block are related to the Register component
describe("Register component", () => {
  const mockNavigate = jest.fn();
  const originalFileReader = global.FileReader;

  beforeEach(() => {
    // set up mocks before each test so every test starts from a clean state
    useNavigate.mockReturnValue(mockNavigate);
    global.FileReader = class {
      readAsDataURL() {
        this.result = "data:image/png;base64,ZmFrZS1pbWFnZQ==";
        if (this.onload) {
          this.onload();
        }
      }
    };
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    global.FileReader = originalFileReader;
  });

  const renderRegister = () => {
    // render Register inside MemoryRouter because the component uses routing
    return render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );
  };

  test("renders register form inputs and buttons", () => {
    renderRegister();

    // check that all required inputs and navigation controls are shown
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Register" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Back to Login" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  test("allows user to type in inputs and choose an image", async () => {
    renderRegister();

    // simulate typing text into the form fields
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "123456" },
    });

    const fileInput = document.querySelector('input[type="file"]');

    // simulate selecting an image file
    const file = new File(["fake image"], "avatar.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByLabelText("Username")).toHaveValue("john123");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("123456");
    expect(screen.getByLabelText("Confirm Password")).toHaveValue("123456");

    await waitFor(() => {
      expect(screen.getByAltText("Profile preview")).toHaveAttribute(
        "src",
        "data:image/png;base64,ZmFrZS1pbWFnZQ==",
      );
    });
  });

  test("submits registration data and redirects after success", async () => {
    registerUser.mockResolvedValueOnce({});

    renderRegister();

    // fill in the form before submitting it
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "123456" },
    });

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["fake image"], "avatar.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // wait for the preview state to update before submitting
    await waitFor(() => {
      expect(screen.getByAltText("Profile preview")).toHaveAttribute(
        "src",
        "data:image/png;base64,ZmFrZS1pbWFnZQ==",
      );
    });

    // click register - simulates submitting the form
    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    // if registration succeeds, the API call and success message should appear
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        username: "john123",
        email: "john@example.com",
        password: "123456",
        profileImageUrl: "data:image/png;base64,ZmFrZS1pbWFnZQ==",
      });
      expect(
        screen.getByText("Registration successful. Redirecting to login..."),
      ).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(900);
    });

    // after the timeout, the component should navigate to the login page
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
