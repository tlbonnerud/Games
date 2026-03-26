import { useId, useState } from "react";
import type { ReactNode } from "react";

interface TooltipHintProps {
  label: string;
  children: ReactNode;
}

export function TooltipHint({ label, children }: TooltipHintProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span
      className="tooltip-root"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="tooltip-trigger"
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={tooltipId}
        onClick={() => setOpen((prev) => !prev)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      <span id={tooltipId} className={`tooltip-content ${open ? "is-open" : ""}`}>
        {children}
      </span>
    </span>
  );
}
