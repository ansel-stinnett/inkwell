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

// Security regression test for the threat model's Critical row: Alice sends
// her own valid token but puts Bob's id in the body. The post must be
// attributed to Alice, not Bob.
test("a forged authorId in the request body is ignored (spoofing mitigation)", async () => {
  const alice = await request(app)
    .post("/api/auth/register")
    .send({ email: "alice@example.com", displayName: "Alice", password: "correcthorse" });

  const bob = await request(app)
    .post("/api/auth/register")
    .send({ email: "bob@example.com", displayName: "Bob", password: "correcthorse" });

  const res = await request(app)
    .post("/api/posts")
    .set("Authorization", `Bearer ${alice.body.accessToken}`)
    .send({ authorId: bob.body.user.id, title: "Forged", body: "Published as Bob?" });

  expect(res.status).toBe(201);
  expect(res.body.authorId).toBe(alice.body.user.id);
  expect(res.body.authorId).not.toBe(bob.body.user.id);
});

test("publishing without a token is rejected", async () => {
  const res = await request(app)
    .post("/api/posts")
    .send({ authorId: "whatever", title: "No token", body: "Should fail." });

  expect(res.status).toBe(401);
  expect(res.body.error.code).toBe("UNAUTHENTICATED");
});

// Exercise 1: the threat model's Denial of Service row. An oversized
// pageSize must be clamped, not honored.
test("an oversized pageSize is clamped to the maximum", async () => {
  const res = await request(app).get("/api/posts?page=1&pageSize=100000");

  expect(res.status).toBe(200);
  expect(res.body.pageSize).toBe(50);
});

test("a negative pageSize is clamped to the minimum", async () => {
  const res = await request(app).get("/api/posts?page=1&pageSize=-5");

  expect(res.status).toBe(200);
  expect(res.body.pageSize).toBe(1);
});
