"use client";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 bg-white p-6 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.45)]">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          {description ? <p className="text-sm text-neutral-600">{description}</p> : null}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900 sm:w-auto"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-red-600 bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-transparent hover:text-red-600 sm:w-auto"
          >
            {loading ? "กำลังลบ..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

