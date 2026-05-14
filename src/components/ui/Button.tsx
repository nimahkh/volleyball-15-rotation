import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "success"
  | "danger";

type ButtonSize = "sm" | "md";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  children,
  className,
  isDark = false,
  variant = "secondary",
  size = "md",
  active = false,
  style,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
  className?: string;
  isDark?: boolean;
  size?: ButtonSize;
  style?: CSSProperties;
  variant?: ButtonVariant;
}) {
  const sizeClass =
    size === "sm"
      ? "px-3 py-2 text-xs font-black"
      : "px-4 py-3 text-sm font-black";

  const variantClass = (() => {
    if (active) {
      if (variant === "success") return "bg-emerald-600 text-white border-emerald-600";
      if (variant === "danger") return "bg-rose-600 text-white border-rose-600";
      return "bg-sky-600 text-white border-sky-600";
    }

    switch (variant) {
      case "primary":
        return "bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-900/20";
      case "outline":
        return isDark
          ? "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
          : "border-zinc-200 bg-white text-slate-800 hover:bg-zinc-50";
      case "success":
        return isDark
          ? "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
          : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200";
      case "danger":
        return isDark
          ? "border-rose-500/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20"
          : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100";
      case "secondary":
      default:
        return isDark
          ? "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
          : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200";
    }
  })();

  return (
    <button
      type={type}
      className={cx(
        "cursor-pointer rounded-2xl border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        sizeClass,
        variantClass,
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
