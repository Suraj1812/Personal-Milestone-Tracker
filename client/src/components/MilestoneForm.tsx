import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement
} from "react";
import { getTodayDate } from "../lib/milestone-utils";
import {
  milestoneCategories,
  type CreateMilestoneInput,
  type Milestone,
  type MilestoneCategory
} from "../types";
import { StatusBanner } from "./StatusBanner";

export interface SubmissionResult {
  ok: boolean;
}

interface MilestoneFormProps {
  isSubmitting: boolean;
  editingMilestone: Milestone | null;
  errorMessage: string | null;
  successMessage: string | null;
  onCancelEditing: () => void;
  onStartEditing: () => void;
  onSubmit: (payload: CreateMilestoneInput) => Promise<SubmissionResult>;
}

export function MilestoneForm({
  isSubmitting,
  editingMilestone,
  errorMessage,
  successMessage,
  onCancelEditing,
  onStartEditing,
  onSubmit
}: MilestoneFormProps): ReactElement {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MilestoneCategory>("Work");
  const [date, setDate] = useState(getTodayDate());
  const trimmedTitle = title.trim();
  const titleError =
    trimmedTitle.length > 0 && trimmedTitle.length < 3
      ? "Title must be at least 3 characters long."
      : null;

  useEffect(() => {
    if (editingMilestone) {
      setTitle(editingMilestone.title);
      setCategory(editingMilestone.category);
      setDate(editingMilestone.date);
      return;
    }

    setTitle("");
    setCategory("Work");
    setDate(getTodayDate());
  }, [editingMilestone]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const result = await onSubmit({
      title,
      category,
      date
    });

    if (result.ok && !editingMilestone) {
      setTitle("");
      setCategory("Work");
      setDate(getTodayDate());
    }
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>): void {
    setTitle(event.target.value);
    onStartEditing();
  }

  function handleCategoryChange(categoryOption: MilestoneCategory): void {
    setCategory(categoryOption);
    onStartEditing();
  }

  function handleDateChange(event: ChangeEvent<HTMLInputElement>): void {
    setDate(event.target.value);
    onStartEditing();
  }

  const isSubmitDisabled = isSubmitting || trimmedTitle.length < 3 || date.length === 0;
  const isEditing = editingMilestone !== null;

  return (
    <section className="panel panel--form">
      <div className="panel__header">
        <div>
          <p className="eyebrow">{isEditing ? "Editing" : "Add"}</p>
          <h2>{isEditing ? "Edit milestone" : "New milestone"}</h2>
          <p className="panel__meta">
            {isEditing ? "Update the selected item." : "Add a title, date, and category."}
          </p>
        </div>
      </div>

      <form className="milestone-form" onSubmit={handleSubmit}>
        <label className="field">
          <div className="field__row">
            <span>Title</span>
            <small>{trimmedTitle.length}/3 minimum</small>
          </div>
          <input
            autoComplete="off"
            className={titleError ? "field__input field__input--error" : "field__input"}
            minLength={3}
            name="title"
            onChange={handleTitleChange}
            placeholder="e.g. Finished onboarding presentation"
            required
            value={title}
          />
          {titleError ? (
            <small className="field__hint field__hint--error">{titleError}</small>
          ) : (
            <small className="field__hint">Use a short, specific title.</small>
          )}
        </label>

        <label className="field">
          <div className="field__row">
            <span>Date</span>
          </div>
          <input
            className="field__input"
            name="date"
            onChange={handleDateChange}
            required
            type="date"
            value={date}
          />
        </label>

        <fieldset className="field fieldset">
          <legend>Category</legend>
          <div className="category-grid">
            {milestoneCategories.map((categoryOption) => (
              <label className="category-option" key={categoryOption}>
                <input
                  checked={category === categoryOption}
                  name="category"
                  onChange={() => handleCategoryChange(categoryOption)}
                  type="radio"
                  value={categoryOption}
                />
                <span>{categoryOption}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          {isEditing ? (
            <button className="secondary-button" onClick={onCancelEditing} type="button">
              Cancel
            </button>
          ) : null}
          <button className="primary-button" disabled={isSubmitDisabled} type="submit">
            {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Save"}
          </button>
        </div>
      </form>

      {errorMessage ? <StatusBanner message={errorMessage} tone="error" /> : null}
      {successMessage ? <StatusBanner message={successMessage} tone="success" /> : null}
    </section>
  );
}
