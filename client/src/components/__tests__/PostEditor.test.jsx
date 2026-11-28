// client/src/components/__tests__/PostEditor.test.jsx
//
// A component integration test: renders PostEditor for real, simulates real
// user interaction, and mocks only the network boundary (fetch) — everything
// else (React state, event handlers, rendering) is real.
import "@testing-library/jest-dom/vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { vi, test, expect, beforeEach } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { PostEditor } from "../PostEditor";
import { getToken, getUser, saveToken, saveUser } from "../../lib/auth";

beforeEach(() => {
  localStorage.clear();
  globalThis.fetch = vi.fn();
});

// PostEditor reads and clears the session through useAuth(), so it needs
// the real AuthProvider around it.
function Providers({ children }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

function renderSignedInEditor() {
  saveToken("access-123");
  saveUser({ id: "u1", displayName: "Alice" });
  render(
    <MemoryRouter initialEntries={["/write"]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>Feed page</p>} />
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/write" element={<PostEditor />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

async function publish(title, body) {
  await userEvent.type(screen.getByLabelText(/title/i), title);
  await userEvent.type(screen.getByLabelText(/body/i), body);
  await userEvent.click(screen.getByRole("button", { name: /publish/i }));
}

test("shows an error message anchored to the form when publish fails", async () => {
  globalThis.fetch.mockResolvedValue({
    ok: false,
    json: async () => ({ error: { message: "Title is required." } }),
  });

  render(<PostEditor />, { wrapper: Providers });

  await userEvent.type(screen.getByLabelText(/body/i), "Some content");
  await userEvent.click(screen.getByRole("button", { name: /publish/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Title is required.");
});

test("sends only the title and body, never an authorId", async () => {
  globalThis.fetch.mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: "p1" }) });
  renderSignedInEditor();

  await publish("Hello", "World");

  expect(await screen.findByText("Feed page")).toBeInTheDocument();
  const [url, options] = globalThis.fetch.mock.calls[0];
  expect(url).toBe("/api/posts");
  expect(options.headers.Authorization).toBe("Bearer access-123");
  expect(JSON.parse(options.body)).toEqual({ title: "Hello", body: "World" });
});

test("a 401 from the server signs the user out and goes to /login", async () => {
  globalThis.fetch.mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ error: { code: "UNAUTHENTICATED", message: "Invalid or expired token." } }),
  });
  renderSignedInEditor();

  await publish("Hello", "World");

  expect(await screen.findByText("Login page")).toBeInTheDocument();
  expect(getToken()).toBeNull();
  expect(getUser()).toBeNull();
});
