import { useState } from "react";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 05 ‣ OPTION  – Making “something or nothing” explicit
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  ❖ Problem recap
 *  ----------------
 *  JavaScript signals “no value” with *two* primitives (`null`, `undefined`),
 *  both of which **replace** the original type.  Every re-assignment forces
 *  us to re-narrow unions and keep mental tables of “what can this be now?”
 *
 *  ❖ Solution
 *  ----------
 *  A **sum type wrapper** – `Option<T> = Some<T> | None` – keeps the actual
 *  value *inside* the wrapper instead of erasing it.  We unwrap exactly once,
 *  and the compiler guarantees we handled both cases.  :contentReference[oaicite:0]{index=0}
 *
 *     • `Option.Some(42)`         // holds a number
 *    • `Option.None<number>()`    // holds nothing, *but* still “knows” it
 *                                   could have been a number
 *
 *  ts-pattern’s `.exhaustive()` gives us total case coverage at compile-time.
 *  :contentReference[oaicite:1]{index=1}
 *
 *  We’ll:
 *    1. Model `selectedShapeIds` with `Option<number[]>`.
 *    2. Port our “tragedy” function to `Option<number>`.
 *    3. Leave TODOs for the team to refactor `QueryResult`.
 *
 *  Dependencies (already in package.json):
 *      pnpm add @swan-io/boxed ts-pattern
 */

import { Option } from "@swan-io/boxed";
import { match, P } from "ts-pattern";

/* -------------------------------------------------------------------------- */
/* 1 ▸  Example  – selectedShapeIds                                           */
/* -------------------------------------------------------------------------- */

export function SafeShapes() {
  // Instead of `number[] | null`, wrap in Option:
  const [selectedShapeIds, setSelectedShapeIds] = useState<Option<number[]>>(Option.None());

  return match(selectedShapeIds)
    .with(Option.P.Some(P.select()), () => <p>No shapes selected </p>)
    // .with({ _tag: "Some" }, ({ value: ids }) =>
    //   ids.length === 0 ? (
    //     <p>No shapes selected?</p>
    //   ) : (
    //     <div>
    //       {ids.map((id) => (
    //         <p key={id}>Shape id: {id} selected.</p>
    //       ))}
    //     </div>
    //   ),
    // )
    .exhaustive();
}

/**
 * Tiny helper: same ergonomics as React’s useState but pre-wrapped in Option.
 */
function useOptionState<T>(initial: Option<T>) {
  const [state, setState] = useState(initial);
  return [state, setState] as const;
}

/* -------------------------------------------------------------------------- */
/* 2 ▸  Porting “tragedy” to Option                                           */
/* -------------------------------------------------------------------------- */

export function consumeOption(raw: number | null | undefined) {
  // One line: convert nullable to Option, losing **zero** information.
  let value = Option.fromNullable(raw);

  // We can chain helpers without losing safety:
  //   • maybeWipe turns a number into number | null
  //   • Option.flatMap handles None transparently
  value = value.flatMap((n) => Option.fromNullable(maybeWipe(n)));

  // fetchFallback returns number | undefined, same idea:
  value = value.flatMap((n) =>
    n > 1000 ? Option.fromNullable(fetchFallback()) : Option.Some(n),
  );

  // Single exhaustive match – impossible to forget a case:
  return match(value)
    .with({ _tag: "None" }, () => "No data")
    .with({ _tag: "Some" }, ({ value: n }) => `$${n.toFixed(2)}`)
    .exhaustive();
}

/* -------------------------------------------------------------------------- */
/* 3 ▸  TODOs – hands-on practise                                             */
/* -------------------------------------------------------------------------- */

/**
 * 1. Open `invalid-representations.ts` and:
 *      • Replace the three-field product with
 *          type QueryState =
 *            | { tag: "Idle" }
 *            | { tag: "Loading" }
 *            | { tag: "Success"; data: Data }
 *            | { tag: "Error";   error: Err }
 *
 *      • Or go further: embed the result into
 *            Option<Result<Data, Err>>
 *        using `Option` and a custom `Result` union.
 *
 * 2. Refactor `getMessage` in `null-and-undefined.ts` to use
 *        Option<DayUsage>
 *    so we can finally distinguish “no element found” from
 *    “element was undefined”.
 *
 * 3. Bonus: Implement a small `map2` helper:
 *        function map2<A,B,C>(
 *          oa: Option<A>,
 *          ob: Option<B>,
 *          f: (a: A, b: B) => C
 *        ): Option<C>
 *    …then use it to add two Option<number>s safely.
 */

/* -------------------------------------------------------------------------- */
/* 4 ▸  Helper implementations for the demo                                   */
/* -------------------------------------------------------------------------- */

function maybeWipe(n: number): number | null {
  return Math.random() > 0.5 ? n : null;
}

function fetchFallback(): number | undefined {
  return Math.random() > 0.5 ? Math.random() * 500 : undefined;
}

