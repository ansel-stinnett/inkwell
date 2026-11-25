// load-tests/feed-stress.k6.js
//
// Same target as the load test, but the fixed 20 VUs are replaced with a
// ramp that climbs well past expected traffic to find the breaking point.
// There is no pass/fail threshold: the output is the VU count at which
// errors appear, not a green checkmark.

import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 300 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const res = http.get(`${BASE_URL}/api/posts`);
  check(res, { "status is 200": (r) => r.status === 200 });
  sleep(1);
}
