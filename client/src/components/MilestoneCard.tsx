import type { ReactElement } from "react";
import { formatMilestoneDate, formatTimestamp } from "../lib/milestone-utils";
import type { Milestone } from "../types";

interface MilestoneCardProps {
  milestone: Milestone;
  isDeleting: boolean;
  isEditing: boolean;
  onDeleteMilestone: (milestone: Milestone) => Promise<void>;
  onEditMilestone: (milestone: Milestone) => void;
}

export function MilestoneCard({
  milestone,
  isDeleting,
  isEditing,
  onDeleteMilestone,
  onEditMilestone
}: MilestoneCardProps): ReactElement {
  const wasEdited = milestone.updatedAt !== milestone.createdAt;

  return (
    <li
      className={
        isEditing
          ? `milestone-card milestone-card--${milestone.category.toLowerCase()} milestone-card--editing`
          : `milestone-card milestone-card--${milestone.category.toLowerCase()}`
      }
    >
      <div className="milestone-card__top">
        <div className="milestone-card__badges">
          <span className={`category-pill category-pill--${milestone.category.toLowerCase()}`}>
            {milestone.category}
          </span>
          {isEditing ? <span className="milestone-card__editing-badge">Editing</span> : null}
        </div>
        <span className="milestone-card__tracked-date">{formatMilestoneDate(milestone.date)}</span>
      </div>

      <p className="milestone-card__title">{milestone.title}</p>

      <div className="milestone-card__footer">
        <small className="milestone-card__meta">
          {wasEdited ? "Updated" : "Saved"} {formatTimestamp(milestone.updatedAt)}
        </small>
        <div className="milestone-card__actions">
          <button
            aria-pressed={isEditing}
            className={isEditing ? "action-button action-button--active" : "action-button"}
            onClick={() => onEditMilestone(milestone)}
            type="button"
          >
            Edit
          </button>
          <button
            className="action-button action-button--danger"
            disabled={isDeleting}
            onClick={() => onDeleteMilestone(milestone)}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </li>
  );
}
