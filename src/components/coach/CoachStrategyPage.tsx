import { useEffect, useRef, useState } from "react";
import { decodeSharedPayload, encodeSharedPayload } from "./drillSharing";
import { Button } from "../ui/Button";
import { IconButton } from "../ui/IconButton";

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

type DrillScenario =
  | "serve-receive"
  | "free-ball"
  | "transition"
  | "block-defense";

type DrillAudience = "player" | "unit" | "team";
type CoachPanelTab = "builder" | "presets";
type PlaybackMode = "inline" | "cinema";

type DrillStep = {
  id: string;
  title: string;
  instruction: string;
  chips: BoardChip[];
  drawLines: DrawLine[];
};

type DrillDifficulty = "beginner" | "intermediate" | "advanced";

type DrillPreset = {
  id: string;
  title: string;
  description: string;
  difficulty: DrillDifficulty;
  scenario: DrillScenario;
  audience: DrillAudience;
  steps: DrillStep[];
};

type SharedDrillPayload = {
  version: 1;
  title: string;
  scenario: DrillScenario;
  audience: DrillAudience;
  steps: DrillStep[];
};

const BASE_CHIPS: BoardChip[] = [
  { id: "team-oh1", side: "team", label: "OH1", detail: "Zone 4", x: 22, y: 70 },
  { id: "team-mb1", side: "team", label: "MB1", detail: "Zone 3", x: 50, y: 70 },
  { id: "team-op", side: "team", label: "OPP", detail: "Zone 2", x: 78, y: 70 },
  { id: "team-l", side: "team", label: "L", detail: "Zone 5", x: 22, y: 88 },
  { id: "team-oh2", side: "team", label: "OH", detail: "Zone 6", x: 50, y: 88 },
  { id: "team-s", side: "team", label: "S", detail: "Zone 1", x: 78, y: 88 },
  { id: "opp-z5", side: "opponent", label: "Z5", detail: "Zone 5", x: 78, y: 12 },
  { id: "opp-z6", side: "opponent", label: "Z6", detail: "Zone 6", x: 50, y: 12 },
  { id: "opp-z1", side: "opponent", label: "Z1", detail: "Zone 1", x: 22, y: 12 },
  { id: "opp-z4", side: "opponent", label: "Z4", detail: "Zone 4", x: 78, y: 30 },
  { id: "opp-z3", side: "opponent", label: "Z3", detail: "Zone 3", x: 50, y: 30 },
  { id: "opp-z2", side: "opponent", label: "Z2", detail: "Zone 2", x: 22, y: 30 },
];

const SCENARIO_OPTIONS: Array<{ key: DrillScenario; label: string }> = [
  { key: "serve-receive", label: "Serve Receive" },
  { key: "free-ball", label: "Free Ball" },
  { key: "transition", label: "Transition" },
  { key: "block-defense", label: "Block Defense" },
];

const AUDIENCE_OPTIONS: Array<{ key: DrillAudience; label: string }> = [
  { key: "player", label: "Single Player" },
  { key: "unit", label: "Unit" },
  { key: "team", label: "Whole Team" },
];

function cloneChips(chips: BoardChip[]) {
  return chips.map((chip) => ({ ...chip }));
}

function cloneDrawLines(lines: DrawLine[]) {
  return lines.map((line) => ({
    ...line,
    points: line.points.map((point) => ({ ...point })),
  }));
}

function createStep(
  stepId: string,
  title: string,
  chips: BoardChip[],
  drawLines: DrawLine[],
  instruction = "",
): DrillStep {
  return {
    id: stepId,
    title,
    instruction,
    chips: cloneChips(chips),
    drawLines: cloneDrawLines(drawLines),
  };
}

function withChipPositions(
  chips: BoardChip[],
  positions: Record<string, { x: number; y: number }>,
) {
  return chips.map((chip) =>
    positions[chip.id] ? { ...chip, ...positions[chip.id] } : { ...chip },
  );
}

function createLine(id: string, side: TeamSide, points: CourtPoint[]): DrawLine {
  return {
    id,
    side,
    points: points.map((point) => ({ ...point })),
  };
}

type PresetSpec = {
  id: string;
  title: string;
  description: string;
  difficulty: DrillDifficulty;
  scenario: DrillScenario;
  audience: DrillAudience;
  setupTitle: string;
  finishTitle: string;
  setupInstruction: string;
  finishInstruction: string;
  setupPositions: Record<string, { x: number; y: number }>;
  finishPositions: Record<string, { x: number; y: number }>;
  setupLine?: CourtPoint[];
  finishLine?: CourtPoint[];
};

function createPresetFromSpec(spec: PresetSpec): DrillPreset {
  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    difficulty: spec.difficulty,
    scenario: spec.scenario,
    audience: spec.audience,
    steps: [
      createStep(
        `${spec.id}-1`,
        spec.setupTitle,
        withChipPositions(BASE_CHIPS, spec.setupPositions),
        spec.setupLine ? [createLine(`${spec.id}-line-1`, "team", spec.setupLine)] : [],
        spec.setupInstruction,
      ),
      createStep(
        `${spec.id}-2`,
        spec.finishTitle,
        withChipPositions(BASE_CHIPS, spec.finishPositions),
        spec.finishLine ? [createLine(`${spec.id}-line-2`, "team", spec.finishLine)] : [],
        spec.finishInstruction,
      ),
    ],
  };
}

const PRESET_SPECS: PresetSpec[] = [
  {
    id: "beginner-01",
    title: "3-Passer W Platform Angles",
    description: "Beginner serve-receive emphasizing stable platform angles and clear seam ownership.",
    difficulty: "beginner",
    scenario: "serve-receive",
    audience: "team",
    setupTitle: "W shape",
    finishTitle: "Setter to target",
    setupInstruction: "Use a three-passer W so each athlete reads zone and platform angle before contact.",
    finishInstruction: "Setter releases early to target while passers hold width and stay attack-ready.",
    setupPositions: { "team-oh1": { x: 22, y: 79 }, "team-mb1": { x: 48, y: 69 }, "team-op": { x: 78, y: 73 }, "team-l": { x: 18, y: 89 }, "team-oh2": { x: 50, y: 87 }, "team-s": { x: 82, y: 84 } },
    finishPositions: { "team-oh1": { x: 19, y: 74 }, "team-mb1": { x: 49, y: 62 }, "team-op": { x: 79, y: 67 }, "team-l": { x: 16, y: 87 }, "team-oh2": { x: 54, y: 85 }, "team-s": { x: 58, y: 73 } },
    setupLine: [{ x: 18, y: 85 }, { x: 34, y: 82 }, { x: 50, y: 84 }, { x: 66, y: 82 }, { x: 82, y: 85 }],
    finishLine: [{ x: 82, y: 84 }, { x: 70, y: 79 }, { x: 58, y: 73 }],
  },
  {
    id: "beginner-02",
    title: "Short Serve Step-In Receive",
    description: "Beginner footwork drill for short float serves using first-step recognition and balance.",
    difficulty: "beginner",
    scenario: "serve-receive",
    audience: "player",
    setupTitle: "Balanced start",
    finishTitle: "Step through pass",
    setupInstruction: "Start deeper with shoulders forward so the receiver can read a short serve without crossing feet.",
    finishInstruction: "Step in with quiet platform and keep the libero available for second-ball support.",
    setupPositions: { "team-l": { x: 24, y: 90 }, "team-oh2": { x: 50, y: 89 }, "team-s": { x: 79, y: 86 }, "team-oh1": { x: 23, y: 74 }, "team-mb1": { x: 49, y: 69 }, "team-op": { x: 78, y: 74 } },
    finishPositions: { "team-l": { x: 31, y: 82 }, "team-oh2": { x: 50, y: 86 }, "team-s": { x: 62, y: 76 }, "team-oh1": { x: 21, y: 72 }, "team-mb1": { x: 48, y: 66 }, "team-op": { x: 78, y: 70 } },
    finishLine: [{ x: 24, y: 90 }, { x: 28, y: 86 }, { x: 31, y: 82 }],
  },
  {
    id: "beginner-03",
    title: "Free Ball Triangle Reset",
    description: "Beginner transition drill that teaches spacing into a simple pass-set-hit triangle.",
    difficulty: "beginner",
    scenario: "free-ball",
    audience: "team",
    setupTitle: "Open the court",
    finishTitle: "Triangle formed",
    setupInstruction: "Players spread early to create a clean visual triangle around the first contact.",
    finishInstruction: "Setter finds the center lane while left and right attackers create width.",
    setupPositions: { "team-oh1": { x: 22, y: 76 }, "team-mb1": { x: 49, y: 67 }, "team-op": { x: 78, y: 74 }, "team-l": { x: 28, y: 88 }, "team-oh2": { x: 52, y: 87 }, "team-s": { x: 74, y: 84 } },
    finishPositions: { "team-oh1": { x: 18, y: 69 }, "team-mb1": { x: 49, y: 60 }, "team-op": { x: 79, y: 67 }, "team-l": { x: 29, y: 89 }, "team-oh2": { x: 58, y: 84 }, "team-s": { x: 56, y: 72 } },
    finishLine: [{ x: 74, y: 84 }, { x: 66, y: 79 }, { x: 56, y: 72 }],
  },
  {
    id: "beginner-04",
    title: "Setter Release from Zone 1",
    description: "Beginner setter-path drill reinforcing a fast release from zone 1 to the target window.",
    difficulty: "beginner",
    scenario: "transition",
    audience: "player",
    setupTitle: "Setter starts hidden",
    finishTitle: "Target reached",
    setupInstruction: "Keep the setter off the net and behind the pass lane to avoid traffic.",
    finishInstruction: "Drive the route to target before the hitters fully open their approach patterns.",
    setupPositions: { "team-s": { x: 82, y: 88 }, "team-oh1": { x: 21, y: 74 }, "team-mb1": { x: 49, y: 68 }, "team-op": { x: 78, y: 72 }, "team-l": { x: 21, y: 89 }, "team-oh2": { x: 50, y: 87 } },
    finishPositions: { "team-s": { x: 57, y: 73 }, "team-oh1": { x: 18, y: 70 }, "team-mb1": { x: 50, y: 61 }, "team-op": { x: 79, y: 67 }, "team-l": { x: 22, y: 88 }, "team-oh2": { x: 55, y: 85 } },
    finishLine: [{ x: 82, y: 88 }, { x: 70, y: 81 }, { x: 57, y: 73 }],
  },
  {
    id: "beginner-05",
    title: "Outside Hitters Stay Available",
    description: "Beginner receive-to-attack drill preventing passers from getting stuck after first contact.",
    difficulty: "beginner",
    scenario: "serve-receive",
    audience: "unit",
    setupTitle: "Pass and hold width",
    finishTitle: "Approach windows",
    setupInstruction: "Passers keep their hips open so they can transition into approach lanes after the pass.",
    finishInstruction: "Both outside hitters stay wide enough to give the setter two easy pin options.",
    setupPositions: { "team-oh1": { x: 18, y: 79 }, "team-mb1": { x: 49, y: 69 }, "team-op": { x: 81, y: 73 }, "team-l": { x: 26, y: 88 }, "team-oh2": { x: 50, y: 87 }, "team-s": { x: 80, y: 84 } },
    finishPositions: { "team-oh1": { x: 16, y: 70 }, "team-mb1": { x: 49, y: 61 }, "team-op": { x: 82, y: 66 }, "team-l": { x: 28, y: 87 }, "team-oh2": { x: 58, y: 82 }, "team-s": { x: 57, y: 72 } },
  },
  {
    id: "beginner-06",
    title: "Middle Available on Free Ball",
    description: "Beginner middle-transition drill that keeps the middle hitter live instead of frozen under the pass.",
    difficulty: "beginner",
    scenario: "free-ball",
    audience: "unit",
    setupTitle: "Middle starts off pass lane",
    finishTitle: "Quick option ready",
    setupInstruction: "The middle starts just off the passing triangle to avoid traffic and prepare for a quick.",
    finishInstruction: "As the setter reaches target, the middle squares to zone 3 for a simple first-tempo option.",
    setupPositions: { "team-mb1": { x: 44, y: 68 }, "team-s": { x: 74, y: 83 }, "team-l": { x: 28, y: 88 }, "team-oh1": { x: 22, y: 75 }, "team-oh2": { x: 52, y: 86 }, "team-op": { x: 79, y: 75 } },
    finishPositions: { "team-mb1": { x: 50, y: 58 }, "team-s": { x: 57, y: 72 }, "team-l": { x: 27, y: 89 }, "team-oh1": { x: 18, y: 69 }, "team-oh2": { x: 58, y: 83 }, "team-op": { x: 80, y: 67 } },
    finishLine: [{ x: 44, y: 68 }, { x: 47, y: 63 }, { x: 50, y: 58 }],
  },
  {
    id: "beginner-07",
    title: "Base Defense to Dig Window",
    description: "Beginner block-defense drill organizing simple left-back, middle-back, right-back responsibilities.",
    difficulty: "beginner",
    scenario: "block-defense",
    audience: "team",
    setupTitle: "Base lanes",
    finishTitle: "Dig window set",
    setupInstruction: "Start in balanced base so each defender sees line, seam, and deep corner responsibility.",
    finishInstruction: "On attack cue, defenders narrow into the likely dig windows without crossing roles.",
    setupPositions: { "team-oh1": { x: 22, y: 68 }, "team-mb1": { x: 49, y: 60 }, "team-op": { x: 78, y: 68 }, "team-l": { x: 18, y: 88 }, "team-oh2": { x: 50, y: 88 }, "team-s": { x: 82, y: 88 } },
    finishPositions: { "team-oh1": { x: 24, y: 64 }, "team-mb1": { x: 50, y: 56 }, "team-op": { x: 75, y: 64 }, "team-l": { x: 16, y: 84 }, "team-oh2": { x: 47, y: 83 }, "team-s": { x: 74, y: 83 } },
  },
  {
    id: "beginner-08",
    title: "Roll Shot Coverage Basics",
    description: "Beginner coverage drill teaching front-middle and deep defenders to recognize soft attacks.",
    difficulty: "beginner",
    scenario: "block-defense",
    audience: "team",
    setupTitle: "Defense spread",
    finishTitle: "Short ball covered",
    setupInstruction: "Keep one defender short and two defenders deeper so roll shots do not land unchallenged.",
    finishInstruction: "Collapse toward the short zone while preserving one player behind the play for recycle.",
    setupPositions: { "team-oh1": { x: 22, y: 67 }, "team-mb1": { x: 50, y: 59 }, "team-op": { x: 78, y: 67 }, "team-l": { x: 18, y: 88 }, "team-oh2": { x: 51, y: 86 }, "team-s": { x: 81, y: 88 } },
    finishPositions: { "team-oh1": { x: 25, y: 63 }, "team-mb1": { x: 50, y: 57 }, "team-op": { x: 74, y: 65 }, "team-l": { x: 28, y: 79 }, "team-oh2": { x: 50, y: 83 }, "team-s": { x: 74, y: 85 } },
    finishLine: [{ x: 18, y: 88 }, { x: 23, y: 83 }, { x: 28, y: 79 }],
  },
  {
    id: "beginner-09",
    title: "Cross-Court Serve Target Intro",
    description: "Beginner serving drill linking tactical intent to team shape behind the serve.",
    difficulty: "beginner",
    scenario: "transition",
    audience: "team",
    setupTitle: "Serve support shape",
    finishTitle: "Defense behind serve",
    setupInstruction: "Server starts with teammates already reading how the target changes first defensive assignments.",
    finishInstruction: "After the serve, the team settles into line-and-angle responsibilities instead of ball watching.",
    setupPositions: { "team-s": { x: 84, y: 92 }, "team-l": { x: 18, y: 87 }, "team-oh2": { x: 49, y: 86 }, "team-oh1": { x: 22, y: 70 }, "team-mb1": { x: 49, y: 62 }, "team-op": { x: 78, y: 70 } },
    finishPositions: { "team-s": { x: 76, y: 86 }, "team-l": { x: 18, y: 84 }, "team-oh2": { x: 47, y: 83 }, "team-oh1": { x: 25, y: 65 }, "team-mb1": { x: 51, y: 57 }, "team-op": { x: 74, y: 64 } },
  },
  {
    id: "beginner-10",
    title: "Simple 6-on-6 Wash Entry",
    description: "Beginner game-like wash entry that connects first ball quality to immediate transition spacing.",
    difficulty: "beginner",
    scenario: "transition",
    audience: "team",
    setupTitle: "Ready shape",
    finishTitle: "Second-ball shape",
    setupInstruction: "Players start in their base so the first rally contact stays as realistic as possible.",
    finishInstruction: "After the first exchange, everyone resets into a playable second-ball shape instead of standing still.",
    setupPositions: { "team-oh1": { x: 22, y: 74 }, "team-mb1": { x: 49, y: 66 }, "team-op": { x: 78, y: 73 }, "team-l": { x: 22, y: 88 }, "team-oh2": { x: 50, y: 87 }, "team-s": { x: 78, y: 86 } },
    finishPositions: { "team-oh1": { x: 19, y: 69 }, "team-mb1": { x: 50, y: 60 }, "team-op": { x: 80, y: 67 }, "team-l": { x: 26, y: 87 }, "team-oh2": { x: 55, y: 83 }, "team-s": { x: 57, y: 72 } },
  },
  {
    id: "intermediate-01",
    title: "Seam Call Serve Receive",
    description: "Intermediate serve-receive drill emphasizing seam language, early read, and receiver commitment.",
    difficulty: "intermediate",
    scenario: "serve-receive",
    audience: "unit",
    setupTitle: "Seam ownership",
    finishTitle: "Committed passer",
    setupInstruction: "Passers identify seams before the serve so movement is decisive instead of late and shared.",
    finishInstruction: "The committed passer takes the ball cleanly while the others transition into coverage and attack roles.",
    setupPositions: { "team-oh1": { x: 19, y: 80 }, "team-l": { x: 35, y: 86 }, "team-oh2": { x: 56, y: 84 }, "team-s": { x: 82, y: 83 }, "team-mb1": { x: 48, y: 67 }, "team-op": { x: 78, y: 71 } },
    finishPositions: { "team-oh1": { x: 23, y: 74 }, "team-l": { x: 31, y: 82 }, "team-oh2": { x: 58, y: 82 }, "team-s": { x: 57, y: 72 }, "team-mb1": { x: 49, y: 61 }, "team-op": { x: 79, y: 66 } },
  },
  {
    id: "intermediate-02",
    title: "4-to-2 Pin Width Transition",
    description: "Intermediate transition drill for left and right pin spacing after a dig or controlled touch.",
    difficulty: "intermediate",
    scenario: "transition",
    audience: "unit",
    setupTitle: "Pins tight",
    finishTitle: "Pins widen",
    setupInstruction: "Front-row pins begin slightly inside so they can read the dig and expand with timing.",
    finishInstruction: "Both pins widen at the same tempo, preserving setter choices and better block spread.",
    setupPositions: { "team-oh1": { x: 29, y: 68 }, "team-op": { x: 70, y: 68 }, "team-mb1": { x: 50, y: 61 }, "team-s": { x: 65, y: 76 }, "team-l": { x: 25, y: 87 }, "team-oh2": { x: 50, y: 84 } },
    finishPositions: { "team-oh1": { x: 17, y: 66 }, "team-op": { x: 82, y: 66 }, "team-mb1": { x: 50, y: 58 }, "team-s": { x: 57, y: 72 }, "team-l": { x: 28, y: 85 }, "team-oh2": { x: 53, y: 82 } },
  },
  {
    id: "intermediate-03",
    title: "Pipe Attack Cover Triangle",
    description: "Intermediate back-row attack drill focused on cover geometry behind the pipe lane.",
    difficulty: "intermediate",
    scenario: "transition",
    audience: "unit",
    setupTitle: "Pipe load",
    finishTitle: "Cover closes",
    setupInstruction: "The pipe attacker loads in the middle lane while teammates shape a three-point cover triangle.",
    finishInstruction: "As the attacker goes, short, middle, and deep cover close on three different depths.",
    setupPositions: { "team-oh2": { x: 50, y: 83 }, "team-l": { x: 28, y: 88 }, "team-op": { x: 77, y: 72 }, "team-s": { x: 59, y: 73 }, "team-oh1": { x: 18, y: 68 }, "team-mb1": { x: 49, y: 60 } },
    finishPositions: { "team-oh2": { x: 50, y: 75 }, "team-l": { x: 34, y: 83 }, "team-op": { x: 72, y: 73 }, "team-s": { x: 58, y: 71 }, "team-oh1": { x: 19, y: 66 }, "team-mb1": { x: 49, y: 58 } },
    finishLine: [{ x: 50, y: 83 }, { x: 50, y: 79 }, { x: 50, y: 75 }],
  },
  {
    id: "intermediate-04",
    title: "Setter Dump Recognition",
    description: "Intermediate defensive drill training front-row and middle-back reactions to setter attack cues.",
    difficulty: "intermediate",
    scenario: "block-defense",
    audience: "team",
    setupTitle: "Neutral defense",
    finishTitle: "Dump denied",
    setupInstruction: "Hold neutral positions until the setter's shoulders and hands declare attack intention.",
    finishInstruction: "Front-row blockers stay disciplined while middle-back steps into the setter dump seam.",
    setupPositions: { "team-oh1": { x: 23, y: 67 }, "team-mb1": { x: 50, y: 58 }, "team-op": { x: 77, y: 67 }, "team-l": { x: 20, y: 87 }, "team-oh2": { x: 50, y: 86 }, "team-s": { x: 79, y: 86 } },
    finishPositions: { "team-oh1": { x: 24, y: 63 }, "team-mb1": { x: 52, y: 55 }, "team-op": { x: 76, y: 63 }, "team-l": { x: 22, y: 84 }, "team-oh2": { x: 50, y: 79 }, "team-s": { x: 74, y: 84 } },
  },
  {
    id: "intermediate-05",
    title: "Middle Release After Dig",
    description: "Intermediate transition drill synchronizing dig coverage with the middle's delayed approach path.",
    difficulty: "intermediate",
    scenario: "transition",
    audience: "unit",
    setupTitle: "Middle covers first",
    finishTitle: "Middle reloads",
    setupInstruction: "The middle helps cover the initial attack before releasing into the quick lane.",
    finishInstruction: "After the dig, the middle reloads to zone 3 late enough to stay balanced but early enough to be a threat.",
    setupPositions: { "team-mb1": { x: 44, y: 71 }, "team-oh1": { x: 18, y: 66 }, "team-op": { x: 76, y: 68 }, "team-l": { x: 29, y: 86 }, "team-oh2": { x: 50, y: 82 }, "team-s": { x: 61, y: 74 } },
    finishPositions: { "team-mb1": { x: 50, y: 58 }, "team-oh1": { x: 17, y: 65 }, "team-op": { x: 80, y: 66 }, "team-l": { x: 30, y: 86 }, "team-oh2": { x: 55, y: 80 }, "team-s": { x: 57, y: 72 } },
    finishLine: [{ x: 44, y: 71 }, { x: 46, y: 65 }, { x: 50, y: 58 }],
  },
  {
    id: "intermediate-06",
    title: "Cross-Court Dig to Fast Tempo",
    description: "Intermediate first-transition drill moving from cross-court dig window into an accelerated offense.",
    difficulty: "intermediate",
    scenario: "transition",
    audience: "team",
    setupTitle: "Cross-court posture",
    finishTitle: "Fast-tempo offense",
    setupInstruction: "Defenders start with the deep cross shot protected and the setter ready to chase second contact.",
    finishInstruction: "Once the dig is controlled, the setter moves quickly enough that the middle and pins stay on rhythm.",
    setupPositions: { "team-l": { x: 16, y: 84 }, "team-oh2": { x: 48, y: 84 }, "team-s": { x: 74, y: 83 }, "team-oh1": { x: 24, y: 64 }, "team-mb1": { x: 51, y: 57 }, "team-op": { x: 74, y: 64 } },
    finishPositions: { "team-l": { x: 18, y: 86 }, "team-oh2": { x: 56, y: 82 }, "team-s": { x: 57, y: 72 }, "team-oh1": { x: 17, y: 66 }, "team-mb1": { x: 50, y: 58 }, "team-op": { x: 81, y: 66 } },
  },
  {
    id: "intermediate-07",
    title: "Two-Ball Free Ball Decision",
    description: "Intermediate free-ball drill forcing the setter to choose between quick and high-ball solutions.",
    difficulty: "intermediate",
    scenario: "free-ball",
    audience: "team",
    setupTitle: "Two-option picture",
    finishTitle: "Decision executed",
    setupInstruction: "Shape the court so the setter sees both quick and pin options off the same free ball.",
    finishInstruction: "Execute the chosen option while non-set attackers stay in supportive coverage spacing.",
    setupPositions: { "team-oh1": { x: 20, y: 70 }, "team-mb1": { x: 47, y: 61 }, "team-op": { x: 79, y: 68 }, "team-l": { x: 28, y: 88 }, "team-oh2": { x: 54, y: 84 }, "team-s": { x: 66, y: 77 } },
    finishPositions: { "team-oh1": { x: 16, y: 67 }, "team-mb1": { x: 50, y: 57 }, "team-op": { x: 82, y: 65 }, "team-l": { x: 30, y: 87 }, "team-oh2": { x: 57, y: 82 }, "team-s": { x: 57, y: 72 } },
  },
  {
    id: "intermediate-08",
    title: "Line Shot Funnel Defense",
    description: "Intermediate block-defense drill using the block to funnel line swings into a chosen digger.",
    difficulty: "intermediate",
    scenario: "block-defense",
    audience: "team",
    setupTitle: "Block shows line",
    finishTitle: "Digger owns funnel",
    setupInstruction: "Blockers close with hands set to take angle and invite a predictable line path.",
    finishInstruction: "The line defender sits in the funnel while the rest of the floor rotates around that decision.",
    setupPositions: { "team-oh1": { x: 24, y: 66 }, "team-mb1": { x: 52, y: 56 }, "team-op": { x: 76, y: 64 }, "team-l": { x: 18, y: 86 }, "team-oh2": { x: 50, y: 84 }, "team-s": { x: 74, y: 82 } },
    finishPositions: { "team-oh1": { x: 26, y: 62 }, "team-mb1": { x: 54, y: 54 }, "team-op": { x: 74, y: 62 }, "team-l": { x: 24, y: 78 }, "team-oh2": { x: 48, y: 82 }, "team-s": { x: 71, y: 82 } },
  },
  {
    id: "intermediate-09",
    title: "Right-Side Transition Off Block Touch",
    description: "Intermediate drill for converting a soft block touch into a usable right-side transition attack.",
    difficulty: "intermediate",
    scenario: "transition",
    audience: "unit",
    setupTitle: "Touch coverage",
    finishTitle: "Right-side available",
    setupInstruction: "The right-side attacker starts in coverage rather than floating away from the block touch.",
    finishInstruction: "After the touch, the right side releases wide enough to remain a fast outlet option.",
    setupPositions: { "team-op": { x: 66, y: 72 }, "team-s": { x: 60, y: 76 }, "team-mb1": { x: 50, y: 60 }, "team-oh1": { x: 20, y: 66 }, "team-l": { x: 30, y: 86 }, "team-oh2": { x: 50, y: 82 } },
    finishPositions: { "team-op": { x: 82, y: 66 }, "team-s": { x: 57, y: 72 }, "team-mb1": { x: 49, y: 58 }, "team-oh1": { x: 18, y: 66 }, "team-l": { x: 30, y: 85 }, "team-oh2": { x: 54, y: 80 } },
    finishLine: [{ x: 66, y: 72 }, { x: 74, y: 69 }, { x: 82, y: 66 }],
  },
  {
    id: "intermediate-10",
    title: "Wash Rally Reset Discipline",
    description: "Intermediate wash drill reinforcing immediate reset discipline between consecutive transition rallies.",
    difficulty: "intermediate",
    scenario: "transition",
    audience: "team",
    setupTitle: "Rally one end shape",
    finishTitle: "Reset for wash ball",
    setupInstruction: "Finish the first rally in balanced positions so the second ball begins from an organized shape.",
    finishInstruction: "As the wash ball enters, players recover to lanes instead of admiring the previous contact.",
    setupPositions: { "team-oh1": { x: 19, y: 69 }, "team-mb1": { x: 49, y: 60 }, "team-op": { x: 80, y: 67 }, "team-l": { x: 25, y: 86 }, "team-oh2": { x: 55, y: 83 }, "team-s": { x: 57, y: 72 } },
    finishPositions: { "team-oh1": { x: 22, y: 73 }, "team-mb1": { x: 49, y: 64 }, "team-op": { x: 78, y: 70 }, "team-l": { x: 22, y: 88 }, "team-oh2": { x: 50, y: 86 }, "team-s": { x: 76, y: 84 } },
  },
  {
    id: "advanced-01",
    title: "Commit Block to Cross-Court Cover",
    description: "Advanced block-defense drill coordinating middle commit timing with back-court cross-court rotation.",
    difficulty: "advanced",
    scenario: "block-defense",
    audience: "team",
    setupTitle: "Middle commit read",
    finishTitle: "Cross-court protected",
    setupInstruction: "The middle commits on the first-tempo cue while floor defenders pre-read the likely outside release.",
    finishInstruction: "As the block drifts outside, left-back and middle-back rotate to own the deep cross-court lane.",
    setupPositions: { "team-oh1": { x: 22, y: 67 }, "team-mb1": { x: 50, y: 57 }, "team-op": { x: 78, y: 68 }, "team-l": { x: 20, y: 87 }, "team-oh2": { x: 52, y: 88 }, "team-s": { x: 82, y: 87 } },
    finishPositions: { "team-oh1": { x: 24, y: 64 }, "team-mb1": { x: 58, y: 58 }, "team-op": { x: 74, y: 64 }, "team-l": { x: 16, y: 84 }, "team-oh2": { x: 48, y: 84 }, "team-s": { x: 74, y: 82 } },
    finishLine: [{ x: 50, y: 57 }, { x: 56, y: 58 }, { x: 62, y: 60 }],
  },
  {
    id: "advanced-02",
    title: "Bic to Left-Side Emergency Cover",
    description: "Advanced transition drill switching from central back-row attack to emergency left-side cover responsibilities.",
    difficulty: "advanced",
    scenario: "transition",
    audience: "team",
    setupTitle: "Bic loading",
    finishTitle: "Cover outside recycle",
    setupInstruction: "The back-row attacker loads centrally while the front row balances for a possible recycled play.",
    finishInstruction: "If the bic is recycled left, coverage rotates immediately to keep the left-side swing playable.",
    setupPositions: { "team-oh2": { x: 50, y: 82 }, "team-oh1": { x: 18, y: 67 }, "team-mb1": { x: 50, y: 59 }, "team-op": { x: 79, y: 67 }, "team-l": { x: 30, y: 86 }, "team-s": { x: 58, y: 72 } },
    finishPositions: { "team-oh2": { x: 50, y: 75 }, "team-oh1": { x: 15, y: 65 }, "team-mb1": { x: 45, y: 61 }, "team-op": { x: 72, y: 71 }, "team-l": { x: 26, y: 82 }, "team-s": { x: 54, y: 72 } },
  },
  {
    id: "advanced-03",
    title: "Read Block on Fast Tempo",
    description: "Advanced front-row drill training the middle and setter to read a live block before committing tempo.",
    difficulty: "advanced",
    scenario: "transition",
    audience: "unit",
    setupTitle: "Fast option presented",
    finishTitle: "Tempo adjusted",
    setupInstruction: "Show the quick lane early enough to force the opposing middle to reveal their read.",
    finishInstruction: "Setter adjusts the tempo or location after the block read instead of forcing a dead ball.",
    setupPositions: { "team-mb1": { x: 50, y: 59 }, "team-s": { x: 58, y: 72 }, "team-oh1": { x: 18, y: 67 }, "team-op": { x: 81, y: 66 }, "team-l": { x: 28, y: 86 }, "team-oh2": { x: 54, y: 82 } },
    finishPositions: { "team-mb1": { x: 47, y: 56 }, "team-s": { x: 56, y: 71 }, "team-oh1": { x: 15, y: 66 }, "team-op": { x: 83, y: 65 }, "team-l": { x: 30, y: 85 }, "team-oh2": { x: 57, y: 81 } },
  },
  {
    id: "advanced-04",
    title: "Serve-Receive Misdirection Release",
    description: "Advanced first-ball offense drill disguising the setter release after a high-quality pass.",
    difficulty: "advanced",
    scenario: "serve-receive",
    audience: "team",
    setupTitle: "Neutral first-ball picture",
    finishTitle: "Late release disguise",
    setupInstruction: "Keep the attack picture neutral so the block cannot pre-load on the setter's first movement.",
    finishInstruction: "Setter releases late enough to disguise the target while passers still transition to attack lanes.",
    setupPositions: { "team-oh1": { x: 20, y: 79 }, "team-l": { x: 36, y: 85 }, "team-oh2": { x: 58, y: 84 }, "team-s": { x: 82, y: 84 }, "team-mb1": { x: 49, y: 67 }, "team-op": { x: 78, y: 72 } },
    finishPositions: { "team-oh1": { x: 16, y: 70 }, "team-l": { x: 32, y: 84 }, "team-oh2": { x: 61, y: 81 }, "team-s": { x: 56, y: 72 }, "team-mb1": { x: 49, y: 58 }, "team-op": { x: 82, y: 65 } },
  },
  {
    id: "advanced-05",
    title: "Triple Block to Tip Pocket",
    description: "Advanced block-defense drill teaching when to sell the triple block and who owns the short tip pocket.",
    difficulty: "advanced",
    scenario: "block-defense",
    audience: "team",
    setupTitle: "Triple block picture",
    finishTitle: "Tip pocket sealed",
    setupInstruction: "The front row sells full commit to the pin attack while one defender shades the tip pocket.",
    finishInstruction: "As the block closes, the pocket defender steps under the block and deep defenders hold recycle depth.",
    setupPositions: { "team-oh1": { x: 24, y: 65 }, "team-mb1": { x: 50, y: 55 }, "team-op": { x: 75, y: 63 }, "team-l": { x: 18, y: 86 }, "team-oh2": { x: 50, y: 84 }, "team-s": { x: 73, y: 83 } },
    finishPositions: { "team-oh1": { x: 23, y: 61 }, "team-mb1": { x: 50, y: 53 }, "team-op": { x: 74, y: 61 }, "team-l": { x: 33, y: 77 }, "team-oh2": { x: 48, y: 82 }, "team-s": { x: 70, y: 82 } },
  },
  {
    id: "advanced-06",
    title: "Read Dig to Pipe Re-Attack",
    description: "Advanced recycle drill converting a read dig into a second-phase back-row attack.",
    difficulty: "advanced",
    scenario: "transition",
    audience: "team",
    setupTitle: "Read dig shape",
    finishTitle: "Pipe re-attack",
    setupInstruction: "Defenders read the hitter's shoulder so the dig stays central enough to keep a back-row option alive.",
    finishInstruction: "The pipe attacker reloads immediately and the setter preserves the central lane for the second swing.",
    setupPositions: { "team-l": { x: 22, y: 83 }, "team-oh2": { x: 48, y: 82 }, "team-s": { x: 72, y: 82 }, "team-oh1": { x: 24, y: 63 }, "team-mb1": { x: 50, y: 56 }, "team-op": { x: 75, y: 63 } },
    finishPositions: { "team-l": { x: 26, y: 85 }, "team-oh2": { x: 50, y: 75 }, "team-s": { x: 57, y: 72 }, "team-oh1": { x: 20, y: 66 }, "team-mb1": { x: 49, y: 58 }, "team-op": { x: 80, y: 66 } },
    finishLine: [{ x: 48, y: 82 }, { x: 49, y: 79 }, { x: 50, y: 75 }],
  },
  {
    id: "advanced-07",
    title: "Out-of-System High Ball Shape",
    description: "Advanced survival drill organizing high-ball spacing and coverage when the pass misses target badly.",
    difficulty: "advanced",
    scenario: "free-ball",
    audience: "team",
    setupTitle: "Off-target pass",
    finishTitle: "High-ball structure",
    setupInstruction: "Treat the pass as out-of-system immediately so hitters and cover defenders stop waiting for a perfect set.",
    finishInstruction: "The team builds a high-ball shape with one clear attacker and disciplined off-ball coverage.",
    setupPositions: { "team-s": { x: 76, y: 90 }, "team-oh1": { x: 18, y: 71 }, "team-mb1": { x: 49, y: 66 }, "team-op": { x: 78, y: 72 }, "team-l": { x: 23, y: 88 }, "team-oh2": { x: 50, y: 86 } },
    finishPositions: { "team-s": { x: 67, y: 78 }, "team-oh1": { x: 14, y: 65 }, "team-mb1": { x: 44, y: 63 }, "team-op": { x: 72, y: 72 }, "team-l": { x: 24, y: 82 }, "team-oh2": { x: 45, y: 81 } },
  },
  {
    id: "advanced-08",
    title: "Short-Serve Trap to Transition",
    description: "Advanced tactical drill using a short serve to force a predictable first transition pattern.",
    difficulty: "advanced",
    scenario: "transition",
    audience: "team",
    setupTitle: "Short serve pressure",
    finishTitle: "Trap defended",
    setupInstruction: "Serve short to compress the opponent's spacing and cue your own defense to the likely next contact.",
    finishInstruction: "Once the trap is sprung, the block and floor defenders rotate to the expected next-window attack.",
    setupPositions: { "team-s": { x: 84, y: 92 }, "team-l": { x: 18, y: 86 }, "team-oh2": { x: 48, y: 84 }, "team-oh1": { x: 24, y: 65 }, "team-mb1": { x: 51, y: 57 }, "team-op": { x: 74, y: 64 } },
    finishPositions: { "team-s": { x: 76, y: 86 }, "team-l": { x: 18, y: 83 }, "team-oh2": { x: 46, y: 82 }, "team-oh1": { x: 26, y: 62 }, "team-mb1": { x: 52, y: 55 }, "team-op": { x: 73, y: 61 } },
  },
  {
    id: "advanced-09",
    title: "Back-Row Setter Emergency System",
    description: "Advanced emergency-system drill for back-row setter chases and non-setter second-ball organization.",
    difficulty: "advanced",
    scenario: "transition",
    audience: "team",
    setupTitle: "Setter pulled off court",
    finishTitle: "Emergency shape formed",
    setupInstruction: "Assume the setter is forced off the court and assign a disciplined second-ball replacement.",
    finishInstruction: "Everyone else re-spaces around the emergency setter so the attack remains playable and covered.",
    setupPositions: { "team-s": { x: 90, y: 90 }, "team-oh2": { x: 50, y: 86 }, "team-l": { x: 24, y: 88 }, "team-oh1": { x: 21, y: 71 }, "team-mb1": { x: 49, y: 65 }, "team-op": { x: 78, y: 71 } },
    finishPositions: { "team-s": { x: 88, y: 80 }, "team-oh2": { x: 58, y: 77 }, "team-l": { x: 26, y: 84 }, "team-oh1": { x: 16, y: 66 }, "team-mb1": { x: 48, y: 60 }, "team-op": { x: 82, y: 66 } },
    finishLine: [{ x: 50, y: 86 }, { x: 54, y: 82 }, { x: 58, y: 77 }],
  },
  {
    id: "advanced-10",
    title: "Read-Based Wash with Constraints",
    description: "Advanced game-like wash drill using tactical constraints to train decision quality under fatigue.",
    difficulty: "advanced",
    scenario: "transition",
    audience: "team",
    setupTitle: "Constraint rally start",
    finishTitle: "Decision under stress",
    setupInstruction: "Start the rally with a constraint such as no line swing or mandatory quick-show to increase tactical load.",
    finishInstruction: "In the second phase, players keep shape and make a read-based choice instead of defaulting to habit.",
    setupPositions: { "team-oh1": { x: 19, y: 70 }, "team-mb1": { x: 49, y: 61 }, "team-op": { x: 80, y: 68 }, "team-l": { x: 26, y: 87 }, "team-oh2": { x: 54, y: 84 }, "team-s": { x: 60, y: 74 } },
    finishPositions: { "team-oh1": { x: 16, y: 66 }, "team-mb1": { x: 48, y: 58 }, "team-op": { x: 82, y: 65 }, "team-l": { x: 29, y: 85 }, "team-oh2": { x: 56, y: 80 }, "team-s": { x: 57, y: 72 } },
  },
];

const PRESET_DRILLS: DrillPreset[] = PRESET_SPECS.map(createPresetFromSpec);

const DIFFICULTY_OPTIONS: Array<{ key: DrillDifficulty | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
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

function stopPlaybackTimer(timerRef: React.MutableRefObject<number | null>) {
  if (timerRef.current) {
    window.clearInterval(timerRef.current);
    timerRef.current = null;
  }
}

function decodeSharedDrillPayload(value: string): SharedDrillPayload | null {
  const parsed = decodeSharedPayload<SharedDrillPayload>(value);
  if (
    !parsed ||
    parsed.version !== 1 ||
    typeof parsed.title !== "string" ||
    !Array.isArray(parsed.steps)
  ) {
    return null;
  }

  return {
    version: 1,
    title: parsed.title,
    scenario: parsed.scenario,
    audience: parsed.audience,
    steps: parsed.steps.map((step, index) => ({
      id: typeof step.id === "string" ? step.id : `shared-step-${index + 1}`,
      title: typeof step.title === "string" ? step.title : `Step ${index + 1}`,
      instruction:
        typeof step.instruction === "string" ? step.instruction : "",
      chips: Array.isArray(step.chips) ? step.chips.map((chip) => ({ ...chip })) : cloneChips(BASE_CHIPS),
      drawLines: Array.isArray(step.drawLines)
        ? step.drawLines.map((line) => ({
            ...line,
            points: Array.isArray(line.points)
              ? line.points.map((point) => ({ ...point }))
              : [],
          }))
        : [],
    })),
  };
}

function getInitialDrillState() {
  const sharedValue = new URLSearchParams(window.location.search).get("drill");
  const payload = sharedValue ? decodeSharedDrillPayload(sharedValue) : null;

  if (!payload || payload.steps.length === 0) {
    return {
      drillTitle: "Coach Drill",
      scenario: "serve-receive" as DrillScenario,
      audience: "team" as DrillAudience,
      steps: [createStep("step-1", "Setup", BASE_CHIPS, [])],
      currentStepId: "step-1",
    };
  }

  return {
    drillTitle: payload.title,
    scenario: payload.scenario,
    audience: payload.audience,
    steps: payload.steps,
    currentStepId: payload.steps[0].id,
  };
}

export function CoachStrategyPage({
  isDark,
  onBack,
}: {
  isDark: boolean;
  onBack: () => void;
}) {
  const [initialDrillState] = useState(getInitialDrillState);
  const courtRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const lineCounterRef = useRef(0);
  const stepCounterRef = useRef(1);
  const previewTimerRef = useRef<number | null>(null);
  const stepTransitionRef = useRef<number | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [activeChipId, setActiveChipId] = useState<string | null>(null);
  const [isDrawingEnabled, setDrawingEnabled] = useState(false);
  const [showOpponents, setShowOpponents] = useState(true);
  const [drillTitle, setDrillTitle] = useState(initialDrillState.drillTitle);
  const [scenario, setScenario] = useState<DrillScenario>(initialDrillState.scenario);
  const [audience, setAudience] = useState<DrillAudience>(initialDrillState.audience);
  const [activePanelTab, setActivePanelTab] = useState<CoachPanelTab>("builder");
  const [presetQuery, setPresetQuery] = useState("");
  const [presetDifficulty, setPresetDifficulty] = useState<DrillDifficulty | "all">("all");
  const [steps, setSteps] = useState<DrillStep[]>(initialDrillState.steps);
  const [currentStepId, setCurrentStepId] = useState(initialDrillState.currentStepId);
  const [isPreviewing, setPreviewing] = useState(false);
  const [isStepTransitioning, setStepTransitioning] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("inline");
  const [isCinemaMode, setCinemaMode] = useState(false);
  const [isCinemaReplayReady, setCinemaReplayReady] = useState(false);
  const [shouldHighlightPlay, setShouldHighlightPlay] = useState(false);
  const currentStep = steps.find((step) => step.id === currentStepId) ?? steps[0];
  const chips = currentStep?.chips ?? BASE_CHIPS;
  const drawLines = currentStep?.drawLines ?? [];
  const filteredPresets = PRESET_DRILLS.filter((preset) => {
    const matchesDifficulty =
      presetDifficulty === "all" || preset.difficulty === presetDifficulty;
    const query = presetQuery.trim().toLowerCase();
    const matchesQuery =
      query.length === 0 ||
      preset.title.toLowerCase().includes(query) ||
      preset.description.toLowerCase().includes(query) ||
      preset.difficulty.toLowerCase().includes(query);
    return matchesDifficulty && matchesQuery;
  });

  const visibleChips = showOpponents
    ? chips
    : chips.filter((chip) => chip.side === "team");

  function updateCurrentStepBoard(fields: Partial<Pick<DrillStep, "chips" | "drawLines">>) {
    setSteps((current) =>
      current.map((step) =>
        step.id === currentStepId
          ? {
              ...step,
              ...fields,
            }
          : step,
      ),
    );
  }

  useEffect(() => {
    return () => {
      stopPlaybackTimer(previewTimerRef);
      if (stepTransitionRef.current) {
        window.clearTimeout(stepTransitionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    stepCounterRef.current = steps.length;
  }, [steps.length]);

  function transitionToStep(stepId: string) {
    if (stepTransitionRef.current) {
      window.clearTimeout(stepTransitionRef.current);
    }

    setStepTransitioning(true);
    setCurrentStepId(stepId);
    stepTransitionRef.current = window.setTimeout(() => {
      setStepTransitioning(false);
      stepTransitionRef.current = null;
    }, 520);
  }

  function moveChip(chipId: string, point: { x: number; y: number }) {
    updateCurrentStepBoard({
      chips: chips.map((chip) => (chip.id === chipId ? { ...chip, ...point } : chip)),
    });
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
    updateCurrentStepBoard({
      drawLines: [
        ...drawLines,
        {
          id: lineId,
          side,
          points: [boundedPoint],
        },
      ],
    });
  }

  function movePointer(event: React.PointerEvent<HTMLDivElement>) {
    if (drawState && drawState.pointerId === event.pointerId && courtRef.current) {
      const point = keepPointOnSide(
        getPointFromEvent(event, courtRef.current),
        drawState.side,
      );

      updateCurrentStepBoard({
        drawLines: drawLines.map((line) =>
          line.id === drawState.lineId
            ? { ...line, points: [...line.points, point] }
            : line,
        ),
      });
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
  }

  function resetBoard() {
    updateCurrentStepBoard({
      chips: cloneChips(BASE_CHIPS),
      drawLines: [],
    });
    setActiveChipId(null);
    setDragState(null);
    setDrawState(null);
  }

  function updateCurrentStep(fields: Partial<Pick<DrillStep, "title" | "instruction">>) {
    setSteps((current) =>
      current.map((step) =>
        step.id === currentStepId
          ? {
              ...step,
              ...fields,
            }
          : step,
      ),
    );
  }

  function addStep() {
    stepCounterRef.current += 1;
    const nextId = `step-${stepCounterRef.current}`;
    const nextStep = createStep(
      nextId,
      `Step ${stepCounterRef.current}`,
      chips,
      drawLines,
    );

    setSteps((current) => [...current, nextStep]);
    transitionToStep(nextId);
  }

  function deleteCurrentStep() {
    if (steps.length === 1) {
      resetBoard();
      updateCurrentStep({ title: "Setup", instruction: "" });
      return;
    }

    const currentIndex = steps.findIndex((step) => step.id === currentStepId);
    const nextStep = steps[Math.max(0, currentIndex - 1)];
    setSteps((current) => current.filter((step) => step.id !== currentStepId));
    transitionToStep(nextStep.id);
  }

  function startDrillPlayback(mode: PlaybackMode, playbackSteps = steps) {
    if (playbackSteps.length === 0) return;

    stopPlaybackTimer(previewTimerRef);

    setPlaybackMode(mode);
    if (mode === "cinema") {
      setCinemaMode(true);
      setCinemaReplayReady(false);
    }
    setPreviewing(true);
    let index = 0;
    transitionToStep(playbackSteps[0].id);

    previewTimerRef.current = window.setInterval(() => {
      index += 1;

      if (index >= playbackSteps.length) {
        stopPlaybackTimer(previewTimerRef);
        setPreviewing(false);
        if (mode === "cinema") {
          setCinemaReplayReady(true);
        }
        return;
      }

      transitionToStep(playbackSteps[index].id);
    }, 1400);
  }

  function previewDrill() {
    setShouldHighlightPlay(false);
    startDrillPlayback("inline");
  }

  function playFullscreenDrill() {
    setShouldHighlightPlay(false);
    startDrillPlayback("cinema");
  }

  function closeCinemaMode() {
    stopPlaybackTimer(previewTimerRef);
    setPreviewing(false);
    setCinemaReplayReady(false);
    setCinemaMode(false);
    setPlaybackMode("inline");
  }

  function applyPreset(preset: DrillPreset) {
    const nextSteps = preset.steps.map((step) =>
      createStep(step.id, step.title, step.chips, step.drawLines, step.instruction),
    );

    setDrillTitle(preset.title);
    setScenario(preset.scenario);
    setAudience(preset.audience);
    setSteps(nextSteps);
    setCurrentStepId(nextSteps[0].id);
    setActiveChipId(null);
    setDragState(null);
    setDrawState(null);
    setDrawingEnabled(false);
    stepCounterRef.current = nextSteps.length;
    setShouldHighlightPlay(true);
  }

  async function shareDrill() {
    const payload: SharedDrillPayload = {
      version: 1,
      title: drillTitle,
      scenario,
      audience,
      steps: steps.map((step) => ({
        id: step.id,
        title: step.title,
        instruction: step.instruction,
        chips: cloneChips(step.chips),
        drawLines: cloneDrawLines(step.drawLines),
      })),
    };
    const encoded = encodeSharedPayload(payload);
    const url = new URL(window.location.href);

    url.pathname = "/coach";
    url.searchParams.set("drill", encoded);
    window.history.replaceState({}, "", url.toString());

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: drillTitle,
          text: `Open drill: ${drillTitle}`,
          url: url.toString(),
        });
        return;
      } catch {
        // Fall through to clipboard when the native share sheet is canceled or unavailable.
      }
    }

    await navigator.clipboard.writeText(url.toString());
  }

  function renderCourt(
    boardClassName: string,
    interactive: boolean,
    boardStyle?: React.CSSProperties,
  ) {
    const isHalfCourtView = !showOpponents;
    const courtContentClassName = isHalfCourtView
      ? "absolute inset-x-0 bottom-0 h-[200%]"
      : "absolute inset-0";

    return (
      <div
        ref={interactive ? courtRef : undefined}
        aria-label="Coach strategy volleyball court"
        onPointerDown={interactive ? startDrawing : undefined}
        onPointerMove={interactive ? movePointer : undefined}
        onPointerUp={interactive ? endPointer : undefined}
        onPointerCancel={interactive ? endPointer : undefined}
        className={boardClassName}
        style={boardStyle}
      >
        <div className={courtContentClassName}>
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-sky-950/60" />
          <div className="absolute inset-x-0 top-[12%] h-0.5 bg-sky-950/35" />
          <div className="absolute inset-x-0 top-[38%] h-0.5 bg-sky-950/30" />
          <div className="absolute inset-x-0 top-[62%] h-0.5 bg-sky-950/30" />
          <div className="absolute inset-x-0 top-[88%] h-0.5 bg-sky-950/35" />
          <div className="absolute inset-y-0 left-1/3 w-0.5 bg-sky-950/20" />
          <div className="absolute inset-y-0 right-1/3 w-0.5 bg-sky-950/20" />
          {!isHalfCourtView && (
            <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
              Opponent
            </div>
          )}
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
              onPointerDown={interactive ? (event) => startDrag(chip, event) : undefined}
              disabled={!interactive || isDrawingEnabled}
              className={`absolute z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 select-none touch-none flex-col items-center justify-center rounded-full border-2 text-center shadow-lg transition-[left,top,transform,opacity,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                interactive ? "active:scale-110" : ""
              } ${
                chip.side === "team"
                  ? "border-blue-900 bg-blue-600 text-white"
                  : "border-red-900 bg-red-600 text-white"
              } ${activeChipId === chip.id ? "ring-4 ring-white/80" : ""} ${
                isDrawingEnabled && interactive ? "pointer-events-none opacity-90" : ""
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
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen lg:h-screen lg:overflow-hidden ${
        isDark
          ? "bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.2),_transparent_30%),linear-gradient(180deg,_#020617,_#0f172a)] text-white"
          : "bg-[linear-gradient(180deg,_#ecfeff,_#f8fafc_44%,_#e0f2fe)] text-slate-950"
      }`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-3 pb-4 pt-3 lg:h-screen lg:min-h-0 lg:px-5 lg:pb-5">
        <header className="shrink-0 flex items-center justify-between gap-3">
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

        <div className="mt-4 grid flex-1 gap-4 lg:min-h-0 lg:overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
            <section
              className={`rounded-[2rem] border p-4 shadow-2xl ${
                isDark
                  ? "border-white/10 bg-white/5 shadow-black/30"
                  : "border-white bg-white/80 shadow-sky-200/70 backdrop-blur"
              }`}
            >
              <div className={`rounded-[1.5rem] p-1.5 ${isDark ? "bg-slate-950/80" : "bg-slate-100/90"}`}>
                <div className="relative grid grid-cols-2">
                  <div
                    aria-hidden="true"
                    className={`absolute inset-y-0 w-1/2 rounded-[1rem] shadow-sm transition-transform duration-300 ease-out ${
                      isDark ? "bg-sky-600" : "bg-white"
                    } ${activePanelTab === "builder" ? "translate-x-0" : "translate-x-full"}`}
                  />
                  {[
                    { key: "builder" as const, label: "Build" },
                    { key: "presets" as const, label: "Presets" },
                  ].map((tab) => (
                    <Button
                      key={tab.key}
                      aria-pressed={activePanelTab === tab.key}
                      onClick={() => setActivePanelTab(tab.key)}
                      isDark={isDark}
                      size="md"
                      active={activePanelTab === tab.key}
                      className={`relative z-10 rounded-[1rem] border-transparent duration-300 ${
                        activePanelTab === tab.key
                          ? isDark
                            ? "text-white"
                            : "text-slate-950"
                          : isDark
                            ? "text-slate-300"
                            : "text-slate-500"
                      }`}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-500">
                    Coach Tools
                  </div>
                  <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
                    {activePanelTab === "builder"
                      ? "Build a teaching sequence, preview it step by step, and send it as a link."
                      : "Browse ready-made drills, filter by difficulty, and load one into the board."}
                  </p>
                </div>
              </div>

              <div className="relative mt-4 overflow-hidden">
                <div
                  className={`transition-all duration-300 ease-out ${
                    activePanelTab === "builder"
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-4 opacity-0 pointer-events-none absolute inset-0"
                  }`}
                >
                  <div className="space-y-3">
                    <input
                      aria-label="Drill title"
                      value={drillTitle}
                      onChange={(event) => setDrillTitle(event.target.value)}
                      className={`w-full rounded-2xl border px-3 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-sky-400 ${
                        isDark
                          ? "border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
                          : "border-sky-100 bg-white text-slate-900 placeholder:text-slate-400"
                      }`}
                      placeholder="Name this drill"
                    />

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-sky-500">
                          Scenario
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {SCENARIO_OPTIONS.map((option) => (
                            <Button
                              key={option.key}
                              onClick={() => setScenario(option.key)}
                              isDark={isDark}
                              size="sm"
                              active={scenario === option.key}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-sky-500">
                          Audience
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {AUDIENCE_OPTIONS.map((option) => (
                            <Button
                              key={option.key}
                              onClick={() => setAudience(option.key)}
                              isDark={isDark}
                              size="sm"
                              active={audience === option.key}
                              className={audience === option.key ? "border-indigo-600 bg-indigo-600 text-white" : ""}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <input
                        aria-label="Step title"
                        value={currentStep?.title ?? ""}
                        onChange={(event) => updateCurrentStep({ title: event.target.value })}
                        className={`rounded-2xl border px-3 py-2 text-sm font-black outline-none focus:ring-2 focus:ring-sky-400 ${
                          isDark
                            ? "border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
                            : "border-sky-100 bg-white text-slate-900 placeholder:text-slate-400"
                        }`}
                        placeholder="Step title"
                      />
                      <IconButton
                        onClick={addStep}
                        aria-label="Add Step"
                        isDark={isDark}
                        variant="secondary"
                      >
                        <span aria-hidden="true" className="text-base leading-none">+</span>
                      </IconButton>
                      <Button
                        onClick={deleteCurrentStep}
                        isDark={isDark}
                        size="sm"
                        variant="danger"
                        className="rounded-xl"
                      >
                        Delete
                      </Button>
                    </div>

                    <textarea
                      aria-label="Step instruction"
                      value={currentStep?.instruction ?? ""}
                      onChange={(event) => updateCurrentStep({ instruction: event.target.value })}
                      className={`min-h-24 w-full resize-none rounded-2xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 ${
                        isDark
                          ? "border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
                          : "border-sky-100 bg-white text-slate-900 placeholder:text-slate-400"
                      }`}
                      placeholder="Instruction for this step. Example: Setter releases to target, OH1 owns seam 5."
                    />

                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      {steps.map((step, index) => (
                        <Button
                          key={step.id}
                          onClick={() => transitionToStep(step.id)}
                          isDark={isDark}
                          size="sm"
                          active={currentStepId === step.id}
                          className={`min-w-[132px] text-left ${
                            currentStepId === step.id
                              ? "border-sky-500 bg-sky-600 text-white"
                              : isDark
                                ? "border-white/10 bg-slate-950/60 text-slate-200"
                                : "border-sky-100 bg-white text-slate-800"
                          }`}
                        >
                          <span className="block text-[10px] font-black uppercase tracking-wide opacity-75">
                            Step {index + 1}
                          </span>
                          <span className="block truncate text-sm font-black">
                            {step.title || `Step ${index + 1}`}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-[11px] leading-tight opacity-80">
                            {step.instruction || "No instruction yet."}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`transition-all duration-300 ease-out ${
                    activePanelTab === "presets"
                      ? "translate-x-0 opacity-100"
                      : "translate-x-4 opacity-0 pointer-events-none absolute inset-0"
                  }`}
                >
                  <div className={`rounded-[2rem] border p-4 ${
                    isDark ? "border-white/10 bg-white/5" : "border-white bg-white/80 shadow-sm"
                  }`}>
                    <div className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-500">
                      Preset Library
                    </div>
                    <h2 className="mt-1 text-lg font-black">Beginner to advanced drills</h2>
                    <input
                      aria-label="Search preset drills"
                      value={presetQuery}
                      onChange={(event) => setPresetQuery(event.target.value)}
                      placeholder="Search receive, transition, beginner..."
                      className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-400 ${
                        isDark
                          ? "border-white/10 bg-slate-900 text-white placeholder:text-slate-500"
                          : "border-sky-100 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                      }`}
                    />

                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <Button
                          key={option.key}
                          onClick={() => setPresetDifficulty(option.key)}
                          isDark={isDark}
                          size="sm"
                          active={presetDifficulty === option.key}
                          className="shrink-0 rounded-full"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-4 space-y-3 lg:max-h-[48vh] lg:overflow-y-auto lg:pr-1">
                      {filteredPresets.map((preset) => (
                        <button
                          type="button"
                          key={preset.id}
                          onClick={() => {
                            applyPreset(preset);
                            setActivePanelTab("builder");
                          }}
                          className={`w-full rounded-[1.5rem] border p-4 text-left ${
                            isDark
                              ? "border-white/10 bg-slate-950/60 text-white"
                              : "border-sky-100 bg-slate-50 text-slate-900"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-black">{preset.title}</div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                                preset.difficulty === "beginner"
                                  ? "bg-emerald-500 text-white"
                                  : preset.difficulty === "intermediate"
                                    ? "bg-amber-500 text-white"
                                    : "bg-rose-600 text-white"
                              }`}
                            >
                              {preset.difficulty}
                            </span>
                          </div>
                          <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {preset.description}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-sky-500">
                            <span>
                              {SCENARIO_OPTIONS.find((option) => option.key === preset.scenario)?.label}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>{preset.steps.length} steps</span>
                            <span className="text-slate-400">•</span>
                            <span>
                              {AUDIENCE_OPTIONS.find((option) => option.key === preset.audience)?.label}
                            </span>
                          </div>
                        </button>
                      ))}

                      {filteredPresets.length === 0 && (
                        <div
                          className={`rounded-[1.5rem] px-4 py-6 text-center text-sm ${
                            isDark ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"
                          }`}
                        >
                          No drills matched that search.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </aside>

          <section className="space-y-4 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
            <div className="shrink-0 flex items-center justify-end gap-2">
              <IconButton
                aria-label={isPreviewing && playbackMode === "inline" ? "Playing Drill" : "Play Drill"}
                onClick={previewDrill}
                isDark={isDark}
                variant="primary"
                className={`h-11 w-11 rounded-full ${
                  shouldHighlightPlay && !isPreviewing
                    ? "ring-4 ring-sky-300/70 shadow-[0_0_0_6px_rgba(56,189,248,0.18)] animate-pulse"
                    : ""
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-current"
                >
                  <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 0 0 0-1.68L9.54 5.98A1 1 0 0 0 8 6.82Z" />
                </svg>
              </IconButton>
              <IconButton
                aria-label="Play Fullscreen Drill"
                onClick={playFullscreenDrill}
                isDark={isDark}
                variant="outline"
                className="h-11 w-11 rounded-full"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H4v4" />
                  <path d="M16 3h4v4" />
                  <path d="M8 21H4v-4" />
                  <path d="M16 21h4v-4" />
                </svg>
              </IconButton>
              <IconButton
                aria-label="Share Drill"
                onClick={shareDrill}
                isDark={isDark}
                variant="outline"
                className="h-11 w-11 rounded-full"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="2" />
                  <circle cx="6" cy="12" r="2" />
                  <circle cx="18" cy="19" r="2" />
                  <path d="M8 12 16 6" />
                  <path d="M8 12 16 18" />
                </svg>
              </IconButton>
            </div>

            <div className="shrink-0 grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Button
                aria-pressed={isDrawingEnabled}
                onClick={() => {
                  setDrawingEnabled((current) => !current);
                  setDragState(null);
                  setActiveChipId(null);
                }}
                isDark={isDark}
                variant="success"
                active={isDrawingEnabled}
              >
                {isDrawingEnabled ? "Drawing On" : "Draw Lines"}
              </Button>
              <Button
                onClick={() => setShowOpponents((current) => !current)}
                isDark={isDark}
                variant="danger"
                active={showOpponents}
              >
                {showOpponents ? "Hide Opponent" : "Show Opponent"}
              </Button>
              <Button
                onClick={() => updateCurrentStepBoard({ drawLines: [] })}
                isDark={isDark}
                variant="secondary"
              >
                Clear Lines
              </Button>
              <Button
                onClick={resetBoard}
                isDark={isDark}
                variant="primary"
              >
                Reset Board
              </Button>
            </div>

            <div
              className={`rounded-[2rem] border p-3 shadow-2xl ${
                isDark
                  ? "border-white/10 bg-white/5 shadow-black/30"
                  : "border-white bg-white/80 shadow-sky-200/70 backdrop-blur"
              } lg:flex-1 lg:min-h-0 lg:overflow-hidden`}
            >
              {renderCourt(
                `relative mx-auto ${showOpponents ? "aspect-[9/16]" : "aspect-[9/8]"} w-full max-w-[28rem] overflow-hidden rounded-[2rem] border-4 border-sky-900/70 bg-[linear-gradient(180deg,_#fde68a_0%,_#fef3c7_50%,_#fde68a_100%)] shadow-inner touch-none transition-[transform,opacity] duration-500 sm:max-w-[32rem] lg:max-h-full lg:max-w-[calc(100%-1rem)] xl:max-w-[40rem] 2xl:max-w-[44rem] ${
                  isStepTransitioning ? "scale-[0.992] opacity-90" : "scale-100 opacity-100"
                }`,
                true,
              )}
          </div>
          </section>
        </div>
      </div>

      {isCinemaMode && (
        <div className="fixed inset-0 z-[90] bg-black text-white">
          <div className="flex min-h-screen flex-col items-center justify-center px-4 py-5">
            <div className="mb-4 flex w-full max-w-6xl items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.28em] text-sky-400">
                  Drill Replay
                </div>
                <h2 className="truncate text-lg font-black sm:text-2xl">{drillTitle}</h2>
                <p className="mt-1 max-w-xl text-sm text-slate-300">
                  {currentStep?.instruction || "Watch the movement sequence, then replay it from the start."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCinemaMode}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white"
              >
                Close
              </button>
            </div>

            <div className="flex w-full flex-1 items-center justify-center">
              {renderCourt(
                `relative aspect-[9/16] overflow-hidden rounded-[2rem] border-4 border-white/20 bg-[linear-gradient(180deg,_#fde68a_0%,_#fef3c7_50%,_#fde68a_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-500 ${
                  isStepTransitioning ? "scale-[0.992] opacity-90" : "scale-100 opacity-100"
                }`,
                false,
                {
                  width: "min(calc((100vh - 12rem) * 9 / 16), calc(100vw - 2rem))",
                  maxHeight: "calc(100vh - 12rem)",
                },
              )}
            </div>

            <div className="mt-4 flex w-full max-w-4xl flex-col items-center gap-3">
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white/90">
                {currentStep?.title || "Step"} {isPreviewing ? "in motion" : isCinemaReplayReady ? "complete" : ""}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  onClick={() => startDrillPlayback("cinema")}
                  variant="primary"
                  isDark={false}
                  className="rounded-full px-5 text-slate-950"
                >
                  {isPreviewing && playbackMode === "cinema" ? "Playing..." : isCinemaReplayReady ? "Replay Drill" : "Restart"}
                </Button>
                <Button
                  onClick={closeCinemaMode}
                  variant="outline"
                  isDark
                  className="rounded-full px-5"
                >
                  Back to Board
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
