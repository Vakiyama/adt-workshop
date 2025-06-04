import { fetchFallback, maybeWipe } from '../helpers/04-helpers';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 04 ‣ NULL vs. UNDEFINED
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  Take-away ▶ Both null and undefined replace the original type,
 *               so a single re-assignment forces you to reason about the
 *               entire union again.
 *
 */

/* ───────────────────────────── 1. MINI PITFALL ───────────────────────────── */

// TODO []: Which approach below is better? Null or undefined? Why?

export type NullableData = number | null;
export type UndefinableData = number | undefined;

type Horror = number | null | undefined;

// Bonus []: Ask 5 devs what null and undefined means to them and their difference.
// If they all answer the same, I'll buy you a drink.

/**
 * Same information, two values for empty.
 * Every consumer needs twin checks.
 */
export function consumeHorror(h: Horror) {
  if (h === null) return 'No data';
  if (h === undefined) return 'No data?';
  return `Got some numbers: ${h}`;
}

/* ───────────────────────────── 2. FORMAT NUMBER DEMO ─────────────────────────── */

/**
 *  Goal: format a number as currency.
 *  Reality: watch how the type drifts through control-flow.
 */
export function formatNumber(raw: number | null | undefined) {
  // ── Stage 0 ───────────────────────────────────────────────────────────────
  let value = raw; // number | null | undefined

  /* Early guard
     ----------
     `!value` looks slick, but 0 is falsy —
     we just discarded a perfectly valid number. */
  if (!value) return 'No data (early)';

  // Narrowed to number ✔
  if (value === null || value === undefined) return 'No data..';

  // ── Stage 1 — side-effect helper may re-introduce null/undefined ──────────
  if (Math.random() > 0.5) {
    value = maybeWipe(value); // ⇒ number | null
  }

  // ── Stage 2 — nested loops widen it again ─────────────────────────────────
  outer: for (const _ of [1, 2, 3]) {
    for (let i = 0; i < 5; i++) {
      if (value === null && Math.random() > 0.7) {
        value = fetchFallback(); // ⇒ number | undefined
        continue outer;
      }
      if (typeof value === 'number' && value > 1_000) {
        value = null; // lose the number on purpose
        break;
      }
    }
  }
  // value: number | null | undefined   ← widened back

  // ── Stage 3 — confusion zone (uncomment to experiment) ───────────────────
  /*
  // Example A — forget undefined guard
  if (value !== null) {
    return value.toFixed(2); //  TS error → value may be undefined
    // Quick “fix” many devs choose:
    // return value!.toFixed(2); // 💥 runtime crash if undefined
  }

  // Example B — lost context inside nested loops
  if (value === null) {
    let holder = value;
    outer: for (const _ of [1, 2, 3]) {
      for (let i = 0; i < 5; i++) {
        if (Math.random() > 0.7) continue outer;
        holder = value;
        break;
      }
    }
    console.log(holder); // What is this again? Would you know if never wrote the type?
  }

  value; // What's the type signature of this value? Does this make sense to you?
  */
  return '¯\\_(ツ)_/¯'; // unreachable in theory, but TS can’t be sure
}

/*  Key problems
    ------------
    ① Twin undefined and null → double the branches.
    ② They replace the value, so every reassignment re-expands the union.
    ③ JS treats 0, "", false as falsy — easy to lose valid data with `!value`.
*/

/* ───────────────────── 3. NESTED OPTIONALITY EXAMPLE ─────────────────────── */

// We want to give people email reminders to use our app.
// If someone didn't generate a prototype last week, we want to remind them.

// we track each day: they either generate some prototypes or didn't use the app at all.

export type DayUsage = { prototypesGenerated: number } | undefined;
export type LastWeek = DayUsage[];

/**
 *    undefined  ⇒ user did not open the app that day
 *    0          ⇒ opened but no prototypes generated
 */
export function getMessage(week: LastWeek) {
  const firstGap = week.find(
    (d) => d === undefined || d.prototypesGenerated === 0
  );

  if (firstGap === undefined) {
    // Ambiguous: did Array.find fail, or did it hit an undefined entry?
    // New users with no weekly data would be really confused...
    return '👏 Great streak last week!';
  }

  // Could be undefined OR { prototypesGenerated: 0 }
  return '⏰ Jump back in today — Arkhet is waiting!';
}

/*  Issue
    -----
    Because `undefined` serves *two* roles (no result / no usage), we can’t
    distinguish “no gap found” from “gap found but day unused” without extra
    flags — another sign that sentinel values age poorly in complex flows.
*/
