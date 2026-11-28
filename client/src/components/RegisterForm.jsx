// client/src/components/RegisterForm.jsx
//
// Calls POST /api/auth/register from the client for the first time, so
// new users no longer need curl to get an account. Built the same way as
// LoginForm: accessible labeled fields and a single status value. A
// successful registration signs the user in.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

const STATES = { IDLE: "idle", SUBMITTING: "submitting" };

// Mirrors MIN_PASSWORD_LENGTH in server/src/services/auth.service.js. The
// server still enforces it; checking here saves a request (and a slot in
// the auth rate limit) for an obviously short password.
const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const [status, setStatus] = useState(STATES.IDLE);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setStatus(STATES.SUBMITTING);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setErrorMessage(error.message);
        setStatus(STATES.IDLE);
        return;
      }

      const { accessToken, user } = await response.json();
      signIn(accessToken, user);
      navigate("/");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus(STATES.IDLE);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register</h1>
      <form className="space-y-4" onSubmit={handleRegister}>
      <div>
        <label htmlFor="register-display-name" className="block text-sm font-medium text-gray-700">
          Display name
        </label>
        <input
          id="register-display-name"
          type="text"
          autoComplete="nickname"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          aria-describedby={errorMessage ? "register-error" : undefined}
        />
      </div>

      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm"
          aria-describedby="register-password-hint"
        />
        <p id="register-password-hint" className="mt-1 text-sm text-gray-500">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>

      {errorMessage && (
        <p id="register-error" role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === STATES.SUBMITTING}
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {status === STATES.SUBMITTING ? "Registering…" : "Register"}
      </button>
      </form>
    </div>
  );
}
