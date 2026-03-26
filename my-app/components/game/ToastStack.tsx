import type { ToastItem } from "@/types/game";

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (toastId: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <aside className="toast-stack" aria-live="polite" aria-label="Varsler">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item kind-${toast.kind}`}>
          <p>{toast.message}</p>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => onDismiss(toast.id)}
            aria-label="Lukk varsel"
          >
            x
          </button>
        </div>
      ))}
    </aside>
  );
}
