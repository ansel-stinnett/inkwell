// client/src/components/__tests__/NavBar.test.jsx

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { test, expect, beforeEach } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { NavBar } from "../NavBar";
import { getToken, getUser, saveToken, saveUser } from "../../lib/auth";

beforeEach(() => {
  localStorage.clear();
});

function renderNavBar() {
  render(
    <MemoryRouter>
      <AuthProvider>
        <NavBar />
      </AuthProvider>
    </MemoryRouter>
  );
}

function signInAsAlice() {
  saveToken("access-123");
  saveUser({ id: "u1", displayName: "Alice" });
}

test("shows Log in and Register, and no Write link, when signed out", () => {
  renderNavBar();

  expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Write" })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
});

test("shows Write, the user's name and Log out when signed in", () => {
  signInAsAlice();
  renderNavBar();

  expect(screen.getByRole("link", { name: "Write" })).toBeInTheDocument();
  expect(screen.getByText("Signed in as Alice")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
});

test("Log out clears the stored token and user and shows the signed-out links", async () => {
  signInAsAlice();
  renderNavBar();

  await userEvent.click(screen.getByRole("button", { name: "Log out" }));

  expect(getToken()).toBeNull();
  expect(getUser()).toBeNull();
  expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
  expect(screen.queryByText(/Signed in as/)).not.toBeInTheDocument();
});
