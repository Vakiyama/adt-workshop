/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 02 ‣ FLAGS vs. UNIONS — *the “eight-state” query bug*
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  Goal ▶ Show how a tiny discriminated union eliminates four impossible
 *          combinations the flag-object happily allows.
 *
 *  Still **plain TypeScript**; no external libraries yet.
 */

/* ───────────────────────────── 1. THE PITFALL ────────────────────────────── */

type Data = { data: string };
type Err = { error: string; status: number };

// Just like Tanstack Query!
type QueryResult = {
  data: Data | undefined; // present on success
  error: Err | undefined; // present on failure
  isLoading: boolean; // true while fetching
};

/*
  How many concrete states?  2 × 2 × 2 = 8.

      data        isLoading  error      ▶ Meaning 
  ────────────────────────────────────────────────────────
 1.  undefined    false      undefined   TODO
 2.  Data         false      undefined   TODO
 3.  undefined    true       undefined   TODO
 4.  undefined    false      Err         TODO
 5.  Data         true       Err         TODO
 6.  Data         true       undefined   TODO
 7.  Data         false      Err         TODO 
 8.  undefined    true       Err         TODO 
*/

// TODO [] Fill in the meanings as best you can

// TODO [] Implement render query. Give back a string that handles each case (it's ok to give up).
export function renderQuery(q: QueryResult): string {
  return 'TODO';
}

/* ───────────────────── 2. A MINIMALLY BETTER MODEL ───────────────────────── */

type QueryState =
  | { tag: 'Idle' }
  | { tag: 'Loading' }
  | { tag: 'Success'; data: Data }
  | { tag: 'Failure'; error: Err };

export function renderState(state: QueryState): string {
  switch (state.tag) {
    case 'Idle':
      return 'Idle';
    case 'Loading':
      return '⏳ Loading…';
    case 'Success':
      return `✅ ${state.data.data}`;
    case 'Failure':
      return `💥 ${state.error.error} (${state.error.status})`;
  }
}

/*  Why this helps
    --------------
    • Impossible states 5-8 can no longer compile.
    • Each consumer writes ONE switch; impossible to forget a branch (TS error
      if the default is removed and a new variant is added later).
    • No more triple-`if` spaghetti at every usage site.
*/

/* ───────────────────────── 3. TODO — HANDS-ON TASKS ─────────────────────── */

/**
 * TODO [] Add a new variant `"Stale"` to `QueryState`
 *        representing cached data older than 5 minutes.
 *        Observe how TypeScript flags *every* switch that ignores it.
 */
