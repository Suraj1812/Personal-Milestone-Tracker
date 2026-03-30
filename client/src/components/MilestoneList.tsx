import type { ReactElement } from "react";
import type { Milestone } from "../types";

interface MilestoneListProps {
  milestones: Milestone[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  onRefresh: () => Promise<void>;
}

function formatDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

export function MilestoneList({
  milestones,
  isLoading,
  isRefreshing,
  errorMessage,
  onRefresh
}: MilestoneListProps): ReactElement {
  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Milestone feed</h2>
        </div>
        <button className="secondary-button" onClick={onRefresh} type="button">
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {errorMessage ? (
        <div className="empty-state empty-state--error" role="alert">
          <h3>We could not load your milestones.</h3>
          <p>{errorMessage}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="milestone-skeletons" aria-live="polite" aria-busy="true">
          <div className="milestone-skeleton" />
          <div className="milestone-skeleton" />
          <div className="milestone-skeleton" />
        </div>
      ) : null}

      {!isLoading && !errorMessage && milestones.length === 0 ? (
        <div className="empty-state">
          <h3>No milestones found</h3>
          <p>Add your first milestone to start building your personal timeline.</p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && milestones.length > 0 ? (
        <ol className="milestone-list">
          {milestones.map((milestone) => (
            <li className="milestone-card" key={milestone.id}>
              <div className="milestone-card__top">
                <span className={`category-pill category-pill--${milestone.category.toLowerCase()}`}>
                  {milestone.category}
                </span>
                <time dateTime={milestone.createdAt}>{formatDate(milestone.createdAt)}</time>
              </div>
              <p className="milestone-card__title">{milestone.title}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
