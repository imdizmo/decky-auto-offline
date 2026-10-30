import assert from "node:assert/strict";
import { activeRule, DEFAULT_RULES, fmt, sanitize } from "../src/schedule.ts";

const at = (h: number, m = 0) => activeRule(DEFAULT_RULES, h * 60 + m)?.status;

assert.equal(at(0, 30), "invisible"); // wraps to yesterdays 23:00
assert.equal(at(2), "offline");
assert.equal(at(7, 59), "offline");
assert.equal(at(8), "online");
assert.equal(at(13, 30), "away");
assert.equal(at(14), "online");
assert.equal(at(23, 59), "invisible");
assert.equal(activeRule([], 600), undefined);
assert.equal(fmt(65), "01:05");
assert.equal(sanitize(null), undefined);
assert.deepEqual(
  sanitize([{ at: 60, status: "away" }, { at: 2000, status: "away" }, { at: 60, status: "busy" }, null]),
  [{ at: 60, status: "away" }],
);
console.log("ok");
