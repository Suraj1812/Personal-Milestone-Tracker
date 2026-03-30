import type { ReactElement } from "react";
import { milestoneCategories } from "../types";
import type { MilestoneFilterCategory } from "../lib/milestone-utils";

interface MilestoneFiltersProps {
  activeCategoryFilter: MilestoneFilterCategory;
  filterCounts: Record<MilestoneFilterCategory, number>;
  onCategoryFilterChange: (filter: MilestoneFilterCategory) => void;
  onClearFilters: () => void;
}

export function MilestoneFilters({
  activeCategoryFilter,
  filterCounts,
  onCategoryFilterChange,
  onClearFilters
}: MilestoneFiltersProps): ReactElement {
  const hasActiveFilters = activeCategoryFilter !== "All";

  return (
    <div className="filter-toolbar">
      <div className="filter-row" aria-label="Milestone category filters">
        <button
          className={
            activeCategoryFilter === "All" ? "filter-chip filter-chip--active" : "filter-chip"
          }
          onClick={() => onCategoryFilterChange("All")}
          type="button"
        >
          <span>All</span>
          <strong>{filterCounts.All}</strong>
        </button>
        {milestoneCategories.map((category) => (
          <button
            className={
              activeCategoryFilter === category ? "filter-chip filter-chip--active" : "filter-chip"
            }
            key={category}
            onClick={() => onCategoryFilterChange(category)}
            type="button"
          >
            <span>{category}</span>
            <strong>{filterCounts[category]}</strong>
          </button>
        ))}
        {hasActiveFilters ? (
          <button className="secondary-button secondary-button--compact" onClick={onClearFilters} type="button">
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
