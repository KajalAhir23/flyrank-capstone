import { useRef, useState, type ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  label: string;
}

export function Tabs({ items, label }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusTab(index: number) {
    const wrapped = (index + items.length) % items.length;
    setActiveIndex(wrapped);
    tabRefs.current[wrapped]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(items.length - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tabs-list">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${item.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={handleKeyDown}
            className="tabs-tab"
          >
            {item.label}
          </button>
        ))}
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className="tabs-panel"
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}