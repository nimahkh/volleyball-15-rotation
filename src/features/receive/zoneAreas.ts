type ZoneArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export const ZONE_AREAS = {
  POSITION_3: { x: 40, y: 30, width: 50, height: 20, label: "Position 3" },
  FULL_NET: { x: 50, y: 10, width: 80, height: 10, label: "Full Net" },
  POSITION_5_BELOW_MB: {
    x: 20,
    y: 68,
    width: 28,
    height: 50,
    label: "Position 5 + below MB",
  },
  POSITION_5_4: {
    x: 20,
    y: 50,
    width: 28,
    height: 80,
    label: "Position 5 + below MB",
  },
  END_LINE_FULL_6_WIDE: {
    x: 50,
    y: 70,
    width: 54,
    height: 50,
    label: "End line + full 6",
  },
  POSITIONS_2_1: {
    x: 78,
    y: 50,
    width: 24,
    height: 52,
    label: "Positions 2 and 1",
  },
  RIGHT_NET: { x: 80, y: 10, width: 40, height: 10, label: "Right Net" },
  LEFT_NET: { x: 30, y: 10, width: 40, height: 10, label: "Left Net" },
  NET: { x: 80, y: 10, width: 40, height: 10, label: "Net" },
  POSITION_4: { x: 20, y: 20, width: 24, height: 24, label: "Position 4" },
  POSITION_1: { x: 78, y: 50, width: 24, height: 52, label: "Position 1" },
  END_LINE_FULL_6_MEDIUM: {
    x: 50,
    y: 70,
    width: 60,
    height: 30,
    label: "End line + full 6",
  },
  POSITION_5_BELOW_MB_ALT: {
    x: 20,
    y: 68,
    width: 28,
    height: 50,
    label: "Position 5 + below MB",
  },
  POSITIONS_4_5: {
    x: 20,
    y: 50,
    width: 24,
    height: 52,
    label: "Positions 4 and 5",
  },
} as const satisfies Record<string, ZoneArea>;
