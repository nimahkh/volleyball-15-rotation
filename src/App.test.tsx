import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { encodeSharedPayload } from "./components/coach/drillSharing";

describe("App", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
  });

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

  it("opens the coach board as a separate page", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /open coach board/i }));
    expect(window.location.pathname).toBe("/coach");

    expect(
      screen.getByRole("heading", { name: /strategy court/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(/coach drill/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/setup/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add step/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play drill/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/coach strategy volleyball court/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hide opponent/i })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /back to rotation helper/i }),
    );
    expect(window.location.pathname).toBe("/");

    expect(
      screen.getByRole("heading", { name: /volleyball 5-1 rotation helper/i }),
    ).toBeInTheDocument();
  });

  it("opens the support modal from the main page", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /support the app/i }));

    expect(
      screen.getByRole("heading", { name: /keep the court free/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open bunq/i }),
    ).toBeInTheDocument();
  });

  it("prompts for support after repeated meaningful use", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /start/i }));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /play/i }));
    await user.click(screen.getByRole("button", { name: /open coach board/i }));

    expect(
      await screen.findByRole("heading", { name: /keep the court free/i }),
    ).toBeInTheDocument();
  });

  it("opens a shared drill link directly on the coach route", () => {
    const shared = encodeSharedPayload({
      version: 1,
      title: "Shared Drill",
      scenario: "serve-receive",
      audience: "team",
      steps: [
        {
          id: "step-1",
          title: "Setup",
          instruction: "Shared instruction",
          chips: [],
          drawLines: [],
        },
      ],
    });
    window.history.replaceState({}, "", `/coach?drill=${shared}`);

    render(<App />);

    expect(
      screen.getByRole("heading", { name: /strategy court/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("Shared Drill")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Shared instruction")).toBeInTheDocument();
  });

  it("loads a shared drill even if pasted text is appended after the encoded payload", () => {
    const shared = encodeSharedPayload({
      version: 1,
      title: "Pasted Shared Drill",
      scenario: "serve-receive",
      audience: "team",
      steps: [
        {
          id: "step-1",
          title: "Setup",
          instruction: "Pasted instruction",
          chips: [],
          drawLines: [],
        },
      ],
    });
    const malformed = `${shared} Open drill: Pasted Shared Drill`;
    window.history.replaceState({}, "", `/coach?drill=${encodeURIComponent(malformed)}`);

    render(<App />);

    expect(screen.getByDisplayValue("Pasted Shared Drill")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Pasted instruction")).toBeInTheDocument();
  });

  it("updates the coach board when a new shared drill url is loaded after mount", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /open coach board/i }));
    expect(screen.getByDisplayValue(/coach drill/i)).toBeInTheDocument();

    const shared = encodeSharedPayload({
      version: 1,
      title: "Late Shared Drill",
      scenario: "transition",
      audience: "unit",
      steps: [
        {
          id: "shared-step-1",
          title: "Read",
          instruction: "Late-loaded instruction",
          chips: [],
          drawLines: [],
        },
      ],
    });

    await act(async () => {
      window.history.pushState({}, "", `/coach?drill=${shared}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(await screen.findByDisplayValue("Late Shared Drill")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Late-loaded instruction")).toBeInTheDocument();
  });

  it("plays a preset drill in fullscreen cinema mode", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: /open coach board/i }));
    await user.click(screen.getByRole("button", { name: /presets/i }));
    await user.click(screen.getByRole("button", { name: /3-passer w platform angles/i }));
    expect(screen.queryByText(/drill replay/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /play fullscreen drill/i }));

    expect(await screen.findByText(/drill replay/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to board/i })).toBeInTheDocument();
  });
});
