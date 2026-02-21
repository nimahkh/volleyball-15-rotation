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

export const RECEIVE_GUIDANCE: Record<RoleKey, RoleReceiveGuide> = {
  OH1: {
    zone: {
      before: {
        primary: "Primary passer lane in left-back seam (zones 5/6 seam).",
        focus: [
          "Hold 3-pass spacing with Libero and OH2.",
          "Protect deep line first, then collapse to seam.",
          "Keep approach path open to left pin (zone 4).",
        ],
        availability: [
          "If Libero takes more court, narrow to deep-left only.",
          "If short serve pressure increases, step half-court forward.",
        ],
      },
      after: {
        primary:
          "Transition defense to left-front wing and cover tips in zone 4/5 corridor.",
        focus: [
          "Block/defend left channel against cross-court swings.",
          "Cover setter when ball is out-of-system.",
          "Retake left-pin attack lane quickly.",
        ],
        availability: [
          "If late to transition, prioritize backcourt dig angle first.",
          "If MB closes late, hold wider wing defense longer.",
        ],
      },
    },
    movement: {
      before: {
        primary: "Pass then release to 4-step outside approach window.",
        focus: [
          "Pass platform early and square to setter target.",
          "Open left shoulder and drop for outside approach rhythm.",
          "Call shot option before final two steps.",
        ],
        availability: [
          "If first contact is off-net, prepare high-ball tempo.",
          "If pass is perfect, accelerate for faster tempo 2nd-ball option.",
        ],
      },
      after: {
        primary:
          "Dig-block transition: defend, then re-approach outside or pipe support.",
        focus: [
          "Read hitter arm and release before defender-contact.",
          "Rebuild approach depth after each defensive touch.",
          "Cover tips if opposite side block is late.",
        ],
        availability: [
          "If exhausted in long rally, call for emergency high-ball only.",
          "If setter digs first ball, become bailout attacker immediately.",
        ],
      },
    },
  },
  OH2: {
    zone: {
      before: {
        primary:
          "Support primary receive in right-back/middle seam (zones 1/6 seam).",
        focus: [
          "Maintain spacing opposite OH1 and Libero.",
          "Protect short seam serve while keeping attack lane open.",
          "Shade toward server tendency on float/jump spin.",
        ],
        availability: [
          "If Opp is hidden from passing, widen to absorb extra seam.",
          "If Libero tracks deep seam, shift one step short.",
        ],
      },
      after: {
        primary: "Defend right-half transitions and cover setter dump lane.",
        focus: [
          "Close dig seam between right-back and middle-back.",
          "Help on block coverage when Opp attacks.",
          "Track deep line balls into zone 1.",
        ],
        availability: [
          "If back-row attacker is active, hold deeper base.",
          "If front-row block is stable, step into seam earlier.",
        ],
      },
    },
    movement: {
      before: {
        primary:
          "Pass-release sequence to left pin support or back-row attack prep.",
        focus: [
          "Finish pass and pivot into transition steps.",
          "Present as safety attacking option when OH1 is occupied.",
          "Communicate free-ball responsibility early.",
        ],
        availability: [
          "If pass is poor, prioritize coverage and reset line.",
          "If setter is forced off net, offer high-ball option.",
        ],
      },
      after: {
        primary:
          "Continue dig-to-attack transitions with controlled approach depth.",
        focus: [
          "Hold defensive posture before initiating approach.",
          "Attack transition ball from available seam.",
          "Recycle quickly after block touches.",
        ],
        availability: [
          "If OH1 is unavailable, carry more terminal attack load.",
          "If rally extends, favor controlled roll-shot options.",
        ],
      },
    },
  },
  Opp: {
    zone: {
      before: {
        primary:
          "Minimize receive load; hold right-front/right-back attack readiness corridor.",
        focus: [
          "Stay available for first transition set on the right pin.",
          "Protect short-right balls if passing pattern collapses.",
          "Maintain block assignment awareness.",
        ],
        availability: [
          "If team uses 4-pass pattern, take only short zone 1 balls.",
          "If setter starts in back row, stay wide for outlet set.",
        ],
      },
      after: {
        primary:
          "Primary right-side terminal attacker and line defender transition.",
        focus: [
          "Close block on opponent OH lane.",
          "Drop quickly to defend tips behind block.",
          "Recover for right-pin or bic-support options.",
        ],
        availability: [
          "If block commit is late, prioritize deep-line defense first.",
          "If setter defends first ball, call high right-side tempo.",
        ],
      },
    },
    movement: {
      before: {
        primary: "Hold approach spacing for fast right-side transition swing.",
        focus: [
          "Delay movement until pass quality is clear.",
          "Approach from right sideline with clear setter vision.",
          "Be first out-of-system option when pass drifts.",
        ],
        availability: [
          "If serve targets deep zone 1, absorb ball then reset quickly.",
          "If MB runs front quick, delay to create one-on-one block.",
        ],
      },
      after: {
        primary:
          "Block-defend-attack cycle from right side with tempo variation.",
        focus: [
          "Land block balanced and transition immediately.",
          "Choose line, seam, or roll based on defense read.",
          "Recycle to coverage when attack is recycled.",
        ],
        availability: [
          "If jump load is high, use controlled off-speed solutions.",
          "If left-side offense is hot, act more as stabilizing outlet.",
        ],
      },
    },
  },
  Setter: {
    zone: {
      before: {
        primary:
          "Start hidden from heavy passing; move to target zone (2.5/3).",
        focus: [
          "Avoid overlap faults while keeping passing lanes clean.",
          "Track serve trajectory and arrive square to net.",
          "Call first-tempo options as soon as pass trajectory is known.",
        ],
        availability: [
          "If first ball is tight, prepare emergency jump set or dump reset.",
          "If pass is off-net, prioritize stable high-ball distribution.",
        ],
      },
      after: {
        primary:
          "Defensive responsibility shifts to right-back/right-front support channel.",
        focus: [
          "Cover attacker after each set.",
          "Defend short tips in setter zone.",
          "Rebuild base to re-run offense quickly.",
        ],
        availability: [
          "If setter digs first ball, second contact is delegated.",
          "If blocking assignment forces front-row commit, communicate release early.",
        ],
      },
    },
    movement: {
      before: {
        primary:
          "Release from serve-receive start into offensive target with balanced footwork.",
        focus: [
          "Use crossover/open step depending start location.",
          "Set MB tempo first when pass quality permits.",
          "Keep hips neutral to hide distribution.",
        ],
        availability: [
          "If pass is tight, convert to bump set with controlled arc.",
          "If pass is perfect, run quick + pin combination.",
        ],
      },
      after: {
        primary: "Defend then re-enter offense flow for next contact cycle.",
        focus: [
          "Cover hitter then rebound to target zone.",
          "Prioritize ball control over tempo during scramble.",
          "Signal emergency hitter order when out-of-system.",
        ],
        availability: [
          "If defender takes second ball, transition to attacker coverage.",
          "If rally becomes free-ball, reset full offensive spread.",
        ],
      },
    },
  },
  MB1: {
    zone: {
      before: {
        primary:
          "Minimal passing responsibility; protect short middle and prepare first-tempo attack.",
        focus: [
          "Hold off-net lane to avoid crowding passers.",
          "Read server while staying available for quick transition.",
          "Communicate seam closures with Setter/OH.",
        ],
        availability: [
          "If serving team targets middle short, take emergency first ball.",
          "If Libero replaces you, communicate block tendencies from bench.",
        ],
      },
      after: {
        primary: "Middle-front blocking anchor and quick transition defender.",
        focus: [
          "Close first blocker seam with pin blocker.",
          "Release from block to quick attack lane.",
          "Protect short tips in zone 3 corridor.",
        ],
        availability: [
          "If late off block, prioritize front-court defense then re-attack.",
          "If front-row mismatches appear, run decoy quicks.",
        ],
      },
    },
    movement: {
      before: {
        primary: "Track pass, then transition quickly for tempo-1 options.",
        focus: [
          "Open hips to setter and hold quick-attack window.",
          "Be ready for short quick in front of setter.",
          "Use delayed route if pass is off net.",
        ],
        availability: [
          "If pass drifts, convert to long route near OH lane.",
          "If right-side block overcommits, call slide behind setter.",
        ],
      },
      after: {
        primary:
          "Defend first, then choose slide, long, or short transition attack.",
        focus: [
          "Block-read and land balanced before approach.",
          "Slide attack behind setter when lane is open.",
          "Run long or short quick depending set tempo and matchup.",
        ],
        availability: [
          "If transition is late, become decoy and re-form block.",
          "If setter is out-of-system, prioritize coverage and recycle.",
        ],
      },
    },
  },
  MB2: {
    zone: {
      before: {
        primary:
          "Mirror MB1 responsibilities with short-middle defensive readiness.",
        focus: [
          "Stay clear of primary passing seams.",
          "Prepare to front quick if pass is positive.",
          "Track opponent middle tendencies for first block read.",
        ],
        availability: [
          "If Libero replaces you, relay middle attack reads to active blocker.",
          "If short serve pressure appears, absorb emergency second seam.",
        ],
      },
      after: {
        primary: "Anchor middle block transitions and protect zone-3 tips.",
        focus: [
          "Close middle seam on opponent fast offense.",
          "Transition rapidly to central quick attack lane.",
          "Help coverage on recycled touches.",
        ],
        availability: [
          "If late to close block, keep middle-back channel compact.",
          "If offense is stretched, run decoy to isolate pins.",
        ],
      },
    },
    movement: {
      before: {
        primary: "Fast read-release movement into quick-tempo windows.",
        focus: [
          "Square to setter while tracking pass depth.",
          "Run short first if pass is tight to target.",
          "Expand to long route when setter drifts.",
        ],
        availability: [
          "If front quick is closed, transition into slide timing behind setter.",
          "If back-row setter contact occurs, hold for high free-ball response.",
        ],
      },
      after: {
        primary: "Repeat block-defend-quick cycle with tempo adjustments.",
        focus: [
          "Read opponent set, commit block, then release.",
          "Select slide, long, or short route by defensive spacing.",
          "Recover to center block base after every swing.",
        ],
        availability: [
          "If rally pace increases, favor safest quick route.",
          "If approach lane is congested, become coverage first.",
        ],
      },
    },
  },
  Libero: {
    zone: {
      before: {
        primary:
          "Primary receive captain covering largest seam by server tendency.",
        focus: [
          "Own deep-seam command with OH support.",
          "Adjust one step at a time based on serve pattern.",
          "Prioritize quality pass to setter target zone.",
        ],
        availability: [
          "If short float serves increase, step forward and release back quickly.",
          "If OH struggles, absorb more lane and simplify calls.",
        ],
      },
      after: {
        primary:
          "Lead backcourt defense and first-contact stability in rally phase.",
        focus: [
          "Set dig depth by hitter angle and blocker funnel.",
          "Take second contact if setter defends first ball.",
          "Reset receive-like shape for free-ball transitions.",
        ],
        availability: [
          "If backcourt is stretched, protect high-probability seam first.",
          "If teammate loses balance, call and absorb extra court.",
        ],
      },
    },
    movement: {
      before: {
        primary:
          "Read serve toss and move early into balanced passing platform.",
        focus: [
          "Micro-adjust with shuffle, keep shoulders to target.",
          "Deliver consistent arc for first-tempo options.",
          "Recover immediately for defensive transition.",
        ],
        availability: [
          "If serve is aggressive topspin, drop depth before contact.",
          "If float serve dies short, use controlled forward lunge.",
        ],
      },
      after: {
        primary: "Dig, cover, and emergency-setting movement chain.",
        focus: [
          "Lead pursuit on deflections and soft blocks.",
          "Transition into emergency set when setter takes first ball.",
          "Reset base quickly after each touch.",
        ],
        availability: [
          "If middle is late, fill short-middle dig channel.",
          "If long rally fatigue appears, prioritize high-quality first contacts.",
        ],
      },
    },
  },
};

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
