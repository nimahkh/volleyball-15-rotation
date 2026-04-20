import { useRef, useState } from "react";

type TeamSide = "team" | "opponent";

type BoardChip = {
  id: string;
  side: TeamSide;
  label: string;
  detail: string;
  x: number;
  y: number;
};

type DragState = {
  chipId: string;
  pointerId: number;
};

type CourtPoint = {
  x: number;
  y: number;
};

type DrawLine = {
  id: string;
  side: TeamSide;
  points: CourtPoint[];
};

type DrawState = {
  lineId: string;
  pointerId: number;
  side: TeamSide;
};

const BASE_CHIPS: BoardChip[] = [
  { id: "team-oh1", side: "team", label: "OH1", detail: "Left pin", x: 22, y: 70 },
  { id: "team-mb1", side: "team", label: "MB1", detail: "Middle", x: 50, y: 70 },
  { id: "team-op", side: "team", label: "OPP", detail: "Right pin", x: 78, y: 70 },
  { id: "team-oh2", side: "team", label: "OH2", detail: "Left back", x: 22, y: 88 },
  { id: "team-s", side: "team", label: "S", detail: "Setter", x: 50, y: 88 },
  { id: "team-l", side: "team", label: "L", detail: "Libero", x: 78, y: 88 },
  { id: "opp-lb", side: "opponent", label: "LB", detail: "Left back", x: 22, y: 12 },
  { id: "opp-cb", side: "opponent", label: "CB", detail: "Middle back", x: 50, y: 12 },
  { id: "opp-rb", side: "opponent", label: "RB", detail: "Right back", x: 78, y: 12 },
  { id: "opp-lf", side: "opponent", label: "LF", detail: "Left front", x: 22, y: 30 },
  { id: "opp-mf", side: "opponent", label: "MF", detail: "Middle front", x: 50, y: 30 },
  { id: "opp-rf", side: "opponent", label: "RF", detail: "Right front", x: 78, y: 30 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPointFromEvent(
  event: React.PointerEvent,
  element: HTMLElement,
): { x: number; y: number } {
  const rect = element.getBoundingClientRect();

  return {
    x: clamp(((event.clientX - rect.left) / rect.width) * 100, 6, 94),
    y: clamp(((event.clientY - rect.top) / rect.height) * 100, 5, 95),
  };
}

function getSideFromPoint(point: CourtPoint): TeamSide {
  return point.y >= 50 ? "team" : "opponent";
}

function keepPointOnSide(point: CourtPoint, side: TeamSide): CourtPoint {
  return {
    x: point.x,
    y: side === "team" ? clamp(point.y, 53, 95) : clamp(point.y, 5, 47),
  };
}

export function CoachStrategyPage({
  isDark,
  onBack,
}: {
  isDark: boolean;
  onBack: () => void;
}) {
  const courtRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const lineCounterRef = useRef(0);
  const [chips, setChips] = useState<BoardChip[]>(BASE_CHIPS);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [isDrawingEnabled, setDrawingEnabled] = useState(false);
  const [drawLines, setDrawLines] = useState<DrawLine[]>([]);
  const [showOpponents, setShowOpponents] = useState(true);

  const visibleChips = showOpponents
    ? chips
    : chips.filter((chip) => chip.side === "team");

  function moveChip(chipId: string, point: { x: number; y: number }) {
    setChips((current) =>
      current.map((chip) => (chip.id === chipId ? { ...chip, ...point } : chip)),
    );
  }

  function startDrag(chip: BoardChip, event: React.PointerEvent<HTMLButtonElement>) {
    const court = courtRef.current;
    if (!court) return;

    court.setPointerCapture(event.pointerId);
    setActiveChipId(chip.id);
    setDragState({ chipId: chip.id, pointerId: event.pointerId });
    dragStartRef.current = { id: chip.id, x: chip.x, y: chip.y };
    moveChip(chip.id, keepPointOnSide(getPointFromEvent(event, court), chip.side));
  }

  function startDrawing(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDrawingEnabled || dragState || !courtRef.current) return;

    const point = getPointFromEvent(event, courtRef.current);
    const side = getSideFromPoint(point);
    const boundedPoint = keepPointOnSide(point, side);
    lineCounterRef.current += 1;
    const lineId = `line-${lineCounterRef.current}`;

    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveChipId(null);
    setDrawState({ lineId, pointerId: event.pointerId, side });
    setDrawLines((current) => [
      ...current,
      {
        id: lineId,
        side,
        points: [boundedPoint],
      },
    ]);
  }

  function movePointer(event: React.PointerEvent<HTMLDivElement>) {
    if (drawState && drawState.pointerId === event.pointerId && courtRef.current) {
      const point = keepPointOnSide(
        getPointFromEvent(event, courtRef.current),
        drawState.side,
      );

      setDrawLines((current) =>
        current.map((line) =>
          line.id === drawState.lineId
            ? { ...line, points: [...line.points, point] }
            : line,
        ),
      );
      return;
    }

    if (!dragState || dragState.pointerId !== event.pointerId || !courtRef.current) {
      return;
    }

    const chip = chips.find((currentChip) => currentChip.id === dragState.chipId);
    if (!chip) return;

    moveChip(chip.id, keepPointOnSide(getPointFromEvent(event, courtRef.current), chip.side));
  }

  function endPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (drawState && drawState.pointerId === event.pointerId) {
      const court = courtRef.current;
      if (court?.hasPointerCapture(event.pointerId)) {
        court.releasePointerCapture(event.pointerId);
      }
      setDrawState(null);
      return;
    }

    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const court = courtRef.current;
    dragStartRef.current = null;
    setDragState(null);
    setActiveChipId(null);

    if (court?.hasPointerCapture(event.pointerId)) {
      court.releasePointerCapture(event.pointerId);
    }

    if (court?.hasPointerCapture(event.pointerId)) {
      court.releasePointerCapture(event.pointerId);
    }
  }

  function resetBoard() {
    setChips(BASE_CHIPS);
    setDrawLines([]);
    setActiveChipId(null);
    setDragState(null);
    setDrawState(null);
  }

  return (
    <main
      className={`min-h-screen ${
        isDark
          ? "bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(180deg,_#020617,_#0f172a)] text-white"
          : "bg-[linear-gradient(180deg,_#ecfeff,_#f8fafc_44%,_#e0f2fe)] text-slate-950"
      }`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-3 pb-4 pt-3">
        <header className="flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Back to rotation helper"
            onClick={onBack}
            className={`rounded-full px-4 py-2 text-sm font-black ${
              isDark
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-white text-slate-800 shadow-sm"
            }`}
          >
            Back
          </button>
          <div className="text-right">
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-500">
              Coach Board
            </div>
            <h1 className="text-xl font-black leading-tight">Strategy court</h1>
          </div>
        </header>

        <section
          className={`mt-3 rounded-[2rem] border p-3 shadow-2xl ${
            isDark
              ? "border-white/10 bg-white/5 shadow-black/30"
              : "border-white bg-white/80 shadow-sky-200/70 backdrop-blur"
          }`}
        >
          <div
            ref={courtRef}
            aria-label="Coach strategy volleyball court"
            onPointerDown={startDrawing}
            onPointerMove={movePointer}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            className="relative mx-auto aspect-[9/16] max-h-[64vh] min-h-[520px] w-full overflow-hidden rounded-[2rem] border-4 border-sky-900/70 bg-[linear-gradient(180deg,_#fde68a_0%,_#fef3c7_50%,_#fde68a_100%)] shadow-inner touch-none"
          >
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-sky-950/60" />
            <div className="absolute inset-x-0 top-[12%] h-0.5 bg-sky-950/35" />
            <div className="absolute inset-x-0 top-[38%] h-0.5 bg-sky-950/30" />
            <div className="absolute inset-x-0 top-[62%] h-0.5 bg-sky-950/30" />
            <div className="absolute inset-x-0 top-[88%] h-0.5 bg-sky-950/35" />
            <div className="absolute inset-y-0 left-1/3 w-0.5 bg-sky-950/20" />
            <div className="absolute inset-y-0 right-1/3 w-0.5 bg-sky-950/20" />
            <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              Opponent
            </div>
            <div className="absolute bottom-3 left-3 rounded-full bg-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              Your team
            </div>

            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {drawLines.map((line) => (
                <polyline
                  key={line.id}
                  fill="none"
                  points={line.points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ")}
                  stroke={line.side === "team" ? "#2563eb" : "#dc2626"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {visibleChips.map((chip) => (
              <button
                type="button"
                key={chip.id}
                aria-label={`${chip.detail} ${chip.label}`}
                onPointerDown={(event) => startDrag(chip, event)}
                disabled={isDrawingEnabled}
                className={`absolute z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 select-none touch-none flex-col items-center justify-center rounded-full border-2 text-center shadow-lg transition-transform active:scale-110 ${
                  chip.side === "team"
                    ? "border-blue-900 bg-blue-600 text-white"
                    : "border-red-900 bg-red-600 text-white"
                } ${activeChipId === chip.id ? "ring-4 ring-white/80" : ""} ${
                  isDrawingEnabled ? "pointer-events-none opacity-90" : ""
                }`}
                style={{ left: `${chip.x}%`, top: `${chip.y}%` }}
              >
                <span className="text-sm font-black leading-none">{chip.label}</span>
                <span className="mt-0.5 text-[9px] font-bold opacity-80">
                  {chip.side === "team" ? "US" : "OPP"}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={isDrawingEnabled}
              onClick={() => {
                setDrawingEnabled((current) => !current);
                setDragState(null);
                setActiveChipId(null);
              }}
              className={`rounded-2xl px-3 py-3 text-sm font-black ${
                isDrawingEnabled
                  ? "bg-emerald-600 text-white"
                  : isDark
                    ? "bg-white/10 text-slate-200"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {isDrawingEnabled ? "Drawing On" : "Draw Lines"}
            </button>
            <button
              type="button"
              onClick={() => setShowOpponents((current) => !current)}
              className={`rounded-2xl px-3 py-3 text-sm font-black ${
                showOpponents
                  ? "bg-red-600 text-white"
                  : isDark
                    ? "bg-white/10 text-slate-200"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {showOpponents ? "Hide Opponent" : "Show Opponent"}
            </button>
            <button
              type="button"
              onClick={() => setDrawLines([])}
              className={`rounded-2xl px-3 py-3 text-sm font-black ${
                isDark ? "bg-white/10 text-slate-200" : "bg-slate-100 text-slate-700"
              }`}
            >
              Clear Lines
            </button>
            <button
              type="button"
              onClick={resetBoard}
              className="rounded-2xl bg-blue-700 px-3 py-3 text-sm font-black text-white"
            >
              Reset Board
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
