import { ButtonHTMLAttributes } from "react";

interface FloatingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
}

export default function FloatingButton({
  size = 48,
  className = "",
  children,
  ...props
}: FloatingButtonProps) {
  return (
    <button
      style={{ width: size, height: size }}
      className={`
        flex items-center justify-center rounded-full
        bg-white/20 backdrop-blur-md border border-white/20
        shadow-md text-white
        transition-all duration-150 hover:bg-white/30 active:scale-95
        cursor-pointer select-none
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
