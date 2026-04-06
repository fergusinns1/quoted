import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-white text-neutral-900 font-semibold shadow-md hover:bg-white/90 active:scale-[0.97]",
  secondary:
    "bg-white/20 backdrop-blur-sm text-white border border-white/20 hover:bg-white/30 active:scale-[0.97]",
  ghost:
    "bg-transparent text-white/70 hover:text-white active:scale-[0.97]",
};

export default function PillButton({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-full px-6 py-3 text-sm
        transition-all duration-150 select-none cursor-pointer
        ${styles[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
