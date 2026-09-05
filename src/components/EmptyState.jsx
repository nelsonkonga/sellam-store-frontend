import { ArrowRight, Inbox } from "lucide-react";

export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-divider bg-section px-6 py-12 text-center">
      <Inbox className="text-text-muted" size={30} />
      <div>
        <h2 className="font-semibold text-text-primary">{title}</h2>
        {message && <p className="mt-1 text-sm text-text-muted">{message}</p>}
      </div>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover">
          {actionLabel} <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
