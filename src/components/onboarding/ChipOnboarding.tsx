export function ChipOnboarding({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center bg-zinc-950/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close onboarding"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-2xl">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
          Quick Tip
        </div>
        <h2 className="text-base font-bold text-zinc-900">
          Player chips are interactive
        </h2>
        <p className="mt-2 text-sm text-zinc-700">
          In Receive mode, tap any player chip to choose{" "}
          <strong>Defense Zone</strong> or
          <strong> Next Movement</strong> and see the animation on court.
        </p>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
