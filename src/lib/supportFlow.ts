export type SupportSignal =
  | "start-lineup"
  | "open-coach"
  | "rotation-nav"
  | "play-receive"
  | "apply-preset"
  | "play-drill"
  | "share-drill"
  | "fullscreen-drill";

type SupportState = {
  donatedAt: number | null;
  dismissedAt: number | null;
  lastPromptAt: number | null;
  score: number;
  seenPrompts: number;
  signals: Partial<Record<SupportSignal, number>>;
};

const STORAGE_KEY = "volleyball-rotation-support";
const AUTO_PROMPT_THRESHOLD = 6;
const PROMPT_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 14;
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 21;
const DONATION_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 120;
const MAX_PROMPTS = 4;

const SIGNAL_WEIGHTS: Record<SupportSignal, number> = {
  "start-lineup": 2,
  "open-coach": 2,
  "rotation-nav": 1,
  "play-receive": 1,
  "apply-preset": 2,
  "play-drill": 2,
  "share-drill": 2,
  "fullscreen-drill": 2,
};

function getDefaultState(): SupportState {
  return {
    donatedAt: null,
    dismissedAt: null,
    lastPromptAt: null,
    score: 0,
    seenPrompts: 0,
    signals: {},
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readSupportState(): SupportState {
  if (!canUseStorage()) {
    return getDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultState();
    }

    return {
      ...getDefaultState(),
      ...JSON.parse(raw),
    } as SupportState;
  } catch {
    return getDefaultState();
  }
}

function writeSupportState(state: SupportState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function shouldAutoOpenSupport(state = readSupportState(), now = Date.now()) {
  if (state.score < AUTO_PROMPT_THRESHOLD || state.seenPrompts >= MAX_PROMPTS) {
    return false;
  }

  if (state.donatedAt && now - state.donatedAt < DONATION_COOLDOWN_MS) {
    return false;
  }

  if (state.dismissedAt && now - state.dismissedAt < DISMISS_COOLDOWN_MS) {
    return false;
  }

  if (state.lastPromptAt && now - state.lastPromptAt < PROMPT_COOLDOWN_MS) {
    return false;
  }

  return true;
}

export function recordSupportSignal(signal: SupportSignal) {
  const state = readSupportState();
  const currentCount = state.signals[signal] ?? 0;

  state.signals[signal] = currentCount + 1;
  if (currentCount === 0) {
    state.score += SIGNAL_WEIGHTS[signal];
  }

  writeSupportState(state);
  return shouldAutoOpenSupport(state);
}

export function markSupportPromptOpened() {
  const state = readSupportState();
  state.lastPromptAt = Date.now();
  state.seenPrompts += 1;
  writeSupportState(state);
}

export function dismissSupportPrompt() {
  const state = readSupportState();
  state.dismissedAt = Date.now();
  writeSupportState(state);
}

export function markSupportDonation() {
  const state = readSupportState();
  state.donatedAt = Date.now();
  state.dismissedAt = Date.now();
  state.score = 0;
  writeSupportState(state);
}
