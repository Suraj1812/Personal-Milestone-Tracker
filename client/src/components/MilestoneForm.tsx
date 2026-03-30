import { useState, type ChangeEvent, type FormEvent, type ReactElement } from "react";
import { milestoneCategories, type CreateMilestoneInput, type MilestoneCategory } from "../types";
import { StatusBanner } from "./StatusBanner";

export interface SubmissionResult {
  ok: boolean;
}

interface MilestoneFormProps {
  isSubmitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onStartEditing: () => void;
  onSubmit: (payload: CreateMilestoneInput) => Promise<SubmissionResult>;
}

export function MilestoneForm({
  isSubmitting,
  errorMessage,
  successMessage,
  onStartEditing,
  onSubmit
}: MilestoneFormProps): ReactElement {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MilestoneCategory>("Work");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const result = await onSubmit({
      title,
      category
    });

    if (result.ok) {
      setTitle("");
      setCategory("Work");
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

  return (
    <section className="panel panel--accent">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Submission Form</p>
          <h2>Add a milestone</h2>
        </div>
      </div>

      <form className="milestone-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Title</span>
          <input
            autoComplete="off"
            className="field__input"
            minLength={3}
            name="title"
            onChange={handleTitleChange}
            placeholder="What did you achieve?"
            required
            value={title}
          />
          <small>Use at least 3 characters so the milestone is descriptive.</small>
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

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Submit milestone"}
        </button>
      </form>

      {errorMessage ? <StatusBanner message={errorMessage} tone="error" /> : null}
      {successMessage ? <StatusBanner message={successMessage} tone="success" /> : null}
    </section>
  );
}
