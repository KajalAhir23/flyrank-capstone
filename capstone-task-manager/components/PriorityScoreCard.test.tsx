import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PriorityScoreCard, type ScoreResult } from "./PriorityScoreCard";

function makeResult(overrides: Partial<ScoreResult> = {}): ScoreResult {
  return {
    title: "Reply to landlord's email",
    urgency: "high",
    score: 85,
    estimatedMinutes: 10,
    category: "Quick task",
    reasoning: "contains urgency language; looks like a fast, single action",
    ...overrides,
  };
}

describe("PriorityScoreCard", () => {
  it("renders the task title", () => {
    render(<PriorityScoreCard result={makeResult()} />);
    expect(
      screen.getByText("Reply to landlord's email")
    ).toBeInTheDocument();
  });

  it("renders the numeric score", () => {
    render(<PriorityScoreCard result={makeResult({ score: 42 })} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders the urgency level and category", () => {
    render(
      <PriorityScoreCard
        result={makeResult({ urgency: "medium", category: "Project" })}
      />
    );
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText(/project/i)).toBeInTheDocument();
  });

  it("renders the estimated time", () => {
    render(
      <PriorityScoreCard result={makeResult({ estimatedMinutes: 120 })} />
    );
    expect(screen.getByText(/120 min/)).toBeInTheDocument();
  });

  it("renders the reasoning text", () => {
    render(
      <PriorityScoreCard
        result={makeResult({ reasoning: "custom reasoning here" })}
      />
    );
    expect(screen.getByText("custom reasoning here")).toBeInTheDocument();
  });

  it("renders correctly for each urgency level without crashing", () => {
    const urgencies: ScoreResult["urgency"][] = ["low", "medium", "high"];
    urgencies.forEach((urgency) => {
      const { unmount } = render(
        <PriorityScoreCard result={makeResult({ urgency })} />
      );
      expect(screen.getByText(urgency)).toBeInTheDocument();
      unmount();
    });
  });
});