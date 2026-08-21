import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NewTaskPage from "./page";

// Mock Next.js navigation so tests don't need a real router.
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock the task store so this test never touches real localStorage.
const mockAddTask = vi.fn();
vi.mock("@/lib/tasks", () => ({
  addTask: (title: string) => mockAddTask(title),
}));

describe("NewTaskPage", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockAddTask.mockReset();
  });

  it("renders a text input and a disabled submit button initially", () => {
    render(<NewTaskPage />);

    expect(
      screen.getByPlaceholderText(/what do you need to do/i)
    ).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: /add task/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables the submit button once text is entered", async () => {
    render(<NewTaskPage />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/what do you need to do/i);
    await user.type(input, "Buy groceries");

    const submitButton = screen.getByRole("button", { name: /add task/i });
    expect(submitButton).toBeEnabled();
  });

  it("does not submit when the input is empty or only whitespace", async () => {
    render(<NewTaskPage />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/what do you need to do/i);
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(mockAddTask).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("adds the task and redirects to /tasks on valid submit", async () => {
    render(<NewTaskPage />);
    const user = userEvent.setup();

    const input = screen.getByPlaceholderText(/what do you need to do/i);
    await user.type(input, "Buy groceries");
    await user.click(screen.getByRole("button", { name: /add task/i }));

    expect(mockAddTask).toHaveBeenCalledWith("Buy groceries");
    expect(mockPush).toHaveBeenCalledWith("/tasks");
  });
});