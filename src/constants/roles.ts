export const ROLES = [
  { key: "OH1", label: "Outside Hitter 1 (OH1)" },
  { key: "OH2", label: "Outside Hitter 2 (OH2)" },
  { key: "Opp", label: "Opposite (Opp)" },
  { key: "Setter", label: "Setter" },
  { key: "MB1", label: "Middle Blocker 1 (MB1)" },
  { key: "MB2", label: "Middle Blocker 2 (MB2)" },
  { key: "Libero", label: "Libero" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];
export type Players = Record<RoleKey, string>;
export type TabKey = "receive" | "serve" | "base";
export type InsightView = "zone" | "movement";
export type ReceivePhase = "before" | "after";
export type Point = { x: number; y: number };

export const ROLE_LABEL_BY_KEY = Object.fromEntries(
  ROLES.map((role) => [role.key, role.label]),
) as Record<RoleKey, string>;
