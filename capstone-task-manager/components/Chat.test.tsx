import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Chat } from "./Chat";

// Mock the AI SDK's useChat hook so tests never call the real API.
// We control exactly what it returns per test to simulate each state.
const mockUseChat = vi.fn();

vi.mock("@ai-sdk/react", () => ({
  useChat: () => mockUseChat(),
}));

// Mock the task store so tests don't touch real localStorage.
vi.mock("@/lib/tasks", () => ({
  addTask: vi.fn(),
}));

function baseChatReturn(overrides = {}) {
  return {
    messages: [],
    sendMessage: vi.fn(),
    status: "ready",
    stop: vi.fn(),
    addToolOutput: vi.fn(),
    error: undefined,
    regenerate: vi.fn(),
    ...overrides,
  };
}

describe("Chat", () => {
  beforeEach(() => {
    mockUseChat.mockReset();
  });

  it("shows the empty state with clickable examples when there are no messages", () => {
    mockUseChat.mockReturnValue(baseChatReturn());
    render(<Chat />);

    expect(
      screen.getByText(/what are you working on/i)
    ).toBeInTheDocument();

    // At least one example prompt button should be present and clickable.
    const exampleButtons = screen.getAllByRole("button", {
      name: /moving apartments|landlord|birthday party/i,
    });
    expect(exampleButtons.length).toBeGreaterThan(0);
  });

  it("clicking an empty-state example fills the input", async () => {
    mockUseChat.mockReturnValue(baseChatReturn());
    render(<Chat />);

    const user = userEvent.setup();
    const example = screen.getByRole("button", {
      name: /moving apartments next month/i,
    });
    await user.click(example);

    const input = screen.getByPlaceholderText(/describe something/i);
    expect(input).toHaveValue("I'm moving apartments next month");
  });

  it("shows the thinking indicator while a message is pending (submitted status)", () => {
    mockUseChat.mockReturnValue(
      baseChatReturn({
        status: "submitted",
        messages: [
          {
            id: "1",
            role: "user",
            parts: [{ type: "text", text: "hi" }],
          },
        ],
      })
    );
    render(<Chat />);

    // The Send button becomes a Stop button while pending/streaming.
    expect(
      screen.getByRole("button", { name: /stop generating/i })
    ).toBeInTheDocument();
  });

  it("renders streamed assistant text as it arrives", () => {
    mockUseChat.mockReturnValue(
      baseChatReturn({
        status: "streaming",
        messages: [
          {
            id: "1",
            role: "user",
            parts: [{ type: "text", text: "hello" }],
          },
          {
            id: "2",
            role: "assistant",
            parts: [{ type: "text", text: "Hi there, how can I help?" }],
          },
        ],
      })
    );
    render(<Chat />);

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(
      screen.getByText("Hi there, how can I help?")
    ).toBeInTheDocument();
  });

  it("shows a designed error card with a retry button when the request fails", () => {
    mockUseChat.mockReturnValue(
      baseChatReturn({
        error: new Error("Failed to fetch"),
      })
    );
    render(<Chat />);

    expect(
      screen.getByText(/message failed to send/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retry this message/i })
    ).toBeInTheDocument();
  });

  it("calls regenerate when the retry button is clicked", async () => {
    const regenerate = vi.fn();
    mockUseChat.mockReturnValue(
      baseChatReturn({
        error: new Error("Network error"),
        regenerate,
      })
    );
    render(<Chat />);

    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: /retry this message/i })
    );

    expect(regenerate).toHaveBeenCalledTimes(1);
  });

  it("disables the send button until the input has text", () => {
    mockUseChat.mockReturnValue(baseChatReturn());
    render(<Chat />);

    const sendButton = screen.getByRole("button", { name: /send message/i });
    expect(sendButton).toBeDisabled();
  });
});