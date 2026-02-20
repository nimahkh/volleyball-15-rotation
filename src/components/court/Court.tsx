import React, { useState } from "react";
import BALL from "../../assets/ball.webp";
import type { Players, Point, RoleKey, TabKey } from "../../constants/roles";
import { BASE_POSITION_MAP, POSITION_MAP } from "../../features/rotation/positionMaps";
import type { SelectedToken } from "../../hooks/useReceiveModeInsights";
import { MovementShadow } from "./MovementShadow";
import { PlayerChip } from "./PlayerChip";

export function Court({
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
  zoneAnimation: { x: number; y: number; width: number; height: number; label: string } | null;
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
  const [coords, setCoords] = useState<Record<RoleKey, Point>>(POSITION_MAP[tab][rotation]);

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
      const targetLibero = (liberoActive ? allCoords[liberoReplaces()] : allCoords.Libero) ?? {
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
        const cleanupBall = animateBallToLiberoAndBack(POSITION_MAP.receive[rotation]);

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
          <MovementShadow key={movementAnimation.runId} movement={movementAnimation} />
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

          const { x, y } = role === "Libero" && liberoActive ? coords[liberoReplaces()] : coords[role];
          const isReceiveClickable = tab === "receive";
          const isSelected = selectedToken?.role === role;
          const isDimmed = tab === "receive" && focusedRole !== null && focusedRole !== role;

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
