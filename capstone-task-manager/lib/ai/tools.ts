import { tool } from "ai";
import { z } from "zod";

/**
 * Tool contract: scoreTaskPriority
 *
 * Input:  { title: string, description?: string }
 * Output: {
 *   title: string,
 *   urgency: "low" | "medium" | "high",
 *   score: number (0-100),
 *   estimatedMinutes: number,
 *   category: string,
 *   reasoning: string,
 * }
 *
 * Real (non-hallucinated) scoring logic: looks for urgency keywords and
 * rough effort signals in the text, rather than letting the model just
 * invent a number. Deterministic given the same input.
 */

const URGENT_WORDS = ["urgent", "asap", "today", "immediately", "now", "deadline"];
const SOON_WORDS = ["tomorrow", "this week", "soon"];
const BIG_TASK_WORDS = ["plan", "organize", "research", "build", "redesign", "move"];
const QUICK_WORDS = ["email", "call", "text", "reply", "quick", "check"];

function scoreText(text: string) {
    const lower = text.toLowerCase();

    const isUrgent = URGENT_WORDS.some((w) => lower.includes(w));
    const isSoon = SOON_WORDS.some((w) => lower.includes(w));
    const isBig = BIG_TASK_WORDS.some((w) => lower.includes(w));
    const isQuick = QUICK_WORDS.some((w) => lower.includes(w));

    let urgency: "low" | "medium" | "high" = "low";
    let score = 30;
    const reasons: string[] = [];

    if (isUrgent) {
        urgency = "high";
        score = 85;
        reasons.push("contains urgency language");
    } else if (isSoon) {
        urgency = "medium";
        score = 60;
        reasons.push("mentions a near-term timeframe");
    } else {
        reasons.push("no urgency language detected");
    }

    let estimatedMinutes = 30;
    let category = "General";

    if (isBig) {
        estimatedMinutes = 120;
        category = "Project";
        reasons.push("looks like a multi-step task");
    } else if (isQuick) {
        estimatedMinutes = 10;
        category = "Quick task";
        reasons.push("looks like a fast, single action");
    }

    return {
        urgency,
        score,
        estimatedMinutes,
        category,
        reasoning: reasons.join("; "),
    };
}

export const scoreTaskPriority = tool({
    description:
        "Analyze a task's title and optional description to estimate its urgency, " +
        "priority score, rough time estimate, and category. Call this whenever the " +
        "user describes a task they want prioritized or scored.",
    inputSchema: z.object({
        title: z.string().describe("The task title, short and specific."),
        description: z
            .string()
            .optional()
            .describe("Optional extra detail about the task."),
    }),
    execute: async ({ title, description }) => {
        // TEMPORARY: force an error to test the error state UI
        // throw new Error("Simulated scoring failure for testing");

        const combined = `${title} ${description ?? ""}`;
        const result = scoreText(combined);
        return {
            title,
            ...result,
        };
    },
});