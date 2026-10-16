// server/src/routes/__tests__/posts.integration.test.js
//
// The sandwich strategy in miniature: real Routes, real Services, real
// Repositories, real (isolated) test database — no mocks anywhere.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";

beforeEach(async () => {
  await resetDatabase();
});

// Without this, Jest reports an open handle and waits out its ~10s
// timeout before exiting, because app.js's import chain creates a real
// PrismaClient connection pool that nothing ever closes.
afterAll(async () => {
  await prisma.$disconnect();
});

test("full flow: register, publish, and browse (US-01, US-03, US-04)", async () => {
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: "alice@example.com", displayName: "Alice", password: "correcthorse" });

  expect(registerRes.status).toBe(201);
  const { user, accessToken } = registerRes.body;

  const publishRes = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${accessToken}`)
    .send({ authorId: user.id, title: "Hello, Inkwell", body: "My first real post." });

  expect(publishRes.status).toBe(201);

  const feedRes = await request(app).get("/api/posts?page=1");

  expect(feedRes.status).toBe(200);
  expect(feedRes.body.posts).toHaveLength(1);
  expect(feedRes.body.posts[0].title).toBe("Hello, Inkwell");
});

test("registering with a duplicate email fails end to end (US-01 extension 3a)", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ email: "alice@example.com", displayName: "Alice", password: "correcthorse" });

  const secondAttempt = await request(app)
    .post("/api/auth/register")
    .send({ email: "alice@example.com", displayName: "Alice Two", password: "correcthorse" });

  expect(secondAttempt.status).toBe(400);
  expect(secondAttempt.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
});

// Exercise 1: registration and login working together, end to end.
test("a registered user can then log in with the same credentials (US-01 + US-02)", async () => {
  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ email: "bob@example.com", displayName: "Bob", password: "correcthorse" });

  expect(registerRes.status).toBe(201);

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "bob@example.com", password: "correcthorse" });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body.user.id).toBe(registerRes.body.user.id);
  expect(loginRes.body.accessToken).toBeDefined();
  // Lecture 8's defect D-002: login must not leak the password hash.
  expect(loginRes.body.user.passwordHash).toBeUndefined();
});
