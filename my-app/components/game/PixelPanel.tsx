import type { ReactNode } from "react";

interface PixelPanelProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function PixelPanel({
  title,
  subtitle,
  rightSlot,
  className,
  children,
}: PixelPanelProps) {
  return (
    <section className={`pixel-panel ${className ?? ""}`}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="pixel-heading text-[0.92rem] uppercase tracking-[0.08em]">
            {title}
          </h2>
          {subtitle ? <p className="pixel-subtle mt-2 text-sm">{subtitle}</p> : null}
        </div>
        {rightSlot ? <div>{rightSlot}</div> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}
