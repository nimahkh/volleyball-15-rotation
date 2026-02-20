import { createContext } from "react";
import type { Players, TabKey } from "../constants/roles";

export type RotationContextValue = {
  tab: TabKey;
  setTab: React.Dispatch<React.SetStateAction<TabKey>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  players: Players | null;
  setPlayers: React.Dispatch<React.SetStateAction<Players | null>>;
  nextRotation: () => void;
  prevRotation: () => void;
};

export const RotationContext = createContext<RotationContextValue | null>(null);
