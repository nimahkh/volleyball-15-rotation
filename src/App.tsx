import React, { useMemo, useRef, useState } from "react";
import "./App.css";
import BALL from "./assets/ball.webp";
import {
  ROLE_LABEL_BY_KEY,
  ROLES,
  type InsightView,
  type Players,
  type Point,
  type RoleKey,
  type TabKey,
} from "./constants/roles";
import {
  useReceiveModeInsights,
  type SelectedToken,
} from "./hooks/useReceiveModeInsights";

const BASE_ZONES: Record<string, Point> = {
  number1: { x: 80, y: 80 },
  number2: { x: 80, y: 20 },
  number3: { x: 50, y: 20 },
  number4: { x: 20, y: 20 },
  number5: { x: 20, y: 80 },
  number6: { x: 50, y: 80 },
};

const ROTATION_BASE_MAP: Record<number, Record<RoleKey, Point>> = {
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

const BASE_POSITION_MAP: Record<number, Record<RoleKey, Point>> = {
  1: {
    Setter: { x: 80, y: 70 },
    OH1: { x: 78, y: 16 },
    MB2: { x: 50, y: 16 },
    Opp: { x: 18, y: 16 },
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

const POSITION_MAP: Record<TabKey, Record<number, Record<RoleKey, Point>>> = {
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

function useMediaQuery(query: string) {
  const getMatches = React.useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQueryList = window.matchMedia(query);

    const listener = () => setMatches(mediaQueryList.matches);
    listener();

    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

function PlayerChip({
  name,
  role,
  isClickable,
  isSelected,
  isDimmed,
}: {
  name: string;
  role: RoleKey;
  isClickable: boolean;
  isSelected: boolean;
  isDimmed: boolean;
}) {
  const shortName = useMemo(() => {
    const maxChars = 10;
    return name.length <= maxChars ? name : `${name.slice(0, maxChars - 1)}…`;
  }, [name]);

  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full border text-center shadow-md md:h-16 md:w-16 ${
        isSelected
          ? "border-blue-600 bg-linear-to-br from-blue-50 to-blue-100 ring-2 ring-blue-300"
          : "border-indigo-200 bg-linear-to-br from-white to-indigo-50"
      } ${isClickable ? "receive-token" : ""} ${
        isDimmed ? "opacity-10 brightness-80 saturate-90" : ""
      }`}
    >
      <div className="px-1 leading-tight">
        <div className="w-12 truncate text-xs font-bold text-zinc-900 md:w-14">
          {shortName}
        </div>
        <div className="text-[10px] text-indigo-700">({role})</div>
      </div>
    </div>
  );
}

function OptionChooser({
  selectedInsight,
  onChoose,
}: {
  selectedInsight: InsightView | null;
  onChoose: (view: InsightView) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Choose a view
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChoose("zone")}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
            selectedInsight === "zone"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Player Zone
        </button>
        <button
          type="button"
          onClick={() => onChoose("movement")}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
            selectedInsight === "movement"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Player Movement
        </button>
      </div>
    </div>
  );
}

function PlayerInsightContent({
  role,
  name,
  selectedInsight,
  onChooseInsight,
}: {
  role: RoleKey;
  name: string;
  selectedInsight: InsightView | null;
  onChooseInsight: (view: InsightView) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {ROLE_LABEL_BY_KEY[role]}
        </div>
        <h3 className="text-base font-bold text-zinc-900">{name}</h3>
      </div>

      <OptionChooser
        selectedInsight={selectedInsight}
        onChoose={onChooseInsight}
      />
    </div>
  );
}

function MovementShadow({
  movement,
}: {
  movement: {
    from: Point;
    to: Point;
    role: RoleKey;
    name: string;
    runId: number;
  };
}) {
  const [animate, setAnimate] = useState(false);

  React.useEffect(() => {
    setAnimate(false);
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [movement.runId]);

  const shortName =
    movement.name.length > 10 ? `${movement.name.slice(0, 9)}…` : movement.name;

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        left: `${animate ? movement.to.x : movement.from.x}%`,
        top: `${animate ? movement.to.y : movement.from.y}%`,
        transform: "translate(-50%, -50%)",
        transition:
          "left 1200ms cubic-bezier(0.22, 1, 0.36, 1), top 1200ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="movement-shadow flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300 bg-cyan-100/60 text-center md:h-16 md:w-16">
        <div className="px-1 leading-tight">
          <div className="w-12 truncate text-xs font-bold text-cyan-900 md:w-14">
            {shortName}
          </div>
          <div className="text-[10px] text-cyan-700">({movement.role})</div>
        </div>
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
  selectedToken,
  choosePlayer,
  zoneAnimation,
  movementAnimation,
  focusedRole,
  isDesktop,
  onCloseSelected,
  insightPanel,
}: {
  tab: TabKey;
  rotation: number;
  players: Players;
  isPlaying: boolean;
  resetPosition: boolean;
  selectedToken: SelectedToken | null;
  choosePlayer: (token: SelectedToken) => void;
  zoneAnimation: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  } | null;
  movementAnimation: {
    from: Point;
    to: Point;
    role: RoleKey;
    name: string;
    runId: number;
  } | null;
  focusedRole: RoleKey | null;
  isDesktop: boolean;
  onCloseSelected: () => void;
  insightPanel: React.ReactNode;
}) {
  const [ballPos, setBallPos] = useState<Point | null>(null);
  const [coords, setCoords] = useState<Record<RoleKey, Point>>(
    POSITION_MAP[tab][rotation],
  );

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
        : allCoords.Libero) ?? {
        x: 50,
        y: 20,
      };

      setBallPos({ x: 50, y: 2 });

      const t1 = window.setTimeout(() => {
        setBallPos(targetLibero);
      }, 500);

      const t2 = window.setTimeout(() => {
        setBallPos({ x: 50, y: 6 });
      }, 2000);

      const t3 = window.setTimeout(() => {
        setBallPos(null);
      }, 3300);

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t3);
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

        const goBaseTimer = window.setTimeout(() => {
          setCoords(BASE_POSITION_MAP[rotation]);
        }, 2500);

        return () => {
          cancelAnimationFrame(frame);
          window.clearTimeout(goBaseTimer);
          if (cleanupBall) cleanupBall();
        };
      });

      return () => cancelAnimationFrame(frame);
    }
  }, [isPlaying, rotation, resetPosition, animateBallToLiberoAndBack]);

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div className="court relative aspect-[1/1.1] w-full overflow-hidden rounded-2xl border border-zinc-300 bg-blue-100 shadow-inner">
        <div className="absolute left-0 right-0 top-[8%] h-1 bg-zinc-400/70" />
        <div className="absolute left-0 right-0 top-[36%] h-0.5 bg-zinc-400/40" />
        <div className="absolute bottom-[8%] left-0 right-0 h-0.5 bg-zinc-400/40" />
        <div className="absolute bottom-0 left-[8%] top-0 w-0.5 bg-zinc-400/40" />
        <div className="absolute bottom-0 right-[8%] top-0 w-0.5 bg-zinc-400/40" />

        {tab === "receive" && zoneAnimation && (
          <div
            className="zone-coverage absolute z-30"
            style={{
              left: `${zoneAnimation.x}%`,
              top: `${zoneAnimation.y}%`,
              width: `${zoneAnimation.width}%`,
              height: `${zoneAnimation.height}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="zone-label">{zoneAnimation.label}</span>
          </div>
        )}

        {tab === "receive" && movementAnimation && (
          <MovementShadow
            key={movementAnimation.runId}
            movement={movementAnimation}
          />
        )}

        {tab === "receive" && ballPos && (
          <img
            src={BALL}
            alt="Volleyball"
            className="ball absolute z-50 select-none pointer-events-none"
            style={{
              left: `${ballPos.x}%`,
              top: `${ballPos.y}%`,
              transform: "translate(-50%, -50%)",
              width: "2.25rem",
              height: "auto",
            }}
          />
        )}

        {(Object.keys(players) as RoleKey[]).map((role) => {
          if (liberoActive) {
            if (role === liberoReplaces()) return null;
          } else if (role === "Libero") {
            return null;
          }

          const { x, y } =
            role === "Libero" && liberoActive
              ? coords[liberoReplaces()]
              : coords[role];
          const isReceiveClickable = tab === "receive";
          const isSelected = selectedToken?.role === role;
          const isDimmed =
            tab === "receive" && focusedRole !== null && focusedRole !== role;

          return (
            <button
              type="button"
              key={role}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute transition-all duration-[2500ms] ease-out"
              onClick={() => {
                if (!isReceiveClickable) return;
                choosePlayer({ role, name: players[role], x, y });
              }}
            >
              <PlayerChip
                role={role}
                name={players[role]}
                isClickable={isReceiveClickable}
                isSelected={isSelected}
                isDimmed={isDimmed}
              />
            </button>
          );
        })}

        {tab === "receive" && isDesktop && selectedToken && (
          <div
            className="absolute z-[70] w-[300px] max-w-[85vw] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white/95 p-4 text-left shadow-2xl backdrop-blur"
            style={{
              left: `${Math.min(86, Math.max(14, selectedToken.x))}%`,
              top: `${Math.min(85, Math.max(14, selectedToken.y - 18))}%`,
            }}
          >
            <button
              type="button"
              onClick={onCloseSelected}
              className="absolute right-2 top-2 rounded-md px-2 py-1 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            >
              Close
            </button>
            {insightPanel}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileBottomSheet({
  selectedToken,
  onClose,
  insightPanel,
}: {
  selectedToken: SelectedToken;
  onClose: () => void;
  insightPanel: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[90] md:hidden">
      <button
        type="button"
        aria-label="Close player details"
        className="absolute inset-0 bg-zinc-950/45"
        onClick={onClose}
      />

      <div className="sheet-enter absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-zinc-300" />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-600">
            Receive Planner
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            Close
          </button>
        </div>

        <div data-player={selectedToken.role}>{insightPanel}</div>
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

  const playTimers = useRef<number[]>([]);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const ready = !!players;

  const {
    receivePhase,
    selectedToken,
    selectedInsight,
    focusedRole,
    zoneAnimation,
    movementAnimation,
    choosePlayer,
    chooseInsight,
    closeInsights,
    onPlayPressed,
    onResetPressed,
  } = useReceiveModeInsights({ tab, rotation });

  React.useEffect(() => {
    return () => {
      playTimers.current.forEach((timer) => window.clearTimeout(timer));
      playTimers.current = [];
    };
  }, []);

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const allFilled = (Object.keys(form) as RoleKey[]).every(
      (key) => form[key].trim().length > 0,
    );
    if (!allFilled) {
      alert("Please enter all 7 player names.");
      return;
    }
    setPlayers(form);
  }

  function clearPlayTimers() {
    playTimers.current.forEach((timer) => window.clearTimeout(timer));
    playTimers.current = [];
  }

  function playDemo() {
    if (isPlaying) return;

    clearPlayTimers();
    onPlayPressed();
    setIsPlaying(true);

    playTimers.current.push(
      window.setTimeout(() => {
        setIsPlaying(false);
      }, 3000),
    );
  }

  function handleResetPositions() {
    if (resetPosition) return;

    clearPlayTimers();
    onResetPressed();
    setResetPosition(true);
    setTimeout(() => setResetPosition(false), 2500);
  }

  const phaseText =
    receivePhase === "before" ? "Before Recieve" : "After Recieve";

  const insightPanel =
    selectedToken && tab === "receive" ? (
      <PlayerInsightContent
        role={selectedToken.role}
        name={selectedToken.name}
        selectedInsight={selectedInsight}
        onChooseInsight={chooseInsight}
      />
    ) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 sm:p-4">
      <div className="mx-auto w-full max-w-[560px] px-4 py-6">
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
                    className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-400"
                    placeholder={`Type ${label} name...`}
                    value={form[key]}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end pt-2">
              <button className="rounded-full bg-indigo-600 px-4 py-2 font-semibold text-white shadow hover:shadow-md">
                Start
              </button>
            </div>
          </form>
        )}

        {ready && players && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-2 shadow-sm sm:flex sm:items-center sm:justify-between">
              <div
                className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 sm:pb-0"
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
                    className={`shrink-0 snap-center rounded-full border px-4 py-2 text-sm font-semibold transition-all sm:text-base ${
                      tab === key
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-2 text-center text-sm font-semibold text-zinc-700 sm:mt-0 sm:text-right sm:text-base">
                Rotation <span className="text-indigo-700">{rotation}</span>
              </div>
            </div>

            {tab === "receive" && (
              <div className="mt-0 flex flex-wrap items-center justify-center gap-2 rounded-md bg-white p-2 shadow-md">
                <button
                  onClick={playDemo}
                  disabled={isPlaying || resetPosition}
                  className={`rounded-full px-6 py-2 font-semibold text-white shadow ${
                    isPlaying || resetPosition
                      ? "bg-gray-400"
                      : "bg-yellow-500 hover:bg-yellow-400"
                  }`}
                >
                  {isPlaying ? "Playing..." : "Play"}
                </button>

                <button
                  onClick={handleResetPositions}
                  disabled={resetPosition || isPlaying}
                  className={`rounded-full px-6 py-2 font-semibold text-white shadow ${
                    resetPosition || isPlaying
                      ? "bg-gray-400"
                      : "bg-blue-500 hover:bg-blue-400"
                  }`}
                >
                  {resetPosition ? "Resetting..." : "Reset"}
                </button>

                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {phaseText}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <Court
                tab={tab}
                rotation={rotation}
                players={players}
                isPlaying={isPlaying}
                resetPosition={resetPosition}
                selectedToken={selectedToken}
                choosePlayer={choosePlayer}
                zoneAnimation={zoneAnimation}
                movementAnimation={movementAnimation}
                focusedRole={focusedRole}
                isDesktop={isDesktop}
                onCloseSelected={closeInsights}
                insightPanel={insightPanel}
              />
            </div>

            {tab === "receive" &&
              !isDesktop &&
              selectedToken &&
              insightPanel && (
                <MobileBottomSheet
                  selectedToken={selectedToken}
                  onClose={closeInsights}
                  insightPanel={insightPanel}
                />
              )}

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setRotation((r) => ((r - 2 + 6) % 6) + 1)}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700"
              >
                Prev
              </button>
              <div className="text-center text-xs text-zinc-500">
                Pick a player, choose zone or movement, then watch the
                animation.
              </div>
              <button
                onClick={() => setRotation((r) => (r % 6) + 1)}
                className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white"
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
