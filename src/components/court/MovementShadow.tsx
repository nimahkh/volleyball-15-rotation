import React, { useState } from "react";
import type { Point, RoleKey } from "../../constants/roles";

export function MovementShadow({
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

  const shortName = movement.name.length > 10 ? `${movement.name.slice(0, 9)}…` : movement.name;

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
