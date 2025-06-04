import React, { useState } from 'react';
import { Option } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 05 ‣ OPTION — Making “something or nothing” explicit
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  # Problem
 *    JavaScript has two values for “nothing”: `null` and `undefined`.
 *    Because they replace whatever was there, every assignment widens unions
 *    and forces you to keep a mental table of “what can this be now?”
 *
 *  # Solution
 *    Wrap the value instead of erasing it:
 *
 *        type Option<T> = Some<T> | None
 *
 *        • `Option.Some(42)`  // value present
 *        • `Option.None<number>()` // value absent, but the type is remembered
 *
 *    Pattern matching with ts-pattern + `.exhaustive()` guarantees we deal
 *    with both branches, eliminating forgotten cases at compile time.
 *
 *  # Dependencies (already installed here)
 *      bun i @swan-io/boxed ts-pattern
 */

/* ──────────────────────────── 1. CONSTRUCTING OPTIONS ────────────────────── */

export const some42 = Option.Some(42); // Type: Option<number>, Value: Some(42)
export const none = Option.None<number>(); // Type: Option<number>, Value: None

const nullable: number | null = Math.random() > 0.5 ? 99 : null;
export const optFromNullable = Option.fromNullable(nullable); // Some(99) | None
export const optFromUndefined = Option.fromUndefined<number>(7); // Some(7)
export const noneFromUndef = Option.fromUndefined<number>(undefined); // None

/* ──────────────────────── 2. INSPECTING WITH PATTERN MATCH ───────────────── */

export function describe(opt: Option<number>): string {
  return match(opt)
    .with(Option.P.None, () => 'no number')
    .with(Option.P.Some(P.select()), (n) => `number = ${n}`)
    .exhaustive(); // remove a branch → TypeScript error
}

/* TODO ✎
 *   Delete the `.with(Option.P.None …)` branch above and watch the compiler
 *   complain; restore it to make the error disappear.
 */

/* ──────────────────────── 3. PRACTICAL REACT EXAMPLE ─────────────────────── */
/* A real shape we shipped */

type ContextMenuLegacy =
  | { visible: true; x: number; y: number }
  | { visible: false; x: 0; y: 0 }
  | null;

/*
  ▸ How many variants?  → 3 (null + two objects)
  ▸ How many do we need?  → 2 Some(Menu) | None
  ▸ Redundant field?  → `visible` duplicates the Option wrapper.
*/

export function ContextMenuLegacyDemo() {
  const [menu, setMenu] = useState<ContextMenuLegacy>(null);

  // TODO []: implement this function

  function closeMenu() {
    // there's two ways to do it... hint: use the visible flag
    // setMenu(?)
  }

  return (
    <>
      {menu && menu.visible && (
        <div style={{ left: menu.x, top: menu.y }}>Context Menu</div>
      )}
      <button onClick={() => setMenu({ visible: true, x: 80, y: 40 })}>
        Show
      </button>
      <button onClick={() => setMenu(null)}>Hide</button>
    </>
  );
}

/* --- Refactor with Option -------------------------------------------------- */

type MenuPos = { x: number; y: number };
type ContextMenu = Option<MenuPos>;

export function ContextMenuRefactored() {
  const [menu, setMenu] = useState<ContextMenu>(Option.None());

  // TODO []: implement this function

  function closeMenu() {
    // hint: use an option here
    // setMenu(?)
  }

  return match(menu)
    .with(Option.P.None, () => (
      <button onClick={() => setMenu(Option.Some({ x: 80, y: 40 }))}>
        Show
      </button>
    ))
    .with(Option.P.Some(P.select()), (pos) => (
      <div
        style={{ left: pos.x, top: pos.y }}
        onClick={() => setMenu(Option.None())}
      >
        Context Menu (click to hide)
      </div>
    ))
    .exhaustive();
}

/* ─────────────────────────── 4. PORTING NULLABLE API ────────────────────── */

export function priceTag(raw: number | null | undefined) {
  const opt = Option.fromNullable(raw);

  return match(opt)
    .with(Option.P.None, () => 'N/A')
    .with(Option.P.Some(P.select()), (n) => `$${n.toFixed(2)}`)
    .exhaustive();
}

/* ───────────────────────── 5. WARM-UP EXERCISES ─────────────────────────── */

/**
 * 5.1  Rewrite the nullable parser as `parseAsOption`.
 */
export function maybeParse(n: string): number | null {
  const x = Number(n);
  return Number.isNaN(x) ? null : x;
}

// TODO[]: Uncomment and implement.
// export function parseAsOption(n: string): Option<number> {
//   // 1) Number(n)
//   // 2) return Option.fromNullable(…)
// }
//
// Bonus: Try this one. You can use your previous function body, but keep the signature (string | undefined | null -> Option<number>) the same.
//
// You can check out the "map" and "flatMap" documentation at https://boxed.cool
// export function parseAsOption(n: string | undefined | null): Option<number> {
//   // 1) Number(n)
//   // 2) return Option.fromNullable(…)
// }

/**
 * 5.2  Refactor `getMessage` so it uses options to better handle empty cases.
 */
export type DayUsage = { prototypesGenerated: number } | undefined;
export type LastWeek = DayUsage[];

export function getMessage(week: LastWeek): string {
  const firstEmpty = week.find(
    (d) => d === undefined || d.prototypesGenerated === 0
  );

  // Hint: What if there was no data? Maybe Array.find got no results...
  // New users would be getting a very confusing message...
  if (firstEmpty === undefined) return '👏 Great streak last week!';
  return '⏰ Jump back in today—Arkhet is waiting!';
}

/* TODO[]
 *   a) Change DayUsage to use Options
 *   b) Using nested options, distinguish between the "no tracked days" and "no data found" cases
 *   c) Replace the if/undefined logic with `match`
 *   d) Handle the missing third case
 */

/* ────────────────────────── 6. QUICK REFERENCE ──────────────────────────── */
/*
    // Construction
      Option.Some(value)
      Option.None<Type>()

    // From JS “maybe” values
      Option.fromNullable(x)      // treats null/undefined as None
      Option.fromUndefined(x)     // treats undefined as None

    // Pattern match
      match(opt)
        .with(Option.P.None, …)
        .with(Option.P.Some(P.select()), …)
        .exhaustive();
*/
