// client/src/components/__tests__/RegisterForm.test.jsx
//
// Renders the real RegisterForm inside the real AuthProvider and router;
// only fetch (the network boundary) is mocked.

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, test, expect, beforeEach } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { RegisterForm } from "../RegisterForm";
import { getToken, getUser } from "../../lib/auth";

beforeEach(() => {
  localStorage.clear();
  globalThis.fetch = vi.fn();
});

function renderAtRegister() {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>Feed page</p>} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

async function fillForm({ displayName = "Alice", email = "alice@example.com", password = "correcthorse" } = {}) {
  await userEvent.type(screen.getByLabelText(/display name/i), displayName);
  await userEvent.type(screen.getByLabelText(/email/i), email);
  await userEvent.type(screen.getByLabelText(/^password/i), password);
  await userEvent.click(screen.getByRole("button", { name: /register/i }));
}

test("rejects a password shorter than 8 characters without calling the server", async () => {
  renderAtRegister();

  await fillForm({ password: "1234567" });

  expect(await screen.findByRole("alert")).toHaveTextContent("at least 8 characters");
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test("shows the server's error message on the form", async () => {
  globalThis.fetch.mockResolvedValue({
    ok: false,
    status: 400,
    json: async () => ({
      error: { code: "EMAIL_ALREADY_REGISTERED", message: "This email is already registered." },
    }),
  });
  renderAtRegister();

  await fillForm();

  expect(await screen.findByRole("alert")).toHaveTextContent("This email is already registered.");
  expect(getToken()).toBeNull();
});

test("a successful registration signs the user in and goes to the feed", async () => {
  const user = { id: "u1", displayName: "Alice" };
  globalThis.fetch.mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({ user, accessToken: "access-123", refreshToken: "refresh-123" }),
  });
  renderAtRegister();

  await fillForm();

  expect(await screen.findByText("Feed page")).toBeInTheDocument();
  const [url, options] = globalThis.fetch.mock.calls[0];
  expect(url).toBe("/api/auth/register");
  expect(JSON.parse(options.body)).toEqual({
    displayName: "Alice",
    email: "alice@example.com",
    password: "correcthorse",
  });
  expect(getToken()).toBe("access-123");
  expect(getUser()).toEqual(user);
});
