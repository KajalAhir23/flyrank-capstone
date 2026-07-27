import { useRef, useState } from "react";
import { Modal } from "./playground/Modal/Modal";
import { Tabs } from "./playground/Tabs/Tabs";
import { Disclosure } from "./playground/Disclosure/Disclosure";
import "./App.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <main className="app">
      <h1>Accessible Component Playground</h1>

      <section>
        <h2>Modal</h2>
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Open modal
        </button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          titleId="demo-modal-title"
          title="Example Modal"
          triggerRef={openButtonRef}
        >
          <p>
            Try tabbing through this dialog — focus should stay trapped
            inside. Press Escape to close.
          </p>
          <input type="text" placeholder="Some input" />
        </Modal>
      </section>

      <section>
        <h2>Tabs</h2>
        <Tabs
          label="Example tabs"
          items={[
            { id: "one", label: "First", content: <p>Content for tab one.</p> },
            { id: "two", label: "Second", content: <p>Content for tab two.</p> },
            { id: "three", label: "Third", content: <p>Content for tab three.</p> },
          ]}
        />
      </section>

      <section>
        <h2>Disclosure</h2>
        <Disclosure summary="Click or press Enter to expand">
          <p>Hidden content revealed by the disclosure.</p>
        </Disclosure>
      </section>
    </main>
  );
}

export default App;