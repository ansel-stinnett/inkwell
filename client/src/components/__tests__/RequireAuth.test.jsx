// client/src/components/__tests__/RequireAuth.test.jsx

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { test, expect, beforeEach } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { RequireAuth } from "../RequireAuth";
import { saveToken, saveUser } from "../../lib/auth";

beforeEach(() => {
  localStorage.clear();
});

function renderAtWrite() {
  render(
    <MemoryRouter initialEntries={["/write"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route
            path="/write"
            element={
              <RequireAuth>
                <p>Editor page</p>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

test("sends a signed-out visitor to /login", () => {
  renderAtWrite();

  expect(screen.getByText("Login page")).toBeInTheDocument();
  expect(screen.queryByText("Editor page")).not.toBeInTheDocument();
});

test("renders the protected page when signed in", () => {
  saveToken("access-123");
  saveUser({ id: "u1", displayName: "Alice" });
  renderAtWrite();

  expect(screen.getByText("Editor page")).toBeInTheDocument();
});
