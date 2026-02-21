import React, { useMemo, useRef, useState } from "react";
import type {
  InsightView,
  Point,
  ReceivePhase,
  RoleKey,
  TabKey,
} from "../constants/roles";
import {
  RECEIVE_MOVEMENT_TARGETS,
  RECEIVE_ROTATION_OVERRIDES,
  RECEIVE_ZONE_TEMPLATES,
  type ZoneCoverage,
} from "../features/receive/receiveData";

export type SelectedToken = {
  role: RoleKey;
  name: string;
  x: number;
  y: number;
};

type MovementAnimation = {
  from: Point;
  to: Point;
  name: string;
  role: RoleKey;
  runId: number;
};

export function useReceiveModeInsights({
  tab,
  rotation,
}: {
  tab: TabKey;
  rotation: number;
}) {
  const [receivePhase, setReceivePhase] = useState<ReceivePhase>("before");
  const [selectedToken, setSelectedToken] = useState<SelectedToken | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<InsightView | null>(null);
  const [appliedToken, setAppliedToken] = useState<SelectedToken | null>(null);
  const [appliedInsight, setAppliedInsight] = useState<InsightView | null>(null);
  const [movementRunId, setMovementRunId] = useState(0);

  const phaseTimers = useRef<number[]>([]);

  const clearPhaseTimers = React.useCallback(() => {
    phaseTimers.current.forEach((timer) => window.clearTimeout(timer));
    phaseTimers.current = [];
  }, []);

  const closeInsights = React.useCallback(() => {
    setSelectedToken(null);
  }, []);

  const choosePlayer = React.useCallback(
    (token: SelectedToken) => {
      if (tab !== "receive") return;
      setSelectedToken(token);
      setSelectedInsight(null);
    },
    [tab],
  );

  const chooseInsight = React.useCallback((view: InsightView) => {
    if (!selectedToken) return;
    setSelectedInsight(view);
    setAppliedInsight(view);
    setAppliedToken(selectedToken);
    setSelectedToken(null);

    if (view === "movement") {
      setMovementRunId((current) => current + 1);
    }
  }, [selectedToken]);

  const onPlayPressed = React.useCallback(() => {
    clearPhaseTimers();
    setReceivePhase("before");
    setSelectedToken(null);
    setSelectedInsight(null);
    setAppliedToken(null);
    setAppliedInsight(null);

    phaseTimers.current.push(
      window.setTimeout(() => {
        setReceivePhase("after");
      }, 2500),
    );
  }, [clearPhaseTimers]);

  const onResetPressed = React.useCallback(() => {
    clearPhaseTimers();
    setReceivePhase("before");
    setSelectedToken(null);
    setSelectedInsight(null);
    setAppliedToken(null);
    setAppliedInsight(null);
  }, [clearPhaseTimers]);

  React.useEffect(() => {
    if (tab !== "receive") {
      closeInsights();
      setReceivePhase("before");
      setSelectedInsight(null);
      setAppliedToken(null);
      setAppliedInsight(null);
      return;
    }

    closeInsights();
    setReceivePhase("before");
    setSelectedInsight(null);
    setAppliedToken(null);
    setAppliedInsight(null);
  }, [tab, rotation, closeInsights]);

  React.useEffect(() => {
    return () => clearPhaseTimers();
  }, [clearPhaseTimers]);

  const zoneAnimation = useMemo<(ZoneCoverage & { role: RoleKey }) | null>(() => {
    if (tab !== "receive") return null;
    if (!appliedToken || appliedInsight !== "zone") return null;

    const overrideZone =
      RECEIVE_ROTATION_OVERRIDES[rotation]?.[appliedToken.role]?.zone?.[receivePhase];
    const overrideMovement =
      RECEIVE_ROTATION_OVERRIDES[rotation]?.[appliedToken.role]?.movement?.[
        receivePhase
      ];

    const defaultAnchor =
      receivePhase === "before"
        ? { x: appliedToken.x, y: appliedToken.y }
        : overrideMovement ?? RECEIVE_MOVEMENT_TARGETS[appliedToken.role][receivePhase];

    const template = RECEIVE_ZONE_TEMPLATES[appliedToken.role][receivePhase];

    return {
      ...(overrideZone ?? {
        x: defaultAnchor.x,
        y: defaultAnchor.y,
        width: template.width,
        height: template.height,
        label: template.label,
      }),
      role: appliedToken.role,
    };
  }, [tab, appliedToken, appliedInsight, receivePhase, rotation]);

  const movementAnimation = useMemo<MovementAnimation | null>(() => {
    if (tab !== "receive") return null;
    if (!appliedToken || appliedInsight !== "movement") return null;

    const overrideMovement =
      RECEIVE_ROTATION_OVERRIDES[rotation]?.[appliedToken.role]?.movement?.[
        receivePhase
      ];

    return {
      from: { x: appliedToken.x, y: appliedToken.y },
      to: overrideMovement ?? RECEIVE_MOVEMENT_TARGETS[appliedToken.role][receivePhase],
      role: appliedToken.role,
      name: appliedToken.name,
      runId: movementRunId,
    };
  }, [tab, appliedToken, appliedInsight, receivePhase, movementRunId, rotation]);

  const focusedRole = selectedToken?.role ?? appliedToken?.role ?? null;

  return {
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
  };
}
