// server/src/events/listeners/count-published-posts.listener.js
//
// Exercise 1: a second listener on the same event. PostService.publish()
// was not touched to add it — which is the whole point of Observer.
// The counter is in-memory, so it resets when the process restarts.

import { EventBus } from "../event-bus.js";

let totalPublished = 0;

EventBus.on("post.published", () => {
  totalPublished += 1;
});

export function getTotalPublished() {
  return totalPublished;
}
