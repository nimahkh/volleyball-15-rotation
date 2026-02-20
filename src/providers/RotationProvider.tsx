import { useMemo, useState } from "react";
import { RotationContext, type RotationContextValue } from "./RotationContext";

export function RotationProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<RotationContextValue["tab"]>("receive");
  const [rotation, setRotation] = useState<number>(1);
  const [players, setPlayers] = useState<RotationContextValue["players"]>(null);

  const value = useMemo<RotationContextValue>(
    () => ({
      tab,
      setTab,
      rotation,
      setRotation,
      players,
      setPlayers,
      nextRotation: () => setRotation((r) => (r % 6) + 1),
      prevRotation: () => setRotation((r) => ((r - 2 + 6) % 6) + 1),
    }),
    [tab, rotation, players],
  );

  return <RotationContext.Provider value={value}>{children}</RotationContext.Provider>;
}
