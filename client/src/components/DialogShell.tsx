import { useId, type ReactElement, type ReactNode } from "react";

interface DialogShellProps {
  eyebrow: string;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export function DialogShell({
  eyebrow,
  title,
  description,
  onClose,
  children
}: DialogShellProps): ReactElement {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="dialog-panel"
      role="dialog"
    >
      <header className="dialog-panel__header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
          {description ? (
            <p className="dialog-panel__meta" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>
        <button
          aria-label="Close dialog"
          className="icon-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      </header>

      {children}
    </section>
  );
}
