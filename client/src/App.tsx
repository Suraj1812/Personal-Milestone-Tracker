import { useEffect, useState, type ReactElement } from "react";
import { Toaster, toast } from "sonner";
import { DeleteDialog } from "./components/DeleteDialog";
import { MilestoneForm } from "./components/MilestoneForm";
import { MilestoneList } from "./components/MilestoneList";
import { filterMilestones, type MilestoneFilterCategory } from "./lib/milestone-utils";
import { useMilestones } from "./hooks/useMilestones";
import type { CreateMilestoneInput, Milestone } from "./types";

type ActiveDialog =
  | {
      type: "task";
      milestone: Milestone | null;
    }
  | {
      type: "delete";
      milestone: Milestone;
    }
  | null;

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMilestoneId, setDeletingMilestoneId] = useState<string | null>(null);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<MilestoneFilterCategory>("All");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  const editingMilestone =
    activeDialog?.type === "task" ? activeDialog.milestone : null;
  const milestonePendingDelete =
    activeDialog?.type === "delete" ? activeDialog.milestone : null;

  useEffect(() => {
    if (!activeDialog) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !isSubmitting && deletingMilestoneId === null) {
        setActiveDialog(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDialog, deletingMilestoneId, isSubmitting]);

  function closeDialog(): void {
    if (isSubmitting || deletingMilestoneId !== null) {
      return;
    }

    setActiveDialog(null);
  }

  async function handleSubmit(payload: CreateMilestoneInput): Promise<boolean> {
    setIsSubmitting(true);

    try {
      if (editingMilestone) {
        await updateMilestoneOptimistic(editingMilestone.id, payload);
        toast.success("Task updated.");
      } else {
        await createMilestoneOptimistic(payload);
        toast.success("Task added.");
      }

      setActiveDialog(null);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not save your task. Please try again."));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRefresh(): Promise<void> {
    try {
      await refreshMilestones();
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not refresh tasks right now."));
    }
  }

  function handleRequestDeleteMilestone(milestone: Milestone): void {
    setActiveDialog({
      type: "delete",
      milestone
    });
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!milestonePendingDelete) {
      return;
    }

    setDeletingMilestoneId(milestonePendingDelete.id);

    try {
      await deleteMilestoneOptimistic(milestonePendingDelete.id);
      setActiveDialog(null);
      toast.success("Task deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "We could not delete your task. Please try again."));
    } finally {
      setDeletingMilestoneId(null);
    }
  }

  function handleEditMilestone(milestone: Milestone): void {
    setActiveDialog({
      type: "task",
      milestone
    });
  }

  function handleOpenComposer(): void {
    setActiveDialog({
      type: "task",
      milestone: null
    });
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
  const filterCounts: Record<MilestoneFilterCategory, number> = {
    All: milestones.length,
    Work: milestones.filter((milestone) => milestone.category === "Work").length,
    Personal: milestones.filter((milestone) => milestone.category === "Personal").length,
    Health: milestones.filter((milestone) => milestone.category === "Health").length
  };

  return (
    <>
      <Toaster
        closeButton
        position="top-right"
        richColors
        toastOptions={{
          duration: 2200
        }}
      />

      <main className="app-shell">
        <section className="workspace workspace--single">
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
            onEditMilestone={handleEditMilestone}
            onEndDateFilterChange={setEndDateFilter}
            onOpenComposer={handleOpenComposer}
            onRefresh={handleRefresh}
            onRequestDeleteMilestone={handleRequestDeleteMilestone}
            onSelectCategoryFilter={setActiveCategoryFilter}
            onStartDateFilterChange={setStartDateFilter}
            pendingDeleteMilestoneId={milestonePendingDelete?.id ?? null}
            totalMilestones={milestones.length}
          />
        </section>

        {activeDialog ? (
          <div className="modal-backdrop" onClick={closeDialog}>
            <div className="modal-shell" onClick={(event) => event.stopPropagation()}>
              {activeDialog.type === "task" ? (
                <MilestoneForm
                  editingMilestone={editingMilestone}
                  isSubmitting={isSubmitting}
                  onCancel={closeDialog}
                  onSubmit={handleSubmit}
                />
              ) : (
                <DeleteDialog
                  isDeleting={deletingMilestoneId === activeDialog.milestone.id}
                  milestone={activeDialog.milestone}
                  onCancel={closeDialog}
                  onConfirm={handleConfirmDelete}
                />
              )}
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
