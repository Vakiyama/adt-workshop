import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 09 ‣ RESULT.map / RESULT.flatMap — removing nested matches
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  Recap
 *  -----
 *  Result<T,E> = Ok<T> | Error<E>
 *
 *  • `match` is perfect when you actually need to branch in UI code.
 *  • Inside data-transform pipelines nested `match`es feel noisy:
 *        parse → match             // handle Ok / Err
 *        validate → match          // handle Ok / Err again
 *        transform → match         // …
 *
 *  `map`, `mapError`, and `flatMap` compress those steps.
 */

/* ─────────────────── 1. PROBLEM – NESTED MATCH SPAGHETTI ────────────────── */

function parseIntR(raw: string): Result<number, string> {
  const n = Number.parseInt(raw);
  return Number.isNaN(n) ? Result.Error('NaN') : Result.Ok(n);
}

function ensurePositive(n: number): Result<number, string> {
  return n > 0 ? Result.Ok(n) : Result.Error('negative');
}

/* step-by-step with explicit match blocks */
export function nestedMatches(raw: string): Result<string, string> {
  const a = parseIntR(raw); // somewhat hard to read, all error branches are redundant
  return match(a)
    .with(Result.P.Error(P.select()), Result.Error) // just return the error...
    .with(Result.P.Ok(P.select()), (n) => {
      // do something with value if exists
      const b = ensurePositive(n);
      return match(b)
        .with(Result.P.Error(P.select()), Result.Error) // just return the error...
        .with(Result.P.Ok(P.select()), (pos) => Result.Ok(`value = ${pos}`)) // do something with value if exists
        .exhaustive();
    })
    .exhaustive();
}

/* ─────────────── 2. MAP – transform the value when it is Ok only ────────── */
// map takes a function that operates on the value of the result only
// if Result<A, E>
//
// map( fn(A) -> B ) // ignores the error value, just do something with the A

/*
   Arrow diagram

        Ok(A)  -- map( fn(A) -> B ) -->  Ok( B )
        Err(e)   -- map(f) -->  Err(e)     (unchanged)

*/
export function describePositive(raw: string): Result<string, string> {
  return parseIntR(raw) // Result<number,string>
    .flatMap(ensurePositive) // still Result<number,string>
    .map((n) => `value = ${n}`); // transform success ONLY, propogate error
}

// this is simlar to a .catch/.then
// .then -> .map

/* ───────────────── 2. why flatMap?  nested Result with map ─────────────── */

const half = (n: number): Result<number, string> =>
  n % 2 === 0 ? Result.Ok(n / 2) : Result.Error('not even');

// 🔎 Uncomment and hover the type of `nested`:


// const nested = parseIntR("8").map(half); // <- uncomment here
// type => Result<Result<number,string>,string>

export const halfIfEven_flat = (raw: string) => parseIntR(raw).flatMap(half); // Result<number,string>

/*
   Arrow picture

        Ok(v)  --flatMap(g)-->  g(v)     // g already Result
        Err(e) --flatMap(g)-->  Err(e)   // propagate
*/

/* ──────────────── 4. MAPERROR – transform the error branch only ─────────── */

export const halfIfEvenPretty = (raw: string) =>
  halfIfEven(raw).mapError((e) => `⚠️ ${e}`);

/* ───────────────────── 5. TODO – PRACTICE TASKS ───────────────────────────

   5.1  Add a new validator
          function under100(n:number): Result<number,string>
        then compose parseIntR ▸ ensurePositive ▸ under100 with flatMap.

   5.2  Replace nestedMatches() by a three-line pipeline using
        flatMap / map / mapError; confirm it returns identical results.

   5.3  Write
          function safeDivide(a:string,b:string): Result<number,string>
        that
          • parses both
          • fails if b === 0
          • otherwise returns a / b
        Use map2 style composition (hint: two flatMaps).

*/
