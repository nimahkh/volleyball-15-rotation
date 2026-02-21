import React, { useRef, useState } from "react";

export function usePlaybackControls({
  onPlayPressed,
  onResetPressed,
}: {
  onPlayPressed: () => void;
  onResetPressed: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [resetPosition, setResetPosition] = useState(false);
  const playTimers = useRef<number[]>([]);

  const clearPlayTimers = React.useCallback(() => {
    playTimers.current.forEach((timer) => window.clearTimeout(timer));
    playTimers.current = [];
  }, []);

  React.useEffect(
    () => () => {
      clearPlayTimers();
    },
    [clearPlayTimers],
  );

  function playDemo() {
    if (isPlaying) return;

    clearPlayTimers();
    onPlayPressed();
    setIsPlaying(true);

    playTimers.current.push(
      window.setTimeout(() => {
        setIsPlaying(false);
      }, 3000),
    );
  }

  function handleResetPositions() {
    if (resetPosition) return;

    clearPlayTimers();
    onResetPressed();
    setResetPosition(true);
    window.setTimeout(() => setResetPosition(false), 2500);
  }

  return {
    isPlaying,
    resetPosition,
    playDemo,
    handleResetPositions,
  };
}
