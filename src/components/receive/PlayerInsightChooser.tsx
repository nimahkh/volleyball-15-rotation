import { ROLE_LABEL_BY_KEY, type InsightView, type RoleKey } from "../../constants/roles";
import { OptionChooser } from "./OptionChooser";

export function PlayerInsightChooser({
  role,
  name,
  selectedInsight,
  onChooseInsight,
}: {
  role: RoleKey;
  name: string;
  selectedInsight: InsightView | null;
  onChooseInsight: (view: InsightView) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {ROLE_LABEL_BY_KEY[role]}
        </div>
        <h3 className="text-base font-bold text-zinc-900">{name}</h3>
      </div>

      <OptionChooser selectedInsight={selectedInsight} onChoose={onChooseInsight} />
    </div>
  );
}
