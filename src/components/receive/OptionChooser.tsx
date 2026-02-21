import type { InsightView } from "../../constants/roles";

export function OptionChooser({
  selectedInsight,
  onChoose,
}: {
  selectedInsight: InsightView | null;
  onChoose: (view: InsightView) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Choose a view
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChoose("zone")}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
            selectedInsight === "zone"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Defense Zone
        </button>
        <button
          type="button"
          onClick={() => onChoose("movement")}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
            selectedInsight === "movement"
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Next Movement
        </button>
      </div>
    </div>
  );
}
