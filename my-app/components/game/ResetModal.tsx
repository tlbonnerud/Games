interface ResetModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetModal({ open, onCancel, onConfirm }: ResetModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h2 className="pixel-heading text-[0.92rem] uppercase tracking-[0.08em]">
          Nullstill fremdrift?
        </h2>
        <p className="pixel-subtle mt-3 text-sm">
          Dette sletter lagret progresjon for denne gården. Du kan ikke angre.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button type="button" className="pixel-btn" onClick={onCancel}>
            Avbryt
          </button>
          <button type="button" className="pixel-btn danger" onClick={onConfirm}>
            Nullstill
          </button>
        </div>
      </div>
    </div>
  );
}
