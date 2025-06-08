/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 05 ‣ Pattern Matching & Option – the BASICS
 * ──────────────────────────────────────────────────────────────────────────────

/* -------------------------------------------------------------------------- */
/* 0 ▸  Setup                                                                 */
/* -------------------------------------------------------------------------- */

import { match } from 'ts-pattern'; // pattern matcher

// ts-pattern is a library that allows us to do more powerful branches.
//
// This is useful when thinking about ADT's and variants and has some nicer utilities than switch statements.
// If we know we have 4 cases; a better switch statement can help us handle them.
// Also, ts-pattern has nice interop with some libraries we will use to fix the null/undefined problem.

/* -------------------------------------------------------------------------- */
/* 1 ▸  ts-pattern with a tiny union                                          */
/* -------------------------------------------------------------------------- */

/**
 * A typical async state without extra payload:
 */
type Status = 'idle' | 'loading' | 'success' | 'error';

/**
 * A function that logs what to display in the UI.
 * `.exhaustive()` turns any forgotten status into a compile-time error.
 */
export function logStatus(state: Status) {
  match(state)
    .with('idle', () => console.log('Nothing yet…'))
    .with('loading', () => console.log('⏳ Loading…'))
    .with('success', () => console.log('✅ Done!'))
    .with('error', () => console.log('💥 Something went wrong'))
    .exhaustive(); // Try removing a branch above → TS error!
}

/* TODO []
 *  Try adding a new variant — e.g. "cancelled" — to `Status`.
 *  Observe how `.exhaustive()` immediately complains until you handle it.
 */

/* -------------------------------------------------------------------------- */
/* 2 ▸  A discriminated union with payload                                    */
/* -------------------------------------------------------------------------- */

type HttpSuccess = { tag: 'Success'; body: string };
type HttpFailure = { tag: 'Failure'; status: number; message: string };
type HttpResult = HttpSuccess | HttpFailure;

export function render(result: HttpResult) {
  return match(result)
    .with({ tag: 'Success' }, ({ body }) => `✔ ${body}`) // destructuring the object
    .with({ tag: 'Failure' }, (failure) => `❌ Error ${failure.status}`) // getting the whole object (could also do { status } here)
    .exhaustive();
}

/* TODO []
 *  Add a new property to http failure. Try to render it in the string.
 */
