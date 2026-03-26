import type { ReactNode } from "react";

interface PixelPanelProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  className?: string;
  bodyClassName?: string;
  bodyRegionLabel?: string;
  children: ReactNode;
}

export function PixelPanel({
  title,
  subtitle,
  rightSlot,
  className,
  bodyClassName,
  bodyRegionLabel,
  children,
}: PixelPanelProps) {
  const bodyRegionProps = bodyRegionLabel
    ? {
        role: "region" as const,
        "aria-label": bodyRegionLabel,
        tabIndex: 0,
      }
    : {};

  return (
    <section className={`pixel-panel ${className ?? ""}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="pixel-heading text-[1.08rem] uppercase tracking-[0.08em]">
            {title}
          </h2>
          {subtitle ? <p className="pixel-subtle mt-2">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
      </header>
      <div className={bodyClassName} {...bodyRegionProps}>
        {children}
      </div>
    </section>
  );
}
