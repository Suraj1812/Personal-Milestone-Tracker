import { useState, type ReactElement } from "react";
import { ApiError, createMilestone } from "./api/milestones";
import { MilestoneForm } from "./components/MilestoneForm";
import { MilestoneList } from "./components/MilestoneList";
import { StatusBanner } from "./components/StatusBanner";
import { useMilestones } from "./hooks/useMilestones";
import type { CreateMilestoneInput } from "./types";

export function App(): ReactElement {
  const {
    milestones,
    isLoading,
    isRefreshing,
    errorMessage: listErrorMessage,
    refreshMilestones,
    syncCreatedMilestone
  } = useMilestones();

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const summaryText =
    milestones.length === 0
      ? "Start your story with the first milestone."
      : `${milestones.length} milestone${milestones.length === 1 ? "" : "s"} captured and counting.`;

  async function handleSubmit(payload: CreateMilestoneInput): Promise<{ ok: boolean }> {
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    try {
      const createdMilestone = await createMilestone(payload);
      await syncCreatedMilestone(createdMilestone);
      setSubmissionSuccess("Milestone saved successfully.");
      return { ok: true };
    } catch (error) {
      if (error instanceof ApiError) {
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
    await refreshMilestones();
  }

  const categories = new Set(milestones.map((milestone) => milestone.category));
  const categorySummary =
    categories.size === 0
      ? "No categories yet"
      : `${categories.size} active categor${categories.size === 1 ? "y" : "ies"}`;

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Personal Milestone Tracker</p>
          <h1>Capture the moments that move you forward.</h1>
          <p className="hero__description">
            A calm dashboard for recording progress across work, personal life, and health with real backend validation and resilient state handling.
          </p>
        </div>

        <div className="hero__stats" aria-label="Milestone summary">
          <article className="stat-card">
            <span>Total milestones</span>
            <strong>{milestones.length}</strong>
          </article>
          <article className="stat-card">
            <span>Categories in motion</span>
            <strong>{categorySummary}</strong>
          </article>
          <article className="stat-card">
            <span>Current state</span>
            <strong>{summaryText}</strong>
          </article>
        </div>
      </section>

      {!listErrorMessage && !isLoading ? <StatusBanner message={summaryText} tone="info" /> : null}

      <section className="workspace">
        <MilestoneList
          errorMessage={listErrorMessage}
          isLoading={isLoading}
          isRefreshing={isRefreshing}
          milestones={milestones}
          onRefresh={handleRefresh}
        />
        <MilestoneForm
          errorMessage={submissionError}
          isSubmitting={isSubmitting}
          onStartEditing={clearSubmissionMessages}
          onSubmit={handleSubmit}
          successMessage={submissionSuccess}
        />
      </section>
    </main>
  );
}
