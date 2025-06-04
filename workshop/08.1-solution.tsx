import { Result } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

/* helpers reused from the lesson */
function parseNumber(s: string): Result<number, string> {
  const n = Number(s);
  return Number.isNaN(n) ? Result.Error('not a number') : Result.Ok(n);
}

/* -------------------------------------------------------------------------- */
/* B ‣ halfIfEven                                                             */
/* -------------------------------------------------------------------------- */
/*
   1. parseNumber           Result<number,string>
   2. ensure even           flatMap
   3. divide by 2           map
*/
export function halfIfEven(raw: string): Result<number, string> {
  return parseNumber(raw) // Result<number,string>
    .flatMap((n) => {
      const isEven = n % 2 === 0;

      return isEven ? Result.Ok(n) : Result.Error('not even');
    }) // still Result<number,string>, since flatMap takes a Result<Result<...>> and merges it into a Result<...>
    .map((n) => n / 2); // transform success (function runs on the Result<T, ...> -> Result<T, ...>), ignoring the error case
}

/* -------------------------------------------------------------------------- */
/* C ‣ formatPositiveCurrency rewritten with Result & typed errors                    */
/* -------------------------------------------------------------------------- */

class NetworkError {
  readonly _tag = 'NetworkError';
}

class InvalidNumber {
  readonly _tag = 'InvalidNumber';
  constructor(readonly number: number) {}
}

/* fetchNumber now returns Result */
function fetchNumber(flag: boolean): Result<number, NetworkError> {
  const number = Math.random() > 0.5 ? -5 : 42;

  return flag ? Result.Error(new NetworkError()) : Result.Ok(number);
}

/* compose fetchNumber with formatting */
export function formatPositiveCurrency(
  flag: boolean
): Result<string, NetworkError | InvalidNumber> {
  return fetchNumber(flag) // Result<number,NetworkError>
    .flatMap((n) => (n < 0 ? Result.Error(new InvalidNumber(n)) : Result.Ok(n))) // Result<number,NetErr|InvNum>
    .map((n) => `$${n.toFixed(2)}`); // Result<string, ...>
}

/* -------------------------------------------------------------------------- */
/* D ‣ helper that calls formatPositiveCurrency and prints a friendly message         */
/* -------------------------------------------------------------------------- */

export function logCurrency(flag: boolean) {
  const res = formatPositiveCurrency(flag);

  const msg = match(res) // match on the result
    .with(Result.P.Ok(P.select()), (s) => `✅ formatted: ${s}`)
    .with(Result.P.Error(P.select()), (e) => {
      // now we match on the error in the result!
      return match(e)
        .with(
          { _tag: 'NetworkError' },
          () => '🌐 network issue—try again later'
        )
        .with(
          { _tag: 'InvalidNumber' },
          (invalidNumberError) =>
            `🔢 invalid number Got: (${invalidNumberError.number})`
        )
        .exhaustive();
    })
    .exhaustive();

  console.log(msg);
}

logCurrency(Math.random() > 0.5); // error handled internally
