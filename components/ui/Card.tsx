import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export default function Card({
  glass = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl overflow-hidden
        ${
          glass
            ? "backdrop-blur-md bg-white/15 border border-white/20"
            : "bg-white/95 shadow-sm"
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
