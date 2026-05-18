const CLARITY_SCRIPT_ID = "microsoft-clarity-script";

type ClarityQueue = ((...args: unknown[]) => void) & {
  q?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityQueue;
  }
}

export function installClarity(projectId: string) {
  if (typeof window === "undefined" || !projectId.trim()) {
    return;
  }

  if (document.getElementById(CLARITY_SCRIPT_ID)) {
    return;
  }

  const clarity: ClarityQueue =
    window.clarity ??
    ((...args: unknown[]) => {
      (clarity.q = clarity.q || []).push(args);
    });

  clarity.q = clarity.q || [];
  window.clarity = clarity;

  const script = document.createElement("script");
  script.id = CLARITY_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  document.head.appendChild(script);
}
