// client/src/components/__tests__/PostCard.test.jsx

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";
import { PostCard } from "../PostCard";

test("shows the author's name and the publish date", () => {
  const publishedAt = "2026-11-20T12:00:00.000Z";
  const post = {
    id: "p1",
    title: "Hello",
    body: "World",
    publishedAt,
    author: { id: "u1", displayName: "Alice" },
  };

  const { container } = render(<PostCard post={post} />);

  expect(screen.getByText("By Alice")).toBeInTheDocument();
  const time = container.querySelector("time");
  expect(time).toHaveAttribute("datetime", publishedAt);
  expect(time).toHaveTextContent(
    new Date(publishedAt).toLocaleDateString(undefined, { dateStyle: "medium" })
  );
});
