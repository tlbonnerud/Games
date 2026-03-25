import type { ToastItem } from "@/types/game";

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (toastId: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <aside className="toast-stack" aria-live="polite" aria-label="Varsler">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={`toast-item kind-${toast.kind}`}
          onClick={() => onDismiss(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </aside>
  );
}
