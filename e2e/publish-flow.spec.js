// e2e/publish-flow.spec.js
//
// The same user journey is run once per viewport, not just once at an
// arbitrary default size.
//
// Registration has no client-side UI anywhere in Inkwell (only LoginForm
// exists) -- every account so far has been created via curl. This test
// creates its account the same way, via a direct API call, then drives
// the real UI for the login/publish journey.

import { test, expect, devices } from "@playwright/test";

const viewports = [
  { name: "mobile", viewport: devices["iPhone 13"].viewport },
  { name: "tablet", viewport: devices["iPad Mini"].viewport },
  { name: "desktop", viewport: { width: 1280, height: 800 } },
];

for (const vp of viewports) {
  test.describe(`publish flow — ${vp.name}`, () => {
    test.use({ viewport: vp.viewport });

    test("a registered user can log in and publish a post", async ({ page, request }) => {
      // A fixed email/title collides across repeated runs against the same
      // dev database (no isolated e2e database exists) -- register silently
      // fails on a duplicate but login still succeeds against the stale
      // account, and re-running accumulates duplicate posts until
      // Playwright's strict-mode element matching breaks. A per-run suffix
      // sidesteps it.
      const runId = Date.now();
      const email = `e2e-${vp.name}-${runId}@example.com`;
      const title = `Hello from ${vp.name} (${runId})`;

      const registerRes = await request.post("http://localhost:4000/api/auth/register", {
        data: { email, displayName: "E2E Tester", password: "correcthorse" },
      });
      expect(registerRes.ok()).toBe(true);

      await page.goto("http://localhost:5173/login");

      // Real interaction, not simulated events — Playwright drives an
      // actual browser, so this exercises real focus order, real
      // touch/click handling, and real CSS layout.
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill("correcthorse");
      await page.getByRole("button", { name: "Log In" }).click();

      await expect(page).toHaveURL("http://localhost:5173/");

      await page.getByRole("link", { name: "Write" }).click();
      await page.getByLabel("Title").fill(title);
      await page.getByLabel("Body").fill("Published end to end.");
      await page.getByRole("button", { name: "Publish" }).click();

      // A bare getByText() here passes even when publishing fails
      // server-side, because it matches the leftover value still sitting in
      // the unsubmitted input -- the page never navigates away on failure,
      // so the typed text is still technically visible. Asserting the
      // navigation first, then scoping the text check to a real post
      // heading, makes this fail the way it should when publishing breaks.
      await expect(page).toHaveURL("http://localhost:5173/");

      await expect(page.getByRole("heading", { name: title })).toBeVisible();
    });
  });
}
