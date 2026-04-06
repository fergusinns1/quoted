import { HTMLAttributes } from "react";

/**
 * PageContainer
 * Fills the mobile shell, positions children, and adds bottom padding
 * so content doesn't sit under the BottomNav (≈ 90px).
 */
interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** If true the container itself scrolls vertically */
  scrollable?: boolean;
}

export default function PageContainer({
  scrollable = false,
  className = "",
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={`
        absolute inset-0
        ${scrollable ? "overflow-y-auto shell-scroll" : "overflow-hidden"}
        ${className}
      `}
      {...props}
    >
      {/* Bottom padding clears the nav bar */}
      <div className="min-h-full pb-[100px]">{children}</div>
    </div>
  );
}
