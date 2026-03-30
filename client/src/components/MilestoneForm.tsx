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
import { DialogShell } from "./DialogShell";

interface MilestoneFormProps {
  isSubmitting: boolean;
  editingMilestone: Milestone | null;
  onCancel: () => void;
  onSubmit: (payload: CreateMilestoneInput) => Promise<boolean>;
}

export function MilestoneForm({
  isSubmitting,
  editingMilestone,
  onCancel,
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
    await onSubmit({
      title,
      category,
      date
    });
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>): void {
    setTitle(event.target.value);
  }

  function handleCategoryChange(categoryOption: MilestoneCategory): void {
    setCategory(categoryOption);
  }

  function handleDateChange(event: ChangeEvent<HTMLInputElement>): void {
    setDate(event.target.value);
  }

  const isSubmitDisabled = isSubmitting || trimmedTitle.length < 3 || date.length === 0;
  const isEditing = editingMilestone !== null;

  return (
    <DialogShell
      description={isEditing ? "Update the selected task." : "Add a title, date, and category."}
      eyebrow={isEditing ? "Edit task" : "Add task"}
      onClose={onCancel}
      title={isEditing ? "Edit task" : "New task"}
    >
      <form className="milestone-form" onSubmit={handleSubmit}>
        <label className="field">
          <div className="field__row">
            <span>Title</span>
            <small>{trimmedTitle.length}/3</small>
          </div>
          <input
            autoComplete="off"
            autoFocus
            className={titleError ? "field__input field__input--error" : "field__input"}
            minLength={3}
            name="title"
            onChange={handleTitleChange}
            placeholder="Finished onboarding presentation"
            required
            value={title}
          />
          {titleError ? <small className="field__hint field__hint--error">{titleError}</small> : null}
        </label>

        <label className="field">
          <span>Date</span>
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
          <button className="secondary-button" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="primary-button" disabled={isSubmitDisabled} type="submit">
            {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}
