import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';
import { client } from '../helpers/08-helpers';
// ─────────────────────────────────────────────────────────────────────────────
// 08 ‣ RESULT — explicit success OR explicit failure
// ─────────────────────────────────────────────────────────────────────────────
//
//  Problem recap
//  -------------
//  • Exceptions hide in control-flow and never appear in the type signature.
//  • The might-fail library gives us a safe PRODUCT wrapper:
//
//        { ok: boolean; value?: T; error?: E }
//
//    This guarantees no “both set / both empty” bug, so credit where it’s due.
//    But callers still write two checks every time.
//
//  Goal
//  ----
//  Replace the product with the SUM type shipped by @swan-io/boxed:
//
//        type Result<T,E> = Ok<T> | Error<E>
//
//        Result.Ok(42)
//        Result.Error(new Error("fail"))
//
//  One discriminant, one branch, and pattern matching proves exhaustiveness.
//  Later we will see how .map and .flatMap collapse success-only pipelines.
//  Dependencies are already installed: @swan-io/boxed ts-pattern
//

/* ─────────────────────────── 1. CONSTRUCTING RESULTS ────────────────────── */

export const ok42 = Result.Ok(42); // Result<number, never>
export const errBad = Result.Error(new Error('bad')); // Result<never, Error>
export const errValue = Result.Error('Something went wrong'); // Result<never, string> <- Notice how errors can be any value!

// we can type out the success case even when just creating the error
export const errValueWouldBeString = Result.Error<number, string>(
  'Something went wrong when getting number...'
);

// From promises that may reject, but still not great; we're assuming the e to be of type Error
export async function toResult<T>(p: Promise<T>): Promise<Result<T, Error>> {
  try {
    return Result.Ok(await p);
  } catch (e) {
    return Result.Error(e as Error);
  }
}

// Promise<number> -> Promise<Result<number, Error>>
// toResult

/* ───────────────────── 2. INSPECTING WITH PATTERN MATCH ─────────────────── */

export function describe<T>(r: Result<T, Error>): string {
  return match(r)
    .with(Result.P.Ok(P.select()), (value) => `value = ${String(value)}`)
    .with(Result.P.Error(P.select()), (error) => `error  = ${error.message}`)
    .exhaustive();
}

/* TODO ✎
 *   Delete the Error branch above; observe the compiler error produced by
 *   .exhaustive().  Restore the branch to make the error disappear.
 */

/* ───────────────────── 3. FROM EXCEPTIONS TO RESULT ─────────────────────── */

type Wireframe = string; // simplified

// Real code pattern from our API layer
// BEFORE  – throws on non-2xx

export async function getAllShapesForProjectCurrent( // <- no way to know this throws an error from the type
  projectId: number
): Promise<Wireframe[]> {
  const res = await client.api.v0.shapes[':projectId'].$get({
    param: { projectId: String(projectId) },
  });

  if (!res.ok) throw new Error('Error getting shapes');

  return (await res.json()).shape;
}

// AFTER  – bubbles up Result instead of throwing
async function getAllShapesForProject( // <- We now know this function throws an error because of the Result!
  projectId: number
): Promise<Result<Wireframe[], Error>> {
  try {
    const res = await client.api.v0.shapes[':projectId'].$get({
      param: { projectId: String(projectId) },
    });
    if (!res.ok) return Result.Error(new Error('Error getting shapes'));
    const { shape } = await res.json();
    return Result.Ok(shape);
  } catch (e) {
    return Result.Error(e as Error);
  }
}

// TODO []: Rewrite the try catch with might fail instead, still returning a result
export async function getAllShapesForProjectMightFail(
  projectId: number
): Promise<Result<Wireframe[], Error>> {
  // TODO: ❌ not handling the error atm...
  const res = await client.api.v0.shapes[':projectId'].$get({
    param: { projectId: String(projectId) },
  });

  if (!res.ok) return Result.Error(new Error('network fail'));

  const { shape } = await res.json();
  return Result.Ok(shape);
}

// Caller handles both paths once
export async function showShapeCount(id: number) {
  const shapesResult = await getAllShapesForProject(id);
  return match(shapesResult)
    .with(
      Result.P.Ok(P.select()),
      (shapes) => `🖼️ We got ${shapes.length} shape(s)`
    )
    .with(Result.P.Error(P.select()), (error) => `❌ ${error.message}`)
    .exhaustive();
}

// ───────────────────── 4. TODO — PRACTICE REWRITE ─────────────────────────

/*
 a) Using parseNumber above, write
      function halfIfEven(raw: string): Result<number, string>
    that parses, then flatMaps to ensure the number is even, then maps to
    divide by 2.
 */

export function halfIfEven(raw: string): Result<number, string> {
  throw new Error('TODO');
}

/*
 b) Convert the exception-throwing formatCurrency demo from lesson 07 to
    return Result<number, Error>.  Observe how the try/catch in callers
    becomes unnecessary.

      Bonus: Use the given "error classes" to make it obvious what was the error.
*/

// provided error classes:

// instead of returning a Result.Error(new Error()), try: Result.Error(new NetworkError())
class NetworkError {
  _tag = 'NetworkError';
}

// instead of returning a Result.Error(new Error()), try: Result.Error(new InvalidNumber(*number here*))
class InvalidNumber {
  number: number;

  constructor(n: number) {
    this.number = n;
  }

  _tag = 'InvalidNumber';
}

function fetchNumber(possibleFail: boolean): number {
  // TODO: ❌ throwing an error, should be a result
  if (possibleFail) throw new Error('network down');

  const number = Math.random() > 0.5 ? -5 : 42; // -5 will cause an error later...

  return number;
}

export function formatPositiveCurrency(flag: boolean): string {
  // TODO: ❌ not handling the error atm...
  try {
    const n = fetchNumber(flag); // might throw
    if (n < 0) throw new Error('Invalid number');

    return `$${n.toFixed(2)}`;
  } catch (e) {
    console.error(e);
  }
  return 'N/A';
}

/*
  c) Write a function that calls the format currency function and prints a helpful message.
    Bonus: How many variants does your consumed result type have? How print statements did you write?
  * */

// replace the "any" with your result type
export function printFormattedCurrency(formattedCurrency: any) {}
