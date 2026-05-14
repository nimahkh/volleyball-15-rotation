import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonVariant = "primary" | "secondary" | "outline" | "danger";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function IconButton({
  children,
  className,
  isDark = false,
  variant = "secondary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  isDark?: boolean;
  variant?: IconButtonVariant;
}) {
  const variantClass =
    variant === "primary"
      ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-500"
      : variant === "danger"
      ? isDark
        ? "border-rose-500/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20"
        : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      : variant === "outline"
        ? isDark
          ? "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
          : "border-zinc-200 bg-white text-slate-800 hover:bg-zinc-50"
        : isDark
          ? "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
          : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <button
      type={type}
      className={cx(
        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variantClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
