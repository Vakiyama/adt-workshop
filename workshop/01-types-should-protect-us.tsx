import { useState } from 'react';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 01 ‣ TYPES SHOULD PROTECT US — *null isn’t enough*
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  Premise
 *  -------
 *  A single object with nullable fields often allows **impossible
 *  combinations**.  A tiny discriminated-union eliminates them.
 *
 */

/* ───────────────────────────── 1. THE PITFALL ────────────────────────────── */
/**
 * Scenario: controlling a modal dialog.
 *    • `isOpen`  ▶ whether it’s visible
 *    • `title`   ▶ heading to display (nullable)
 *
 *  The type permits two invalid states:
 *    A) `isOpen: false` *but* `title` still set
 *    B) `isOpen: true`  *and* `title` accidentally left null
 */
type ModalLoose = {
  isOpen: boolean;
  title: string | null;
};

export function NaiveModalDemo() {
  const [modal, setModal] = useState<ModalLoose>({
    isOpen: false,
    title: null,
  });

  // ⚠️ every render we must remember BOTH checks
  if (!modal.isOpen) return null;
  // if (modal.title === null) return null; // easy to forget: let's say we did

  return (
    <dialog open>
      {/* we shouldn't ever have to handle this case... */}
      <h2>{modal.title ? modal.title : 'No title?'}</h2>{' '}
      <button onClick={() => setModal({ isOpen: false, title: null })}>
        Close
      </button>
    </dialog>
  );
}

/* ───────────────────── 2. MINIMALLY BETTER WITH A UNION ──────────────────── */

type ModalState = { tag: 'Closed' } | { tag: 'Open'; title: string };

export function SafeModalDemo() {
  const [modal, setModal] = useState<ModalState>({ tag: 'Closed' });

  if (modal.tag === 'Closed') return null;

  // modal.tag === "Open" ⇒ title is guaranteed
  return (
    <dialog open>
      <h2>{modal.title}</h2>
      <button onClick={() => setModal({ tag: 'Closed' })}>Close</button>
    </dialog>
  );
}

/*  Why this helps
    --------------
    • “Closed + title” and “Open + null” cannot be expressed — compiler error.
    • Only ONE branch renders, so there’s no duplicated guard.
    • Any helper receiving `ModalState` handles both variants exactly once.
*/

/* ───────────────────────── 3. TODO — HANDS-ON TASKS ──────────────────────── */

/**
 * ✎ 3.1  Add an “Open” button to <SafeModalDemo/> that sets
 *        `{ tag: "Open", title: "Settings" }`.
 *
 * ✎ 3.2  Extend `ModalState` with an `"Opening"` variant used
 *        while an async request fetches the title.  Let TypeScript
 *        guide you to every new switch you must update.
 */
