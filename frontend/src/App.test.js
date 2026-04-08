import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "recharts",
  () => {
    const MockComponent = () => null;
    return new Proxy(
      {},
      {
        get: () => MockComponent,
      },
    );
  },
  { virtual: true },
);

test("renders public home headings", () => {
  render(<App />);
  expect(screen.getByText("Most Popular")).toBeInTheDocument();
  expect(screen.getByText("New Additions")).toBeInTheDocument();
});
