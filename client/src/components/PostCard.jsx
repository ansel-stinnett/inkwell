// client/src/components/PostCard.jsx
//
// The author comes from the server's toPublicUser() projection
// (displayName only). Every field is rendered as text, never as HTML.

function formatPublishedAt(publishedAt) {
  return new Date(publishedAt).toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function PostCard({ post }) {
  return (
    <li className="border-b border-gray-200 pb-4">
      <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
      {(post.author?.displayName || post.publishedAt) && (
        <p className="mt-1 text-sm text-gray-500">
          {post.author?.displayName && <span>By {post.author.displayName}</span>}
          {post.author?.displayName && post.publishedAt && <span aria-hidden="true"> · </span>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>{formatPublishedAt(post.publishedAt)}</time>
          )}
        </p>
      )}
      <p className="mt-1 text-gray-600 line-clamp-3">{post.body}</p>
    </li>
  );
}
