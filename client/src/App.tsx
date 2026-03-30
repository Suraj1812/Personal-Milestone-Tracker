import { useEffect, useState, type ReactElement } from "react";
import { MilestoneForm } from "./components/MilestoneForm";
import { MilestoneList } from "./components/MilestoneList";
import {
  countMilestonesInLast30Days,
  filterMilestones,
  formatMilestoneDate,
  type MilestoneFilterCategory
} from "./lib/milestone-utils";
import { useMilestones } from "./hooks/useMilestones";
import type { CreateMilestoneInput, Milestone } from "./types";

export function App(): ReactElement {
  const {
    milestones,
    isLoading,
    isRefreshing,
    errorMessage: listErrorMessage,
    refreshMilestones,
    createMilestoneOptimistic,
    updateMilestoneOptimistic,
    deleteMilestoneOptimistic
  } = useMilestones();

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<MilestoneFilterCategory>("All");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  useEffect(() => {
    if (!submissionSuccess) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmissionSuccess(null);
    }, 2200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [submissionSuccess]);

  async function handleSubmit(payload: CreateMilestoneInput): Promise<{ ok: boolean }> {
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      if (editingMilestone) {
        await updateMilestoneOptimistic(editingMilestone.id, payload);
        setEditingMilestone(null);
        setSubmissionSuccess("Milestone updated.");
      } else {
        await createMilestoneOptimistic(payload);
        setSubmissionSuccess("Milestone saved.");
      }

      return { ok: true };
    } catch (error) {
      if (error instanceof Error) {
        setSubmissionError(error.message);
      } else {
        setSubmissionError("We could not save your milestone. Please try again.");
      }

      return { ok: false };
    } finally {
      setIsSubmitting(false);
    }
  }

  function clearSubmissionMessages(): void {
    if (submissionError || submissionSuccess) {
      setSubmissionError(null);
      setSubmissionSuccess(null);
    }
  }

  async function handleRefresh(): Promise<void> {
    try {
      await refreshMilestones();
    } catch {
      // SWR already exposes the latest fetch error through component state.
    }
  }

  async function handleDeleteMilestone(milestone: Milestone): Promise<void> {
    setDeletingMilestoneId(milestone.id);
    clearSubmissionMessages();

    try {
      await deleteMilestoneOptimistic(milestone.id);

      if (editingMilestone?.id === milestone.id) {
        setEditingMilestone(null);
      }

      setSubmissionSuccess("Milestone deleted.");
    } catch (error) {
      if (error instanceof Error) {
        setSubmissionError(error.message);
      } else {
        setSubmissionError("We could not delete your milestone. Please try again.");
      }
    } finally {
      setDeletingMilestoneId(null);
    }
  }

  function handleEditMilestone(milestone: Milestone): void {
    setEditingMilestone(milestone);
    clearSubmissionMessages();
  }

  function handleCancelEditing(): void {
    setEditingMilestone(null);
    clearSubmissionMessages();
  }

  function clearFilters(): void {
    setActiveCategoryFilter("All");
    setStartDateFilter("");
    setEndDateFilter("");
  }

  const filteredMilestones = filterMilestones(milestones, {
    category: activeCategoryFilter,
    startDate: startDateFilter,
    endDate: endDateFilter
  });
  const activeFilters = {
    category: activeCategoryFilter,
    startDate: startDateFilter,
    endDate: endDateFilter
  };
  const milestonesInLast30Days = countMilestonesInLast30Days(milestones);
  const latestMilestone = milestones[0] ?? null;
  const latestMilestoneLabel = latestMilestone ? latestMilestone.title : "Nothing logged yet";
  const filterCounts: Record<MilestoneFilterCategory, number> = {
    All: milestones.length,
    Work: milestones.filter((milestone) => milestone.category === "Work").length,
    Personal: milestones.filter((milestone) => milestone.category === "Personal").length,
    Health: milestones.filter((milestone) => milestone.category === "Health").length
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header__main">
          <div className="brand-row">
            <img alt="" aria-hidden="true" className="brand-mark" src="/logo-icon.svg" />
            <div>
              <p className="eyebrow">Milestones</p>
              <h1>Personal Milestone Tracker</h1>
            </div>
          </div>
          <p className="app-header__note">Track progress by date and category.</p>
        </div>

        <div className="app-stats" aria-label="Milestone summary">
          <article className="stat-chip">
            <span>Total</span>
            <strong>{milestones.length}</strong>
          </article>
          <article className="stat-chip">
            <span>Last 30 days</span>
            <strong>{milestonesInLast30Days}</strong>
          </article>
          <article className="stat-chip stat-chip--wide">
            <span>Latest</span>
            <strong>{formatMilestoneDate(latestMilestone?.date ?? null)}</strong>
            <small>{latestMilestoneLabel}</small>
          </article>
        </div>
      </header>

      <section className="workspace">
        <MilestoneList
          activeFilters={activeFilters}
          deletingMilestoneId={deletingMilestoneId}
          editingMilestoneId={editingMilestone?.id ?? null}
          errorMessage={listErrorMessage}
          filterCounts={filterCounts}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          milestones={filteredMilestones}
          onClearFilters={clearFilters}
          onDeleteMilestone={handleDeleteMilestone}
          onEditMilestone={handleEditMilestone}
          onEndDateFilterChange={setEndDateFilter}
          onRefresh={handleRefresh}
          onSelectCategoryFilter={setActiveCategoryFilter}
          onStartDateFilterChange={setStartDateFilter}
          totalMilestones={milestones.length}
        />
        <MilestoneForm
          editingMilestone={editingMilestone}
          errorMessage={submissionError}
          isSubmitting={isSubmitting}
          onCancelEditing={handleCancelEditing}
          onStartEditing={clearSubmissionMessages}
          onSubmit={handleSubmit}
          successMessage={submissionSuccess}
        />
      </section>
    </main>
  );
}
