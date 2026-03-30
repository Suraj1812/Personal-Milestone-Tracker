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
  errorMessage: string | null;
  filterCounts: Record<MilestoneFilterCategory, number>;
  onRefresh: () => Promise<void>;
  onSelectCategoryFilter: (filter: MilestoneFilterCategory) => void;
  onStartDateFilterChange: (value: string) => void;
  onEndDateFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => Promise<void>;
}

export function MilestoneList({
  activeFilters,
  milestones,
  totalMilestones,
  isLoading,
  isRefreshing,
  deletingMilestoneId,
  editingMilestoneId,
  errorMessage,
  filterCounts,
  onRefresh,
  onSelectCategoryFilter,
  onStartDateFilterChange,
  onEndDateFilterChange,
  onClearFilters,
  onEditMilestone,
  onDeleteMilestone
}: MilestoneListProps): ReactElement {
  const hasActiveFilters =
    activeFilters.category !== "All" ||
    activeFilters.startDate.length > 0 ||
    activeFilters.endDate.length > 0;

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Milestones</p>
          <h2>{hasActiveFilters ? "Filtered results" : "All milestones"}</h2>
          <p className="panel__meta">
            {milestones.length} of {totalMilestones}
          </p>
        </div>
        <button className="secondary-button" onClick={onRefresh} type="button">
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <MilestoneFilters
        activeCategoryFilter={activeFilters.category}
        endDate={activeFilters.endDate}
        filterCounts={filterCounts}
        onCategoryFilterChange={onSelectCategoryFilter}
        onClearFilters={onClearFilters}
        onEndDateChange={onEndDateFilterChange}
        onStartDateChange={onStartDateFilterChange}
        startDate={activeFilters.startDate}
      />

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
          <h3>
            {hasActiveFilters
              ? "No milestones match these filters"
              : "No milestones yet"}
          </h3>
          <p>
            {hasActiveFilters
              ? "Try widening the date range or switching categories."
              : "Add your first entry to start building a useful record of progress."}
          </p>
        </div>
      ) : null}

      {!isLoading && !errorMessage && milestones.length > 0 ? (
        <ol className="milestone-list">
          {milestones.map((milestone) => (
            <MilestoneCard
              isDeleting={deletingMilestoneId === milestone.id}
              isEditing={editingMilestoneId === milestone.id}
              key={milestone.id}
              milestone={milestone}
              onDeleteMilestone={onDeleteMilestone}
              onEditMilestone={onEditMilestone}
            />
          ))}
        </ol>
      ) : null}
    </section>
  );
}
