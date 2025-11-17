import React, { useMemo, useState } from "react";

/**
 * Volleyball 5-1 Rotation Helper (EU 2025)
 * - Correct Libero substitution logic:
 *   R1–R2 → Libero replaces MB1
 *   R3 → Libero OUT
 *   R4–R5 → Libero replaces MB2
 *   R6 → Libero OUT
 */

const ROLES = [
  { key: "OH1", label: "Outside Hitter 1 (OH1)" },
  { key: "OH2", label: "Outside Hitter 2 (OH2)" },
  { key: "Opp", label: "Opposite (Opp)" },
  { key: "Setter", label: "Setter" },
  { key: "MB1", label: "Middle Blocker 1 (MB1)" },
  { key: "MB2", label: "Middle Blocker 2 (MB2)" },
  { key: "Libero", label: "Libero" },
] as const;

type RoleKey = (typeof ROLES)[number]["key"];
type Players = Record<RoleKey, string>;
type TabKey = "receive" | "serve";

const POSITION_MAP: Record<
  TabKey,
  Record<number, Record<RoleKey, { x: number; y: number }>>
> = {
  receive: {
    1: {
      OH1: { x: 78, y: 59 },
      OH2: { x: 20, y: 59 },
      Opp: { x: 25, y: 30 },
      Setter: { x: 82, y: 78 },
      MB1: { x: 50, y: 70 }, // Libero
      MB2: { x: 20, y: 20 },
      Libero: { x: 78, y: 60 }, // OUT (not shown)
    },
    2: {
      OH1: { x: 78, y: 70 },
      OH2: { x: 20, y: 59 },
      Opp: { x: 72, y: 20 },
      Setter: { x: 60, y: 27 },
      MB1: { x: 50, y: 70 },
      MB2: { x: 72, y: 35 },
      Libero: { x: 22, y: 74 }, // OUT (not shown)
    },
    3: {
      OH1: { x: 50, y: 72 },
      OH2: { x: 28, y: 60 },
      Opp: { x: 76, y: 20 },
      Setter: { x: 40, y: 35 },
      MB1: { x: 20, y: 20 },
      MB2: { x: 78, y: 72 },
      Libero: { x: 50, y: 72 },
    },
    4: {
      OH1: { x: 50, y: 68 },
      OH2: { x: 30, y: 50 },
      Opp: { x: 70, y: 80 },
      Setter: { x: 15, y: 15 },
      MB1: { x: 23, y: 25 },
      MB2: { x: 78, y: 68 },
      Libero: { x: 50, y: 72 },
    },
    5: {
      OH1: { x: 20, y: 60 },
      OH2: { x: 78, y: 60 },
      Opp: { x: 62, y: 80 },
      Setter: { x: 70, y: 15 },
      MB1: { x: 83, y: 25 },
      MB2: { x: 50, y: 68 },
      Libero: { x: 50, y: 72 },
    },
    6: {
      OH1: { x: 30, y: 50 },
      OH2: { x: 50, y: 60 },
      Opp: { x: 40, y: 80 },
      Setter: { x: 78, y: 20 },
      MB1: { x: 78, y: 60 },
      MB2: { x: 20, y: 20 },
      Libero: { x: 50, y: 72 },
    },
  },
  serve: {
    // Rotation 1 — Setter serving (Zone 1)
    1: {
      Setter: { x: 80, y: 95 }, // Zone 1
      OH1: { x: 18, y: 16 }, // Zone 4
      MB2: { x: 50, y: 16 }, // Zone 3
      Opp: { x: 78, y: 16 }, // Zone 2
      OH2: { x: 22, y: 70 }, // Zone 5
      MB1: { x: 50, y: 72 }, // Zone 6
      Libero: { x: 50, y: 72 }, // replaces MB1
    },

    // Rotation 2 — OH1 serving (Zone 1)
    2: {
      OH1: { x: 80, y: 95 },
      MB2: { x: 50, y: 16 },
      Opp: { x: 78, y: 16 },
      Setter: { x: 70, y: 40 },
      OH2: { x: 22, y: 16 },
      MB1: { x: 25, y: 72 },
      Libero: { x: 50, y: 72 },
    },

    // Rotation 3 — MB (MB2) serving (Zone 1)
    3: {
      MB2: { x: 80, y: 95 }, // Zone 1
      Opp: { x: 78, y: 16 },
      Setter: { x: 70, y: 40 },
      OH1: { x: 50, y: 72 },
      OH2: { x: 22, y: 16 },
      MB1: { x: 50, y: 16 },
      Libero: { x: 50, y: 72 },
    },

    // Rotation 4 — Opp serving (Zone 1)
    4: {
      Opp: { x: 80, y: 95 }, // Zone 1
      Setter: { x: 78, y: 16 },
      MB1: { x: 50, y: 16 },
      OH1: { x: 20, y: 16 },
      MB2: { x: 50, y: 72 },
      OH2: { x: 22, y: 70 },
      Libero: { x: 50, y: 72 },
    },

    // Rotation 5 — OH2 serving (Zone 1)
    5: {
      OH2: { x: 80, y: 95 },
      Setter: { x: 78, y: 16 },
      OH1: { x: 20, y: 16 },
      MB1: { x: 50, y: 16 },
      Opp: { x: 78, y: 70 },
      MB2: { x: 20, y: 70 },
      Libero: { x: 50, y: 72 },
    },

    // Rotation 6 — Setter serving again (Zone 1)
    6: {
      MB1: { x: 80, y: 95 }, // Zone 1
      OH1: { x: 18, y: 16 },
      MB2: { x: 50, y: 16 },
      Setter: { x: 78, y: 16 },
      OH2: { x: 50, y: 60 },
      Opp: { x: 78, y: 60 },
      Libero: { x: 50, y: 72 },
    },
  },
};

function PlayerChip({ name, role }: { name: string; role: RoleKey }) {
  const shortName = useMemo(() => {
    const maxChars = 10;
    return name.length <= maxChars ? name : name.slice(0, maxChars - 1) + "…";
  }, [name]);
  return (
    <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border border-indigo-200 bg-gradient-to-br from-white to-indigo-50 text-center shadow-md">
      <div className="px-1 leading-tight">
        <div className="w-12 md:w-14 truncate text-xs font-bold text-zinc-900">
          {shortName}
        </div>
        <div className="text-[10px] text-indigo-700">({role})</div>
      </div>
    </div>
  );
}

function Court({
  tab,
  rotation,
  players,
}: {
  tab: TabKey;
  rotation: number;
  players: Players;
}) {
  const coords = useMemo(() => POSITION_MAP[tab][rotation], [tab, rotation]);

  // Libero is ACTIVE in rotations 1,2,4,5; OUT in 3,6 (receive tabs).
  const liberoActive =
    tab === "receive" || (tab === "serve" && rotation !== 3 && rotation !== 6);

  // Which middle does Libero replace when active?
  // Your convention: R1–R3 pair near Setter is MB1 → Libero replaces MB1 in 1–3.
  //                  R4–R6 far side is MB2 → Libero replaces MB2 in 4–6.
  const liberoReplaces: () => RoleKey = () => {
    if (rotation < 3) return "MB1";
    if (rotation >= 3 && rotation < 6) return "MB2";
    return "MB1";
  };

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="relative aspect-[1/1.1] w-full rounded-2xl border border-zinc-300 bg-emerald-50 shadow-inner overflow-hidden">
        {/* Lines */}
        <div className="absolute left-0 right-0 top-[8%] h-1 bg-zinc-400/70" />
        <div className="absolute left-0 right-0 top-[36%] h-0.5 bg-zinc-400/40" />
        <div className="absolute left-0 right-0 bottom-[8%] h-0.5 bg-zinc-400/40" />
        <div className="absolute left-[8%] top-0 bottom-0 w-0.5 bg-zinc-400/40" />
        <div className="absolute right-[8%] top-0 bottom-0 w-0.5 bg-zinc-400/40" />

        {(Object.keys(players) as RoleKey[]).map((role) => {
          // If Libero is active, hide the middle they replace; show Libero instead.
          if (liberoActive) {
            if (role === liberoReplaces()) return null; // hide replaced MB
          } else {
            // Libero out (R3, R6): hide Libero, show both MBs
            if (role === "Libero") return null;
          }

          // Libero stands at the replaced middle's coordinates when active
          const { x, y } =
            role === "Libero" && liberoActive
              ? coords[liberoReplaces()]
              : coords[role];

          return (
            <div
              key={role}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute transition-all duration-500 ease-out"
            >
              <PlayerChip role={role} name={players[role]} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main Component --------------------------------------------------------
export default function VolleyballRotationHelper() {
  const [tab, setTab] = useState<TabKey>("receive");
  const [rotation, setRotation] = useState<number>(1);
  const [players, setPlayers] = useState<Players | null>(null);
  const [form, setForm] = useState<Record<RoleKey, string>>({
    OH1: "",
    OH2: "",
    Opp: "",
    Setter: "",
    MB1: "",
    MB2: "",
    Libero: "",
  });
  const ready = !!players;

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const allFilled = (Object.keys(form) as RoleKey[]).every(
      (k) => form[k].trim().length > 0,
    );
    if (!allFilled) return alert("Please enter all 7 player names.");
    setPlayers(form as Players);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4">
      <div className="mx-auto w-full max-w-[480px] px-4 py-6">
        <h1 className="mb-4 text-center text-xl font-extrabold text-zinc-900">
          Volleyball 5-1 Rotation Helper
        </h1>

        {!ready && (
          <form
            onSubmit={submitForm}
            className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-zinc-600">
              Enter your lineup. Long names are truncated automatically.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {ROLES.map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium text-zinc-700">
                    {label}
                  </label>
                  <input
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-400 shadow-sm"
                    placeholder={`Type ${label} name…`}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [key]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end pt-2">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold shadow hover:shadow-md">
                Start
              </button>
            </div>
          </form>
        )}

        {ready && players && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("receive")}
                  className={`px-4 py-2 text-sm font-semibold ${
                    tab === "receive"
                      ? "text-indigo-700 border-b-2 border-indigo-600"
                      : "text-zinc-700"
                  }`}
                >
                  Receive
                </button>
                <button
                  onClick={() => setTab("serve")}
                  className={`px-4 py-2 text-sm font-semibold ${
                    tab === "serve"
                      ? "text-indigo-700 border-b-2 border-indigo-600"
                      : "text-zinc-700"
                  }`}
                >
                  Serve
                </button>
              </div>
              <div className="text-sm font-semibold text-zinc-700">
                Rotation <span className="text-indigo-700">{rotation}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Court tab={tab} rotation={rotation} players={players} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setRotation((r) => ((r - 2 + 6) % 6) + 1)}
                className="bg-white border border-zinc-300 px-4 py-2 rounded-full text-sm font-semibold text-zinc-700"
              >
                ◀ Prev
              </button>
              <div className="text-xs text-zinc-500">
                Tap Prev/Next to animate rotation.
              </div>
              <button
                onClick={() => setRotation((r) => (r % 6) + 1)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full font-semibold"
              >
                Next ▶
              </button>
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-xs text-zinc-500">
          Made with ❤️
        </footer>
      </div>
    </div>
  );
}
