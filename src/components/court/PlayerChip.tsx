import { useMemo } from "react";
import type { RoleKey } from "../../constants/roles";

export function PlayerChip({
  name,
  role,
  isClickable,
  isSelected,
  isDimmed,
}: {
  name: string;
  role: RoleKey;
  isClickable: boolean;
  isSelected: boolean;
  isDimmed: boolean;
}) {
  const shortName = useMemo(() => {
    const maxChars = 10;
    return name.length <= maxChars ? name : `${name.slice(0, maxChars - 1)}…`;
  }, [name]);

  return (
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-full border text-center shadow-md md:h-16 md:w-16 ${
        isSelected
          ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-300"
          : "border-indigo-200 bg-gradient-to-br from-white to-indigo-50"
      } ${isClickable ? "receive-token" : ""} ${
        isDimmed ? "opacity-30 brightness-75 saturate-50" : ""
      }`}
    >
      <div className="px-1 leading-tight">
        <div className="w-12 truncate text-xs font-bold text-zinc-900 md:w-14">
          {shortName}
        </div>
        <div className="text-[10px] text-indigo-700">({role})</div>
      </div>
    </div>
  );
}
