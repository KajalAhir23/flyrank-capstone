import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SettingsForm from "./SettingsForm";
import {
  sampleSavedSettings,
  type SettingsFormValues,
} from "../../lib/validation/settingsSchema";

function renderSettingsForm(
  props: {
    initialValues?: SettingsFormValues;
    onSave?: (values: SettingsFormValues) => void | Promise<void>;
  } = {},
) {
  const onSave = props.onSave ?? vi.fn();

  render(
    <SettingsForm
      initialValues={props.initialValues ?? sampleSavedSettings}
      onSave={onSave}
    />,
  );

  return { onSave, user: userEvent.setup() };
}

function getSaveButton() {
  return screen.getByRole("button", { name: "Save" });
}

function getResetButton() {
  return screen.getByRole("button", { name: "Reset" });
}

describe("SettingsForm", () => {
  it("submits successfully with valid data", async () => {
    const { onSave, user } = renderSettingsForm();

    expect(getSaveButton()).toBeDisabled();

    await user.clear(screen.getByLabelText("Display name"));
    await user.type(screen.getByLabelText("Display name"), "Alex Smith");
    await user.clear(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "alex@example.com");

    await waitFor(() => {
      expect(getSaveButton()).toBeEnabled();
    });

    await user.click(getSaveButton());

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: "Alex Smith",
          email: "alex@example.com",
        }),
      );
    });

    expect(getSaveButton()).toBeDisabled();
  });

  it("shows an error when display name is empty", async () => {
    const { user } = renderSettingsForm();

    const displayNameInput = screen.getByLabelText("Display name");
    await user.clear(displayNameInput);

    expect(await screen.findByText("Display name is required")).toBeInTheDocument();
    expect(displayNameInput).toHaveAttribute("aria-invalid", "true");
    expect(displayNameInput).toHaveAttribute("aria-describedby", "displayName-error");
    expect(getSaveButton()).toBeDisabled();
  });

  it("shows an error when display name is too short", async () => {
    const { user } = renderSettingsForm();

    const displayNameInput = screen.getByLabelText("Display name");
    await user.clear(displayNameInput);
    await user.type(displayNameInput, "A");

    expect(
      await screen.findByText("Display name must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(getSaveButton()).toBeDisabled();
  });

  it("shows an error when email is empty", async () => {
    const { user } = renderSettingsForm();

    const emailInput = screen.getByLabelText("Email");
    await user.clear(emailInput);

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
    expect(getSaveButton()).toBeDisabled();
  });

  it("shows an error for an invalid email", async () => {
    const { user } = renderSettingsForm();

    const emailInput = screen.getByLabelText("Email");
    await user.clear(emailInput);
    await user.type(emailInput, "not-an-email");

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(getSaveButton()).toBeDisabled();
  });

  it("shows an error for an invalid website URL", async () => {
    const { user } = renderSettingsForm();

    const websiteInput = screen.getByLabelText("Website");
    await user.clear(websiteInput);
    await user.type(websiteInput, "not-a-url");

    expect(await screen.findByText("Please enter a valid URL")).toBeInTheDocument();
    expect(websiteInput).toHaveAttribute("aria-invalid", "true");
    expect(websiteInput).toHaveAttribute("aria-describedby", "website-error");
    expect(getSaveButton()).toBeDisabled();
  });

  it("shows an error when bio exceeds 500 characters", async () => {
    renderSettingsForm();

    const bioInput = screen.getByLabelText("Bio");
    fireEvent.change(bioInput, { target: { value: "a".repeat(501) } });

    expect(
      await screen.findByText("Bio must be at most 500 characters"),
    ).toBeInTheDocument();
    expect(getSaveButton()).toBeDisabled();
  });

  it("keeps save disabled until the form is valid and dirty", async () => {
    const { user } = renderSettingsForm();

    expect(getSaveButton()).toBeDisabled();

    const displayNameInput = screen.getByLabelText("Display name");
    await user.clear(displayNameInput);
    await user.type(displayNameInput, "A");

    await waitFor(() => {
      expect(getSaveButton()).toBeDisabled();
    });

    await user.clear(displayNameInput);
    await user.type(displayNameInput, "Alex Smith");

    await waitFor(() => {
      expect(getSaveButton()).toBeEnabled();
    });
  });

  it("restores last saved values when reset is clicked", async () => {
    const { user } = renderSettingsForm();

    const displayNameInput = screen.getByLabelText("Display name");
    const emailInput = screen.getByLabelText("Email");

    await user.clear(displayNameInput);
    await user.type(displayNameInput, "Changed Name");
    await user.clear(emailInput);
    await user.type(emailInput, "changed@example.com");

    expect(getSaveButton()).toBeEnabled();
    expect(getResetButton()).toBeEnabled();

    await user.click(getResetButton());

    expect(displayNameInput).toHaveValue(sampleSavedSettings.displayName);
    expect(emailInput).toHaveValue(sampleSavedSettings.email);
    expect(getSaveButton()).toBeDisabled();
    expect(getResetButton()).toBeDisabled();
  });
});
