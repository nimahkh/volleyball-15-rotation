import React from "react";

const STORAGE_KEY = "vr15_onboarding_chip_click_v1";

export function useChipOnboarding(enabled: boolean) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const alreadySeen = window.localStorage.getItem(STORAGE_KEY) === "seen";
    if (!alreadySeen) {
      setIsOpen(true);
    }
  }, [enabled]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "seen");
    }
  }, []);

  return {
    isOpen,
    close,
  };
}
