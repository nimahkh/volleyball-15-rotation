import { useRef, useState } from "react";
import type { SelectedToken } from "../../hooks/useReceiveModeInsights";

export function MobileBottomSheet({
  selectedToken,
  onClose,
  insightPanel,
}: {
  selectedToken: SelectedToken;
  onClose: () => void;
  insightPanel: React.ReactNode;
}) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  function beginDrag(clientY: number) {
    setIsDragging(true);
    startYRef.current = clientY;
  }

  function moveDrag(clientY: number) {
    if (!isDragging) return;
    const delta = clientY - startYRef.current;
    setDragY(delta > 0 ? delta : 0);
  }

  function endDrag() {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 110) {
      onClose();
      return;
    }
    setDragY(0);
  }

  return (
    <div className="inset-0 z-[999] md:hidden">
      <button
        type="button"
        aria-label="Close player details"
        className="absolute inset-0 bg-zinc-950/45"
        onClick={onClose}
      />

      <div
        className="sheet-enter absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)]"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 180ms ease-out",
        }}
        onTouchStart={(event) => beginDrag(event.touches[0].clientY)}
        onTouchMove={(event) => moveDrag(event.touches[0].clientY)}
        onTouchEnd={endDrag}
        onMouseDown={(event) => beginDrag(event.clientY)}
        onMouseMove={(event) => moveDrag(event.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-zinc-300" />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-600">
            Receive Planner
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            Close
          </button>
        </div>

        <div data-player={selectedToken.role}>{insightPanel}</div>
      </div>
    </div>
  );
}
