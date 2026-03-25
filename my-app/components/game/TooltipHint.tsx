import type { ReactNode } from "react";

interface TooltipHintProps {
  label: string;
  children: ReactNode;
}

export function TooltipHint({ label, children }: TooltipHintProps) {
  return (
    <span className="tooltip-root">
      <span
        className="tooltip-trigger"
        role="img"
        aria-label={label}
        tabIndex={0}
      >
        ?
      </span>
      <span className="tooltip-content">{children}</span>
    </span>
  );
}
