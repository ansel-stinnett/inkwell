// load-tests/feed.k6.js
//
// Target comes from BASE_URL, so the same script runs against staging or a
// local Docker Compose stack without editing the file.

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 20,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<500"],
  },
};

export function setup() {
  // Wake the sleeping free instance before the timed run, so cold-start
  // latency does not pollute the P95 measurement.
  http.get(`${BASE_URL}/api/health`, { timeout: "120s" });
}

export default function () {
  const res = http.get(`${BASE_URL}/api/posts`);
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1); // think time: a real reader pauses between page loads
}
