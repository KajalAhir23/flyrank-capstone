import { test, expect } from "@playwright/test";

test("primary flow: user can send a message and see a streamed reply", async ({
  page,
}) => {
  // Intercept the chat API call and return a fake streamed response,
  // so this test never hits the real Groq API.
  await page.route("**/api/chat", async (route) => {
    const fakeStream =
      `data: {"type":"text-start","id":"1"}\n\n` +
      `data: {"type":"text-delta","id":"1","delta":"Hello! "}\n\n` +
      `data: {"type":"text-delta","id":"1","delta":"How can I help?"}\n\n` +
      `data: {"type":"text-end","id":"1"}\n\n` +
      `data: [DONE]\n\n`;

    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: fakeStream,
    });
  });

  await page.goto("/chat");

  // Empty state should be visible on first load.
  await expect(
    page.getByText(/what are you working on/i)
  ).toBeVisible();

  // Type and send a message.
  // Type and send a message.
  const input = page.getByPlaceholder(/describe something you need to do/i);
  await input.click();
  await input.fill("Test message for e2e");
  await expect(input).toHaveValue("Test message for e2e");

  const sendButton = page.getByRole("button", { name: /send message/i });
  await expect(sendButton).toBeEnabled();
  await sendButton.click();

  // The user's own message should appear immediately.
  await expect(page.getByText("Test message for e2e")).toBeVisible();

  // The assistant's reply should eventually appear (streamed in).
  await expect(page.getByText(/how can i help/i)).toBeVisible({
    timeout: 10000,
  });

  // Input should be re-enabled and empty, ready for the next message.
  await expect(input).toBeEnabled();
  await expect(input).toHaveValue("");
});