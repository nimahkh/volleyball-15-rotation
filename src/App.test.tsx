import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("App", () => {
  it("renders the lineup form before players are entered", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /volleyball 5-1 rotation helper/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/outside hitter 1 \(oh1\)/i),
    ).toHaveValue("OH1");
  });

  it("submits the default lineup and shows the court controls", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /start/i }));

    expect(
      await screen.findByRole("button", { name: /receive/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /serve/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /rotation position/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === "Rotation 1"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("cycles through rotations after the lineup is submitted", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /start/i }));
    await screen.findByText((_, element) => element?.textContent === "Rotation 1");

    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(
      screen.getByText((_, element) => element?.textContent === "Rotation 2"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /prev/i }));
    expect(
      screen.getByText((_, element) => element?.textContent === "Rotation 1"),
    ).toBeInTheDocument();
  });
});
