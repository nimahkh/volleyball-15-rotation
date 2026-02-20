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
  return (
    <div className="fixed inset-0 z-[90] md:hidden">
      <button
        type="button"
        aria-label="Close player details"
        className="absolute inset-0 bg-zinc-950/45"
        onClick={onClose}
      />

      <div className="sheet-enter absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.25)]">
        <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-zinc-300" />
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-600">Receive Planner</h2>
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
