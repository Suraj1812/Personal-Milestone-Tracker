import type { ReactElement } from "react";
import { formatTimestamp } from "../lib/milestone-utils";
import type { Milestone } from "../types";

interface MilestoneCardProps {
  milestone: Milestone;
  isDeleting: boolean;
  isEditing: boolean;
  isPendingDelete: boolean;
  onRequestDeleteMilestone: (milestone: Milestone) => void;
  onEditMilestone: (milestone: Milestone) => void;
}

export function MilestoneCard({
  milestone,
  isDeleting,
  isEditing,
  isPendingDelete,
  onRequestDeleteMilestone,
  onEditMilestone
}: MilestoneCardProps): ReactElement {
  const wasEdited = milestone.updatedAt !== milestone.createdAt;

  return (
    <li
      className={
        isEditing
          ? `milestone-card milestone-card--${milestone.category.toLowerCase()} milestone-card--editing`
          : isPendingDelete
            ? `milestone-card milestone-card--${milestone.category.toLowerCase()} milestone-card--pending`
            : `milestone-card milestone-card--${milestone.category.toLowerCase()}`
      }
    >
      <div className="milestone-card__body">
        <div className="milestone-card__headline">
          <p className="milestone-card__title">{milestone.title}</p>
          {isEditing ? <span className="milestone-card__editing-badge">Editing</span> : null}
        </div>
        <div className="milestone-card__details">
          <span className={`category-pill category-pill--${milestone.category.toLowerCase()}`}>
            {milestone.category}
          </span>
          <span className="milestone-card__detail">
            {wasEdited ? "Updated" : "Saved"} {formatTimestamp(milestone.updatedAt)}
          </span>
        </div>
      </div>
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
          onClick={() => onRequestDeleteMilestone(milestone)}
          type="button"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </li>
  );
}
