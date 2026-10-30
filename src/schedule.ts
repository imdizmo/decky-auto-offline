export const STATUSES = ["online", "away", "invisible", "dnd", "offline"] as const;
export type Status = (typeof STATUSES)[number];
// at = minutes since local midnight
export type Rule = { at: number; status: Status };

export const DEFAULT_RULES: Rule[] = [
  { at: 2 * 60, status: "offline" },
  { at: 8 * 60, status: "online" },
  { at: 13 * 60, status: "away" },
  { at: 14 * 60, status: "online" },
  { at: 23 * 60, status: "invisible" },
];

export const fmt = (at: number) =>
  `${String(Math.floor(at / 60)).padStart(2, "0")}:${String(at % 60).padStart(2, "0")}`;

export function sanitize(v: unknown): Rule[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.filter(
    (r): r is Rule =>
      Number.isInteger(r?.at) && r.at >= 0 && r.at < 1440 && (STATUSES as readonly string[]).includes(r?.status),
  );
}

// fall back to last rule so it wraps past midnight
export function activeRule(rules: Rule[], now: number): Rule | undefined {
  const sorted = [...rules].sort((a, b) => a.at - b.at);
  return sorted.filter((r) => r.at <= now).pop() ?? sorted[sorted.length - 1];
}
