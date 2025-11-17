import React, { useMemo, useState } from "react";
import BALL from "./assets/ball.webp";

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
type TabKey = "receive" | "serve" | "base";

const BASE_ZONES: Record<string, { x: number; y: number }> = {
  number1: { x: 80, y: 80 },
  number2: { x: 80, y: 20 },
  number3: { x: 50, y: 20 },
  number4: { x: 20, y: 20 },
  number5: { x: 20, y: 80 },
  number6: { x: 50, y: 80 },
};

const ROTATION_BASE_MAP: Record<
  number,
  Record<RoleKey, { x: number; y: number }>
> = {
  1: {
    Setter: BASE_ZONES.number1,
    OH1: BASE_ZONES.number2,
    MB2: BASE_ZONES.number3,
    Opp: BASE_ZONES.number4,
    OH2: BASE_ZONES.number5,
    MB1: BASE_ZONES.number6,
    Libero: { x: 50, y: 80 },
  },
  2: {
    Setter: BASE_ZONES.number6,
    OH1: BASE_ZONES.number1,
    MB2: BASE_ZONES.number2,
    Opp: BASE_ZONES.number3,
    OH2: BASE_ZONES.number4,
    MB1: BASE_ZONES.number5,
    Libero: { x: 50, y: 80 },
  },
  3: {
    Setter: BASE_ZONES.number5,
    OH1: BASE_ZONES.number6,
    MB2: BASE_ZONES.number1,
    Opp: BASE_ZONES.number2,
    OH2: BASE_ZONES.number3,
    MB1: BASE_ZONES.number4,
    Libero: { x: 50, y: 80 },
  },
  4: {
    Setter: BASE_ZONES.number4,
    OH1: BASE_ZONES.number5,
    MB2: BASE_ZONES.number6,
    Opp: BASE_ZONES.number1,
    OH2: BASE_ZONES.number2,
    MB1: BASE_ZONES.number3,
    Libero: { x: 50, y: 80 },
  },
  5: {
    Setter: BASE_ZONES.number3,
    OH1: BASE_ZONES.number4,
    MB2: BASE_ZONES.number5,
    Opp: BASE_ZONES.number6,
    OH2: BASE_ZONES.number1,
    MB1: BASE_ZONES.number2,
    Libero: { x: 50, y: 80 },
  },
  6: {
    Setter: BASE_ZONES.number2,
    OH1: BASE_ZONES.number3,
    MB2: BASE_ZONES.number4,
    Opp: BASE_ZONES.number5,
    OH2: BASE_ZONES.number6,
    MB1: BASE_ZONES.number1,
    Libero: { x: 50, y: 80 },
  },
};
const BASE_POSITION_MAP: Record<
  number,
  Record<RoleKey, { x: number; y: number }>
> = {
  1: {
    Setter: { x: 80, y: 70 },
    OH1: { x: 18, y: 16 },
    MB2: { x: 50, y: 16 },
    Opp: { x: 78, y: 16 },
    OH2: { x: 50, y: 70 },
    MB1: { x: 22, y: 70 },
    Libero: { x: 22, y: 72 },
  },
  2: {
    OH1: { x: 50, y: 70 },
    MB2: { x: 50, y: 16 },
    Opp: { x: 78, y: 16 },
    Setter: { x: 80, y: 70 },
    OH2: { x: 22, y: 16 },
    MB1: { x: 25, y: 72 },
    Libero: { x: 50, y: 72 },
  },
  3: {
    MB2: { x: 20, y: 70 },
    Opp: { x: 78, y: 16 },
    Setter: { x: 80, y: 70 },
    OH1: { x: 50, y: 72 },
    OH2: { x: 22, y: 16 },
    MB1: { x: 50, y: 16 },
    Libero: { x: 50, y: 72 },
  },
  4: {
    Opp: { x: 80, y: 70 },
    Setter: { x: 78, y: 16 },
    MB1: { x: 50, y: 16 },
    OH1: { x: 50, y: 70 },
    MB2: { x: 20, y: 70 },
    OH2: { x: 22, y: 16 },
    Libero: { x: 50, y: 72 },
  },
  5: {
    OH2: { x: 50, y: 70 },
    Setter: { x: 78, y: 16 },
    OH1: { x: 20, y: 16 },
    MB1: { x: 50, y: 16 },
    Opp: { x: 78, y: 70 },
    MB2: { x: 20, y: 70 },
    Libero: { x: 50, y: 72 },
  },
  6: {
    MB1: { x: 20, y: 60 },
    OH1: { x: 18, y: 16 },
    MB2: { x: 50, y: 16 },
    Setter: { x: 78, y: 16 },
    OH2: { x: 50, y: 60 },
    Opp: { x: 78, y: 60 },
    Libero: { x: 50, y: 72 },
  },
};

const POSITION_MAP: Record<
  TabKey,
  Record<number, Record<RoleKey, { x: number; y: number }>>
> = {
  base: ROTATION_BASE_MAP,
  receive: {
    1: {
      OH1: { x: 78, y: 59 },
      OH2: { x: 20, y: 59 },
      Opp: { x: 20, y: 20 },
      Setter: { x: 82, y: 78 },
      MB1: { x: 50, y: 70 },
      MB2: { x: 25, y: 30 },
      Libero: { x: 78, y: 60 },
    },
    2: {
      OH1: { x: 78, y: 70 },
      OH2: { x: 20, y: 59 },
      Opp: { x: 72, y: 20 },
      Setter: { x: 60, y: 27 },
      MB1: { x: 50, y: 70 },
      MB2: { x: 72, y: 35 },
      Libero: { x: 22, y: 74 },
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
      OH2: { x: 30, y: 60 },
      Opp: { x: 84, y: 84 },
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
    1: {
      Setter: { x: 80, y: 95 },
      OH1: { x: 18, y: 16 },
      MB2: { x: 50, y: 16 },
      Opp: { x: 78, y: 16 },
      OH2: { x: 50, y: 70 },
      MB1: { x: 22, y: 70 },
      Libero: { x: 22, y: 72 },
    },
    2: {
      OH1: { x: 80, y: 95 },
      MB2: { x: 50, y: 16 },
      Opp: { x: 78, y: 16 },
      Setter: { x: 70, y: 40 },
      OH2: { x: 22, y: 16 },
      MB1: { x: 25, y: 72 },
      Libero: { x: 50, y: 72 },
    },
    3: {
      MB2: { x: 80, y: 95 },
      Opp: { x: 78, y: 16 },
      Setter: { x: 70, y: 40 },
      OH1: { x: 50, y: 72 },
      OH2: { x: 22, y: 16 },
      MB1: { x: 50, y: 16 },
      Libero: { x: 50, y: 72 },
    },
    4: {
      Opp: { x: 80, y: 95 },
      Setter: { x: 78, y: 16 },
      MB1: { x: 50, y: 16 },
      OH1: { x: 50, y: 70 },
      MB2: { x: 20, y: 70 },
      OH2: { x: 22, y: 16 },
      Libero: { x: 50, y: 72 },
    },
    5: {
      OH2: { x: 80, y: 95 },
      Setter: { x: 78, y: 16 },
      OH1: { x: 20, y: 16 },
      MB1: { x: 50, y: 16 },
      Opp: { x: 78, y: 70 },
      MB2: { x: 20, y: 70 },
      Libero: { x: 50, y: 72 },
    },
    6: {
      MB1: { x: 80, y: 95 },
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
  isPlaying,
  resetPosition,
}: {
  tab: TabKey;
  rotation: number;
  players: Players;
  isPlaying: boolean;
  resetPosition: boolean;
}) {
  const [ballPos, setBallPos] = useState<{ x: number; y: number } | null>(null);

  const [coords, setCoords] = useState<
    Record<RoleKey, { x: number; y: number }>
  >(POSITION_MAP[tab][rotation]);

  const liberoActive =
    tab === "receive" ||
    ((tab === "serve" || tab === "base") && rotation !== 3 && rotation !== 6);

  const liberoReplaces = React.useCallback((): RoleKey => {
    if (rotation < 3) return "MB1";
    if (rotation >= 3 && rotation < 6) return "MB2";
    return "MB1";
  }, [rotation]);

  const animateBallToLiberoAndBack = React.useCallback(
    (allCoords: typeof coords) => {
      if (tab !== "receive") return;
      const targetLibero = (liberoActive
        ? allCoords[liberoReplaces()]
        : allCoords["Libero"]) ?? {
        x: 50,
        y: 20,
      };

      // Start position: top/center (opponent serve)
      setBallPos({ x: 50, y: 2 });

      // Step 1️⃣: Ball goes to Libero
      const t1 = setTimeout(() => {
        setBallPos(targetLibero);
      }, 500);

      // Step 2️⃣: Ball goes back over the net
      const t2 = setTimeout(() => {
        setBallPos({ x: 50, y: 6 });
      }, 2000);

      // Step 3️⃣: Hide the ball
      const t3 = setTimeout(() => {
        setBallPos(null);
      }, 3300);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    },
    [tab, liberoActive, liberoReplaces],
  );

  React.useEffect(() => {
    setCoords(POSITION_MAP[tab][rotation]);
  }, [tab, rotation]);

  React.useEffect(() => {
    if (resetPosition) {
      setCoords(POSITION_MAP.receive[rotation]);
    }
    if (isPlaying) {
      setCoords(POSITION_MAP.receive[rotation]);

      const frame = requestAnimationFrame(() => {
        const cleanupBall = animateBallToLiberoAndBack(
          POSITION_MAP.receive[rotation],
        );

        const goBaseTimer = setTimeout(() => {
          setCoords(BASE_POSITION_MAP[rotation]);
        }, 2500);

        return () => {
          cancelAnimationFrame(frame);
          clearTimeout(goBaseTimer);
          if (cleanupBall) cleanupBall();
        };
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [isPlaying, rotation, resetPosition, animateBallToLiberoAndBack]);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        className="court relative aspect-[1/1.1] w-full rounded-2xl border border-zinc-300 bg-blue-100 shadow-inner overflow-hidden"
        style={
          {
            "--ball-max-height": "550%", // safe vertical travel distance (relative to court)
            "--ball-overshoot": "-5%", // how far up it ends after returning
          } as React.CSSProperties
        }
      >
        {/* Lines */}
        <div className="absolute left-0 right-0 top-[8%] h-1 bg-zinc-400/70" />
        <div className="absolute left-0 right-0 top-[36%] h-0.5 bg-zinc-400/40" />
        <div className="absolute left-0 right-0 bottom-[8%] h-0.5 bg-zinc-400/40" />
        <div className="absolute left-[8%] top-0 bottom-0 w-0.5 bg-zinc-400/40" />
        <div className="absolute right-[8%] top-0 bottom-0 w-0.5 bg-zinc-400/40" />

        {/* Volleyball animation */}
        {tab === "receive" && ballPos && (
          <img
            src={BALL}
            alt="Volleyball"
            className="ball absolute z-50 pointer-events-none select-none"
            style={{
              left: `${ballPos.x}%`,
              top: `${ballPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: "2.25rem", // ~w-9 for a slightly smaller ball
              height: "auto",
            }}
          />
        )}

        {(Object.keys(players) as RoleKey[]).map((role) => {
          if (liberoActive) {
            if (role === liberoReplaces()) return null;
          } else {
            if (role === "Libero") return null;
          }

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
              className="absolute transition-all duration-2500 ease-out"
            >
              <PlayerChip role={role} name={players[role]} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VolleyballRotationHelper() {
  const [tab, setTab] = useState<TabKey>("receive");
  const [rotation, setRotation] = useState<number>(1);
  const [players, setPlayers] = useState<Players | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetPosition, setResetPosition] = useState(false);
  const [form, setForm] = useState<Record<RoleKey, string>>({
    OH1: "OH1",
    OH2: "OH2",
    Opp: "Opp",
    Setter: "Setter",
    MB1: "MB1",
    MB2: "MB2",
    Libero: "Libero",
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

  function playDemo() {
    if (isPlaying) return;
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  }

  function handleResetPositions() {
    if (resetPosition) return;
    setResetPosition(true);
    setTimeout(() => setResetPosition(false), 2500);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 sm:p-4">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
              {/* Tabs container */}
              <div
                className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 sm:pb-0"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {[
                  { key: "receive", label: "Receive" },
                  { key: "serve", label: "Serve" },
                  { key: "base", label: "Rotation Position" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key as TabKey)}
                    className={`shrink-0 snap-center px-4 py-2 text-sm sm:text-base font-semibold rounded-full border transition-all
                      ${
                        tab === key
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Rotation indicator */}
              <div className="text-sm sm:text-base font-semibold text-zinc-700 text-center sm:text-right mt-2 sm:mt-0">
                Rotation <span className="text-indigo-700">{rotation}</span>
              </div>
            </div>

            {tab === "receive" && (
              <div className="flex justify-center gap-2 bg-white mt-0 p-2 rounded-md shadow-md">
                <button
                  onClick={playDemo}
                  disabled={isPlaying || resetPosition}
                  className={`px-6 py-2 rounded-full font-semibold shadow
                    ${
                      isPlaying || resetPosition
                        ? "bg-gray-400"
                        : "bg-yellow-500 hover:bg-yellow-400 text-white"
                    }`}
                >
                  {isPlaying ? "Playing..." : "▶ Play"}
                </button>
                {resetPosition}
                <button
                  onClick={handleResetPositions}
                  disabled={resetPosition || isPlaying}
                  className={`px-6 py-2 rounded-full font-semibold shadow
                    ${
                      resetPosition || isPlaying
                        ? "bg-gray-400"
                        : "bg-blue-500 hover:bg-blue-400 text-white"
                    }`}
                >
                  {resetPosition ? "Resetting..." : "Reset"}
                </button>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Court
                tab={tab}
                rotation={rotation}
                players={players}
                isPlaying={isPlaying}
                resetPosition={resetPosition}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setRotation((r) => ((r - 2 + 6) % 6) + 1)}
                className="bg-white border border-zinc-300 px-4 py-2 rounded-full text-sm font-semibold text-zinc-700"
              >
                Prev
              </button>
              <div className="text-xs text-center text-zinc-500">
                Tap Prev/Next to animate rotation.
              </div>
              <button
                onClick={() => setRotation((r) => (r % 6) + 1)}
                className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <footer className="mt-6 text-center text-xs text-zinc-500">
          Made with ❤️ for Volleyball lovers
          <br />
          Author:{" "}
          <span className="font-bold">
            <a href="mailto:nima.2004hkh@gmail.com">Nima</a>
          </span>
        </footer>
      </div>
    </div>
  );
}

const style = document.createElement("style");
style.innerHTML = `
  .ball {
    transition:
      left 900ms cubic-bezier(0.22, 1, 0.36, 1),
      top  900ms cubic-bezier(0.22, 1, 0.36, 1),
      transform 0s; /* keep center alignment instant */
    will-change: left, top, transform;
    backface-visibility: hidden;
    transform-style: preserve-3d;
  }
`;
document.head.appendChild(style);
