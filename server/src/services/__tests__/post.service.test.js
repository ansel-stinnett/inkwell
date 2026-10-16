import { jest } from "@jest/globals";

const mockPostRepository = {
  createWithTags: jest.fn(),
  searchPublished: jest.fn(),
  findPublished: jest.fn(),
};
const mockEventBus = { emit: jest.fn() };

jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
  PostRepository: mockPostRepository,
}));
jest.unstable_mockModule("../../events/event-bus.js", () => ({
  EventBus: mockEventBus,
}));

const { PostService } = await import("../post.service.js");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PostService.publish", () => {
  test("creates a PUBLISHED post and emits post.published", async () => {
    mockPostRepository.createWithTags.mockResolvedValue({
      id: "p1",
      title: "Hello",
      status: "PUBLISHED",
    });

    const post = await PostService.publish({ authorId: "u1", title: "Hello", body: "World" });

    expect(post.status).toBe("PUBLISHED");
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      "post.published",
      expect.objectContaining({ postId: "p1" })
    );
  });

  test("rejects an empty title", async () => {
    await expect(
      PostService.publish({ authorId: "u1", title: "", body: "World" })
    ).rejects.toThrow();
  });
});

describe("PostService.search", () => {
  test("returns matching posts for a query that matches (row 1)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({
      posts: [{ id: "p1", title: "On Modularity" }],
      hasMore: false,
    });

    const result = await PostService.search({ query: "modularity" });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe("p1");
  });

  test("returns an empty list for a query that matches nothing (row 2)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    const result = await PostService.search({ query: "zzzznotathing" });

    expect(result.posts).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  test("defaults to page 1 and pageSize 10 when they are omitted (row 3, boundary)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    await PostService.search({ query: "anything" });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({
      query: "anything",
      page: 1,
      pageSize: 10,
    });
  });

  test("passes an explicit page and pageSize through to the strategy (row 4)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({ posts: [], hasMore: false });

    await PostService.search({ query: "anything", page: 3, pageSize: 5 });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({
      query: "anything",
      page: 3,
      pageSize: 5,
    });
  });
});
