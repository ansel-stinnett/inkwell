// server/src/routes/__tests__/posts.access-control.test.js
//
// A01 regression tests: requireAuth establishes identity, but identity
// alone is not permission. These prove the ownership check holds.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import {
  resetDatabase,
  createTestUser,
  createTestPost,
  tokenFor,
} from "../../test-utils/fixtures.js";

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

test("a user cannot delete another user's post (A01 regression test)", async () => {
  const owner = await createTestUser();
  const attacker = await createTestUser();
  const post = await createTestPost({ authorId: owner.id });

  const res = await request(app)
    .delete(`/api/posts/${post.id}`)
    .set("Authorization", `Bearer ${tokenFor(attacker)}`);

  expect(res.status).toBe(403);

  // The post must still exist — a 403 that deleted anyway would be worse
  // than no check at all.
  const stillThere = await prisma.post.findUnique({ where: { id: post.id } });
  expect(stillThere).not.toBeNull();
});

test("a user can delete their own post", async () => {
  const owner = await createTestUser();
  const post = await createTestPost({ authorId: owner.id });

  const res = await request(app)
    .delete(`/api/posts/${post.id}`)
    .set("Authorization", `Bearer ${tokenFor(owner)}`);

  expect(res.status).toBe(204);

  const gone = await prisma.post.findUnique({ where: { id: post.id } });
  expect(gone).toBeNull();
});

test("deleting without a token is rejected before any ownership check", async () => {
  const owner = await createTestUser();
  const post = await createTestPost({ authorId: owner.id });

  const res = await request(app).delete(`/api/posts/${post.id}`);

  expect(res.status).toBe(401);
});
