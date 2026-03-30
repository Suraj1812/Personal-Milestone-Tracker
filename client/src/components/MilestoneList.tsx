import type { ReactElement } from "react";
import type { MilestoneFilters as MilestoneFilterValues, MilestoneFilterCategory } from "../lib/milestone-utils";
import type { Milestone } from "../types";
import { MilestoneCard } from "./MilestoneCard";
import { MilestoneFilters } from "./MilestoneFilters";

interface MilestoneListProps {
  activeFilters: MilestoneFilterValues;
  milestones: Milestone[];
  totalMilestones: number;
  isLoading: boolean;
  isRefreshing: boolean;
  deletingMilestoneId: string | null;
  editingMilestoneId: string | null;
  pendingDeleteMilestoneId: string | null;
  errorMessage: string | null;
  filterCounts: Record<MilestoneFilterCategory, number>;
  onOpenComposer: () => void;
  onRefresh: () => Promise<void>;
  onSelectCategoryFilter: (filter: MilestoneFilterCategory) => void;
  onClearFilters: () => void;
  onEditMilestone: (milestone: Milestone) => void;
  onRequestDeleteMilestone: (milestone: Milestone) => void;
}

export function MilestoneList({
  activeFilters,
  milestones,
  totalMilestones,
  isLoading,
  isRefreshing,
  deletingMilestoneId,
  editingMilestoneId,
  pendingDeleteMilestoneId,
  errorMessage,
  filterCounts,
  onOpenComposer,
  onRefresh,
  onSelectCategoryFilter,
  onClearFilters,
  onEditMilestone,
  onRequestDeleteMilestone
}: MilestoneListProps): ReactElement {
  const hasActiveFilters = activeFilters.category !== "All";

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>{hasActiveFilters ? "Filtered tasks" : "Tasks"}</h2>
          <p className="panel__meta">
            {hasActiveFilters
              ? `Showing ${milestones.length} of ${totalMilestones}`
              : `${totalMilestones} total`}
          </p>
        </div>
        <div className="panel__actions">
          <button className="primary-button primary-button--compact" onClick={onOpenComposer} type="button">
            Add task
          </button>
          <button className="secondary-button secondary-button--compact" onClick={onRefresh} type="button">
            {isRefreshing ? "Refreshing..." : "Reload"}
          </button>
        </div>
      </div>

      <MilestoneFilters
        activeCategoryFilter={activeFilters.category}
        filterCounts={filterCounts}
        onCategoryFilterChange={onSelectCategoryFilter}
        onClearFilters={onClearFilters}
      />

      {errorMessage ? (
        <div className="empty-state empty-state--error" role="alert">
          <h3>Couldn&apos;t load entries.</h3>
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
          <h3>
            {hasActiveFilters
              ? "No matches"
              : "No entries yet"}
          </h3>
          <p>
            {hasActiveFilters
              ? "Try another range or category."
              : "Use Add task to create one."}
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && milestones.length > 0 ? (
        <ol className="milestone-list">
          {milestones.map((milestone) => (
            <MilestoneCard
              isDeleting={deletingMilestoneId === milestone.id}
              isEditing={editingMilestoneId === milestone.id}
              isPendingDelete={pendingDeleteMilestoneId === milestone.id}
              key={milestone.id}
              milestone={milestone}
              onRequestDeleteMilestone={onRequestDeleteMilestone}
              onEditMilestone={onEditMilestone}
            />
          ))}
        </ol>
      ) : null}
    </section>
  );
}
