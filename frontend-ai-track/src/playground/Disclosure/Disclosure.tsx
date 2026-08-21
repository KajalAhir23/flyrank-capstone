import { useId, useState, type ReactNode } from "react";

interface DisclosureProps {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: DisclosureProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="disclosure">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
        className="disclosure-trigger"
      >
        <span aria-hidden="true" className="disclosure-icon">
          {isOpen ? "▾" : "▸"}
        </span>
        {summary}
      </button>

      <div
        id={contentId}
        role="region"
        hidden={!isOpen}
        className="disclosure-content"
      >
        {children}
      </div>
    </div>
  );
}