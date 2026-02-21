import type { Point, ReceivePhase, RoleKey } from "../../constants/roles";
import { MOVEMENT_POINTS } from "./movementPoints";
import { ZONE_AREAS } from "./zoneAreas";

export type RoleInsightBlock = {
  primary: string;
  focus: string[];
  availability: string[];
};

export type RoleReceiveGuide = {
  zone: Record<ReceivePhase, RoleInsightBlock>;
  movement: Record<ReceivePhase, RoleInsightBlock>;
};

export type ZoneCoverage = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

export type ZoneTemplate = {
  width: number;
  height: number;
  label: string;
};

type RotationRoleOverrides = Partial<
  Record<
    RoleKey,
    {
      zone?: Partial<Record<ReceivePhase, ZoneCoverage>>;
      movement?: Partial<Record<ReceivePhase, Point>>;
    }
  >
>;

export const RECEIVE_ZONE_TEMPLATES: Record<
  RoleKey,
  Record<ReceivePhase, ZoneTemplate>
> = {
  OH1: {
    before: { width: 30, height: 24, label: "OH1 coverage" },
    after: { width: 30, height: 30, label: "OH1 transition defense" },
  },
  OH2: {
    before: { width: 30, height: 24, label: "OH2 coverage" },
    after: { width: 30, height: 30, label: "OH2 transition defense" },
  },
  Opp: {
    before: { width: 24, height: 24, label: "Opp right-side coverage" },
    after: { width: 24, height: 36, label: "Opp line + tip defense" },
  },
  Setter: {
    before: { width: 20, height: 18, label: "Setter target zone" },
    after: { width: 24, height: 26, label: "Setter defensive lane" },
  },
  MB1: {
    before: { width: 26, height: 20, label: "Middle short coverage" },
    after: { width: 26, height: 30, label: "Middle block channel" },
  },
  MB2: {
    before: { width: 26, height: 20, label: "Middle short coverage" },
    after: { width: 26, height: 30, label: "Middle block channel" },
  },
  Libero: {
    before: { width: 56, height: 24, label: "Libero receive coverage" },
    after: { width: 50, height: 28, label: "Libero backcourt command" },
  },
};

export const RECEIVE_MOVEMENT_TARGETS: Record<
  RoleKey,
  Record<ReceivePhase, Point>
> = {
  OH1: {
    before: MOVEMENT_POINTS.OH1_BEFORE,
    after: MOVEMENT_POINTS.OH1_AFTER,
  },
  OH2: {
    before: MOVEMENT_POINTS.OH2_BEFORE,
    after: MOVEMENT_POINTS.OH2_AFTER,
  },
  Opp: {
    before: MOVEMENT_POINTS.OPP_BEFORE,
    after: MOVEMENT_POINTS.OPP_AFTER,
  },
  Setter: {
    before: MOVEMENT_POINTS.SETTER_BEFORE,
    after: MOVEMENT_POINTS.SETTER_AFTER,
  },
  MB1: {
    before: MOVEMENT_POINTS.MB1_BEFORE,
    after: MOVEMENT_POINTS.MB1_AFTER,
  },
  MB2: {
    before: MOVEMENT_POINTS.MB2_BEFORE,
    after: MOVEMENT_POINTS.MB2_AFTER,
  },
  Libero: {
    before: MOVEMENT_POINTS.LIBERO_BEFORE,
    after: MOVEMENT_POINTS.LIBERO_AFTER,
  },
};

export const RECEIVE_ROTATION_OVERRIDES: Partial<
  Record<number, RotationRoleOverrides>
> = {
  1: {
    MB2: {
      zone: {
        before: ZONE_AREAS.POSITION_3,
        after: ZONE_AREAS.FULL_NET,
      },
      movement: {
        before: MOVEMENT_POINTS.MIDDLE_APPROACH,
      },
    },
    OH2: {
      zone: {
        before: ZONE_AREAS.POSITION_5_BELOW_MB,
        after: ZONE_AREAS.END_LINE_FULL_6_WIDE,
      },
      movement: {
        before: MOVEMENT_POINTS.CENTER_BACK,
        after: MOVEMENT_POINTS.CENTER_MID_BACK,
      },
    },
    OH1: {
      zone: {
        before: ZONE_AREAS.POSITIONS_2_1,
        after: ZONE_AREAS.NET,
      },
      movement: {
        before: MOVEMENT_POINTS.RIGHT_ATTACK,
        after: MOVEMENT_POINTS.RIGHT_ATTACK,
      },
    },
    Setter: {
      zone: {
        after: ZONE_AREAS.POSITIONS_2_1,
      },
      movement: {
        after: MOVEMENT_POINTS.SETTER_SHORT_RIGHT,
      },
    },
    Opp: {
      zone: {
        before: ZONE_AREAS.POSITION_4,
        after: ZONE_AREAS.LEFT_NET,
      },
      movement: {
        before: MOVEMENT_POINTS.LEFT_ATTACK,
        after: MOVEMENT_POINTS.LEFT_ATTACK,
      },
    },
    Libero: {
      zone: {
        before: ZONE_AREAS.END_LINE_FULL_6_WIDE,
        after: ZONE_AREAS.POSITION_5_BELOW_MB_ALT,
      },
      movement: {
        before: MOVEMENT_POINTS.LEFT_BACK,
        after: MOVEMENT_POINTS.LEFT_BACK,
      },
    },
  },
  2: {
    OH2: {
      zone: {
        before: ZONE_AREAS.POSITIONS_4_5,
        after: ZONE_AREAS.LEFT_NET,
      },
      movement: {
        before: MOVEMENT_POINTS.LEFT_ATTACK,
        after: MOVEMENT_POINTS.LEFT_ATTACK,
      },
    },
    MB2: {
      zone: {
        after: ZONE_AREAS.FULL_NET,
      },
    },
    OH1: {
      zone: {
        before: ZONE_AREAS.POSITION_1,
        after: ZONE_AREAS.END_LINE_FULL_6_MEDIUM,
      },
      movement: {
        before: MOVEMENT_POINTS.CENTER_MID,
        after: MOVEMENT_POINTS.CENTER_MID,
      },
    },
    Libero: {
      zone: {
        before: ZONE_AREAS.END_LINE_FULL_6_WIDE,
        after: ZONE_AREAS.POSITION_5_BELOW_MB_ALT,
      },
      movement: {
        before: MOVEMENT_POINTS.LEFT_BACK,
        after: MOVEMENT_POINTS.LEFT_BACK_INNER,
      },
    },
    Opp: {
      zone: {
        after: ZONE_AREAS.RIGHT_NET,
      },
      movement: {
        after: MOVEMENT_POINTS.RIGHT_ATTACK,
      },
    },
    Setter: {
      zone: {
        after: ZONE_AREAS.POSITION_1,
      },
      movement: {
        after: MOVEMENT_POINTS.SETTER_RIGHT_20,
      },
    },
  },
  3: {
    Opp: {
      movement: {
        after: MOVEMENT_POINTS.RIGHT_ATTACK,
      },
      zone: {
        after: ZONE_AREAS.RIGHT_NET,
      },
    },
    MB1: {
      zone: {
        after: ZONE_AREAS.FULL_NET,
      },
    },
    OH2: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_ATTACK,
        after: MOVEMENT_POINTS.LEFT_ATTACK,
      },
      zone: {
        before: ZONE_AREAS.POSITION_5_BELOW_MB,
        after: ZONE_AREAS.LEFT_NET,
      },
    },
    OH1: {
      movement: {
        before: MOVEMENT_POINTS.CENTER_MID_BACK,
        after: MOVEMENT_POINTS.CENTER_MID_BACK,
      },
      zone: {
        before: ZONE_AREAS.END_LINE_FULL_6_WIDE,
        after: ZONE_AREAS.END_LINE_FULL_6_WIDE,
      },
    },
    Libero: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_BACK,
        after: MOVEMENT_POINTS.LEFT_BACK,
      },
      zone: {
        before: ZONE_AREAS.POSITIONS_2_1,
        after: ZONE_AREAS.POSITION_5_BELOW_MB,
      },
    },
    Setter: {
      movement: {
        after: MOVEMENT_POINTS.SETTER_RIGHT_20,
      },
      zone: {
        after: ZONE_AREAS.POSITION_1,
      },
    },
  },
  4: {
    OH2: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_ATTACK,
        after: MOVEMENT_POINTS.LEFT_ATTACK,
      },
      zone: {
        before: ZONE_AREAS.POSITION_5_BELOW_MB,
        after: ZONE_AREAS.LEFT_NET,
      },
    },
    Libero: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_BACK,
        after: MOVEMENT_POINTS.LEFT_BACK,
      },
      zone: {
        before: ZONE_AREAS.POSITIONS_2_1,
        after: ZONE_AREAS.POSITION_5_BELOW_MB,
      },
    },
    OH1: {
      movement: {
        before: MOVEMENT_POINTS.CENTER_MID_BACK,
        after: MOVEMENT_POINTS.CENTER_MID_BACK,
      },
      zone: {
        before: ZONE_AREAS.END_LINE_FULL_6_WIDE,
        after: ZONE_AREAS.END_LINE_FULL_6_WIDE,
      },
    },
    Setter: {
      zone: {
        after: ZONE_AREAS.RIGHT_NET,
      },
      movement: {
        after: MOVEMENT_POINTS.SETTER_RIGHT_20,
      },
    },
    MB1: {
      zone: {
        after: ZONE_AREAS.FULL_NET,
      },
    },
  },
  5: {
    OH2: {
      movement: {
        before: MOVEMENT_POINTS.CENTER_MID_BACK,
        after: MOVEMENT_POINTS.CENTER_MID_BACK,
      },
      zone: {
        before: ZONE_AREAS.POSITIONS_2_1,
        after: ZONE_AREAS.END_LINE_FULL_6_WIDE,
      },
    },
    Libero: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_BACK,
        after: MOVEMENT_POINTS.LEFT_BACK,
      },
      zone: {
        before: ZONE_AREAS.END_LINE_FULL_6_WIDE,
        after: ZONE_AREAS.POSITION_5_BELOW_MB,
      },
    },
    OH1: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_ATTACK,
        after: MOVEMENT_POINTS.LEFT_ATTACK,
      },
      zone: {
        before: ZONE_AREAS.POSITION_5_4,
        after: ZONE_AREAS.LEFT_NET,
      },
    },
    Setter: {
      zone: {
        after: ZONE_AREAS.RIGHT_NET,
      },
      movement: {
        after: MOVEMENT_POINTS.SETTER_RIGHT_20,
      },
    },
    MB1: {
      zone: {
        after: ZONE_AREAS.FULL_NET,
      },
    },
  },
  6: {
    OH2: {
      movement: {
        before: MOVEMENT_POINTS.CENTER_MID_BACK,
        after: MOVEMENT_POINTS.CENTER_MID_BACK,
      },
      zone: {
        before: ZONE_AREAS.END_LINE_FULL_6_WIDE,
        after: ZONE_AREAS.END_LINE_FULL_6_WIDE,
      },
    },
    Libero: {
      movement: {
        before: MOVEMENT_POINTS.LEFT_BACK,
        after: MOVEMENT_POINTS.LEFT_BACK,
      },
      zone: {
        before: ZONE_AREAS.POSITIONS_2_1,
        after: ZONE_AREAS.POSITION_5_4,
      },
    },
    Setter: {
      movement: {
        after: MOVEMENT_POINTS.SETTER_RIGHT_20,
      },
      zone: {
        after: ZONE_AREAS.RIGHT_NET,
      },
    },
    MB2: {
      movement: {
        after: MOVEMENT_POINTS.MB1_AFTER,
      },
      zone: {
        after: ZONE_AREAS.FULL_NET,
      },
    },
    OH1: {
      movement: {
        after: MOVEMENT_POINTS.LEFT_ATTACK,
      },
      zone: {
        before: ZONE_AREAS.POSITION_5_BELOW_MB,
        after: ZONE_AREAS.LEFT_NET,
      },
    },
  },
};
