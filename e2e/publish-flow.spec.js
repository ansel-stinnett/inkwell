// e2e/publish-flow.spec.js
//
// The whole account journey, driven through the real UI once per viewport:
// register, publish, log out, log back in.
//
// Only two viewports, mobile and desktop. Each run makes two auth requests
// per viewport (register + login), and the auth rate limiter allows 5 per
// 10 minutes per IP and is ACTIVE when Playwright starts the dev server.
// Two viewports means 4 requests, under the limit. A third viewport would
// make 6, and the last login would get a 429. The limiter keeps its count
// in memory, so a second run within 10 minutes against an already-running
// dev server (reuseExistingServer) will also be throttled.

import { test, expect, devices } from "@playwright/test";

const viewports = [
  { name: "mobile", viewport: devices["iPhone 13"].viewport },
  { name: "desktop", viewport: { width: 1280, height: 800 } },
];

const PASSWORD = "correcthorse";
const DISPLAY_NAME = "E2E Tester";

for (const vp of viewports) {
  test.describe(`publish flow — ${vp.name}`, () => {
    test.use({ viewport: vp.viewport });

    test("a new user can register, publish, log out and log back in", async ({ page }) => {
      // There's no isolated e2e database, so a fixed email or title would
      // collide with earlier runs against the same dev database. A per-run
      // suffix avoids that.
      const runId = Date.now();
      const email = `e2e-${vp.name}-${runId}@example.com`;
      const title = `Hello from ${vp.name} (${runId})`;
      const nav = page.getByRole("navigation");

      // Register (auth request 1 of 2). Real interaction, not simulated
      // events: Playwright drives an actual browser, so this exercises real
      // focus order, touch/click handling and CSS layout.
      await page.goto("http://localhost:5173/register");
      await page.getByLabel("Display name").fill(DISPLAY_NAME);
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(PASSWORD);
      await page.getByRole("button", { name: "Register" }).click();

      await expect(page).toHaveURL("http://localhost:5173/");
      await expect(nav.getByText(`Signed in as ${DISPLAY_NAME}`)).toBeVisible();

      // Publish.
      await nav.getByRole("link", { name: "Write", exact: true }).click();
      await page.getByLabel("Title").fill(title);
      await page.getByLabel("Body").fill("Published end to end.");
      await page.getByRole("button", { name: "Publish" }).click();

      // A bare getByText() here would pass even when publishing fails
      // server-side, because it matches the text still sitting in the
      // unsubmitted input. The page never navigates away on failure.
      // Asserting the navigation first, then scoping to the real post's
      // heading, makes this fail the way it should when publishing breaks.
      await expect(page).toHaveURL("http://localhost:5173/");
      const postCard = page.getByRole("listitem").filter({
        has: page.getByRole("heading", { name: title }),
      });
      await expect(postCard).toBeVisible();
      await expect(postCard.getByText(`By ${DISPLAY_NAME}`)).toBeVisible();

      // Log out.
      await nav.getByRole("button", { name: "Log out" }).click();
      await expect(nav.getByRole("link", { name: "Log in" })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Write", exact: true })).toHaveCount(0);

      // Log back in (auth request 2 of 2).
      await nav.getByRole("link", { name: "Log in" }).click();
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(PASSWORD);
      await page.getByRole("button", { name: "Log In" }).click();

      await expect(page).toHaveURL("http://localhost:5173/");
      await expect(nav.getByText(`Signed in as ${DISPLAY_NAME}`)).toBeVisible();
    });
  });
}
