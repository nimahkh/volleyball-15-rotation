import { Button } from "../ui/Button";

export function SupportModal({
  isDark,
  isOpen,
  bunqMeUrl,
  onClose,
  onDonate,
}: {
  isDark: boolean;
  isOpen: boolean;
  bunqMeUrl?: string;
  onClose: () => void;
  onDonate: () => void;
}) {
  const ctaLabel = bunqMeUrl ? "Open bunq" : "bunq Setup Needed";

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-3 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-modal-title"
        className={`w-full max-w-md rounded-[2rem] border p-5 shadow-2xl ${
          isDark
            ? "border-white/10 bg-slate-950 text-white"
            : "border-zinc-200 bg-white text-slate-900"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-500">
              Support This App
            </div>
            <h2 id="support-modal-title" className="mt-1 text-xl font-black">
              Keep the court free
            </h2>
          </div>
          <Button
            aria-label="Close support modal"
            onClick={onClose}
            isDark={isDark}
            size="sm"
            variant="outline"
            className="rounded-full px-3"
          >
            Close
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          <p className={`text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            If this app helps during practice or lineup planning, you can support it with a
            one-time tip. The app stays free either way.
          </p>
          <div
            className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
              isDark
                ? "border-white/10 bg-white/5 text-slate-300"
                : "border-sky-100 bg-sky-50 text-slate-700"
            }`}
          >
            You’ll continue to bunq and choose the amount there.
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} isDark={isDark} variant="outline" className="flex-1">
              Maybe Later
            </Button>
            <Button
              onClick={onDonate}
              isDark={isDark}
              variant="primary"
              className="flex-1"
              disabled={!bunqMeUrl}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
