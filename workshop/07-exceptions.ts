/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 07 ‣ EXCEPTIONS
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  Context
 *  -------
 *  • `null | undefined` gave us silent absence bugs.
 *  • `throw / try / catch / finally` adds implicit control-flow bugs.
 *
 *  Two key drawbacks
 *  ─────────────────
 *    1. Confusing control flow — execution jumps out of the normal path;
 *       `finally` can even *replace* earlier returns.
 *    2. Invisible to the type system - a function that may throw
 *       still types as `(): T`, leaving callers in the dark.
 *
 */

/* ───────────────────────────── 1. PUZZLE DEMO ────────────────────────────── */

function mystery(): string {
  try {
    throw new Error('💥 something went wrong');
  } catch (e) {
    console.log('⚠️  catch:', (e as Error).message);
    return 'catch return';
  } finally {
    console.log('🧹 finally runs');
    return 'finally return';
  }

  // TODO []: Will the below log ever run? Uncomment to find out, but make your guess first.
  // console.log("Did I run?")
  // return "done"
}

console.log('mystery() →', mystery());

/*
   ❓  Quick quiz:
       What lines print, and in what order?
       (Answer at bottom of file.)

   Observation
   -----------
   • Function signature is still `(): string`.
   • Callers have no clue an Error was ever thrown.
   • `finally` replaced the catch’s return — easy to miss in code review.
*/

/* ─────────────────────── 2. NESTED TRY/CATCH CHAOS ──────────────────────── */

function fetchNumber(possibleFail: boolean): number {
  if (possibleFail) throw new Error('network down');
  return 42;
}

export function formatCurrency(flag: boolean): string {
  try {
    const n = fetchNumber(flag); // might throw
    return `$${n.toFixed(2)}`;
  } catch (e) {
    // What's the type of e? Why?
    console.error(e);
  }
  // Did we reach here because of an exception or because n === undefined?
  // No way to know from the type system.
  return 'N/A';
}

/*
    Problems mirrored from previous null/undefined
    ---------------------------------------
    • Hidden branch = hidden cognitive load (like undefined vs null).
    • Caller can’t tell success from failure without reading the body.
*/

/* ───────────────────────── 3. TODO — HANDS-ON TASKS ──────────────────────── */

/**
 * ✎ 3.1  Uncomment and run the following.  What do you expect?
 *        (Did you have to look at the function implementation?)
 */
// console.log(formatCurrency(false)); // Answer ->
// console.log(formatCurrency(true));  // Answer ->

/**
 * ✎ 3.2  Refactor `formatCurrency` to "bubble up" the error instead of
 *        swallowing it.  Note how every caller must now wrap its own try/catch.
 *
 * ✎ 3.3  Sketch with pseudocode (do not implement yet) an alternative signature:
 *
 *      function formatCurrency(flag: boolean): Result<number, Error>
 *
 *        where `Result` is a sum type (`Ok(number) | Err(error)`).
 *        How would the call sites change?
 *        Hint: remember how we used the Option<T> type.
 */

/* ───────────────────────────── 4. ANSWER KEY ───────────────────────────────
   mystery() prints:
      ⚠️  catch: 💥 something went wrong
      🧹 finally runs
      mystery() → finally return

   The `finally` block always runs and its `return` overrides any earlier
   returns or re-throws — a nuance that even seasoned devs sometimes forget.
*/
