import type { ChangeEvent, ReactElement } from "react";
import { milestoneCategories } from "../types";
import type { MilestoneFilterCategory } from "../lib/milestone-utils";

interface MilestoneFiltersProps {
  activeCategoryFilter: MilestoneFilterCategory;
  filterCounts: Record<MilestoneFilterCategory, number>;
  startDate: string;
  endDate: string;
  onCategoryFilterChange: (filter: MilestoneFilterCategory) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClearFilters: () => void;
}

export function MilestoneFilters({
  activeCategoryFilter,
  filterCounts,
  startDate,
  endDate,
  onCategoryFilterChange,
  onStartDateChange,
  onEndDateChange,
  onClearFilters
}: MilestoneFiltersProps): ReactElement {
  function handleStartDateChange(event: ChangeEvent<HTMLInputElement>): void {
    onStartDateChange(event.target.value);
  }

  function handleEndDateChange(event: ChangeEvent<HTMLInputElement>): void {
    onEndDateChange(event.target.value);
  }

  const hasActiveFilters =
    activeCategoryFilter !== "All" || startDate.length > 0 || endDate.length > 0;

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
      </div>

      <div className="date-filters">
        <label className="date-filter">
          <span>From</span>
          <input
            className="field__input field__input--compact"
            max={endDate || undefined}
            onChange={handleStartDateChange}
            type="date"
            value={startDate}
          />
        </label>
        <label className="date-filter">
          <span>To</span>
          <input
            className="field__input field__input--compact"
            min={startDate || undefined}
            onChange={handleEndDateChange}
            type="date"
            value={endDate}
          />
        </label>
        {hasActiveFilters ? (
          <button className="secondary-button secondary-button--compact" onClick={onClearFilters} type="button">
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
