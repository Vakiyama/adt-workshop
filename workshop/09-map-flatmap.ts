import { Result } from '@swan-io/boxed';
import { halfIfEven } from './08-results';

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

function parseIntResult(raw: string): Result<number, string> {
  const n = Number.parseInt(raw);
  return Number.isNaN(n) ? Result.Error('NaN') : Result.Ok(n);
}

function ensurePositive(n: number): Result<number, string> {
  return n > 0 ? Result.Ok(n) : Result.Error('negative');
}

/* step-by-step with explicit match blocks */
export function nestedMatches(raw: string): Result<string, string> {
  const asyncData = parseIntResult(raw);

  return asyncData.match({
    Error: Result.Error, // <- just returns the error...
    Ok: (n) => {
      const b = ensurePositive(n); // actual thing we want to do

      return b.match({
        Error: Result.Error, // <- just returns the error...
        Ok: (pos) => Result.Ok(`value = ${pos}`), // actual thing we want to do
      });
    },
  });
}

/* ─────────────── 2. MAP – transform the value when it is Ok only ────────── */

/*
   Arrow diagram

        Ok( n )  --map(f)-->  Ok( f(n) )
        Err(e)   --map(f)-->  Err(e)     (unchanged)

*/
export function double(n: number): number {
  return n * 2;
}

export function parseAndDouble(raw: string): Result<number, string> {
  return parseIntResult(raw) // Result<number,string>
    .map(double); // still Result<number,string>

  // Result<number, string> -> map(double) -> Result<number * 2, string> (or Result<double(number), string>)
}

/* ───────────────── 3. FlatMap   ─────────────── */

// function that returns a result
function half(n: number): Result<number, string> {
  return n % 2 === 0 ? Result.Ok(n / 2) : Result.Error('not even');
}

// 🔎 Uncomment and hover the type of `nested`:

// const nested = parseIntResult("8").map(half); // <- uncomment me

// type => Result<Result<number,string>,string> <- not what we want

// no Result<Result<...>>!
export function halfIfEven_flat(raw: string): Result<number, string> {
  return parseIntResult(raw).flatMap(half); // flat map "flattens" the inner result
} // Result<number,string>

/*
   Arrow picture

        Ok(v)  --flatMap(g)-->  g(v)     // g already Result
        Err(e) --flatMap(g)-->  Err(e)   // propagate
*/

/* ──────────────── 4. MAPERROR – transform the error branch only ─────────── */

export function halfIfEvenPretty(raw: string) {
  return halfIfEven(raw).mapError((e) => `⚠️ ${e}`);
}

/* ───────────────────── 5. TODO – PRACTICE TASKS ───────────────────────────

   5.1  Add a new validator
          function under100(n:number): Result<number,string>
        then compose parseIntResult ▸ ensurePositive ▸ under100 with flatMap.
*/

export function under100(n: number): Result<number, string> {
  return Result.Error('TODO');
}

/*
   5.2  Replace nestedMatches() by pipeline using
        flatMap / map; confirm it returns identical results.
*/

export function nestedMatchesWithMap(raw: string): Result<string, string> {
  // TODO: ❌ remove match

  const asyncData = parseIntResult(raw);

  return asyncData.match({
    Error: Result.Error, // <- just returns the error...
    Ok: (n) => {
      const b = ensurePositive(n); // actual thing we want to do

      return b.match({
        Error: Result.Error, // <- just returns the error...
        Ok: (pos) => Result.Ok(`value = ${pos}`), // actual thing we want to do
      });
    },
  });
}

/*
   5.3  Write
          function safeDivide(a: string, b: string): Result<number, string>
        that
          • parses both
          • fails if b === 0
          • otherwise returns a / b

        Hint: parseIntResult(a).flatMap((x)=> parseIntResult(b).flatMap(…))
*/

export function safeDivide(a: string, b: string): Result<number, string> {
  return Result.Error('TODO');
}
