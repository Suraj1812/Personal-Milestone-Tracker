import type { ReactElement } from "react";
import type { Milestone } from "../types";
import { DialogShell } from "./DialogShell";

interface DeleteDialogProps {
  milestone: Milestone;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDialog({
  milestone,
  isDeleting,
  onCancel,
  onConfirm
}: DeleteDialogProps): ReactElement {
  return (
    <DialogShell
      description="This removes the task from the log."
      eyebrow="Delete task"
      onClose={onCancel}
      title="Delete this task?"
    >
      <div className="delete-dialog">
        <div className="delete-dialog__summary">
          <p className="delete-dialog__title">{milestone.title}</p>
          <div className="delete-dialog__meta">
            <span className={`category-pill category-pill--${milestone.category.toLowerCase()}`}>
              {milestone.category}
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button className="secondary-button" disabled={isDeleting} onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="primary-button primary-button--danger"
            disabled={isDeleting}
            onClick={() => void onConfirm()}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete task"}
          </button>
        </div>
      </div>
    </DialogShell>
  );
}
