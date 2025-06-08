import { Result } from '@swan-io/boxed';
import { exhaustive } from 'exhaustive';
import { match, P } from 'ts-pattern';

/* ──────────────────────────────  a) halfIfEven  ─────────────────────────── */

/* tiny helper from the lesson */
function parseNumber(s: string): Result<number, string> {
  const n = Number(s);
  return Number.isNaN(n) ? Result.Error('not a number') : Result.Ok(n);
}

/*
   • parse                      → Result<number,string>
   • if even, divide by two     → Ok(n / 2)
   • otherwise                  → Error("Not even")
   • pattern match handles the two Result variants in one place
*/
export function halfIfEven(raw: string): Result<number, string> {
  return parseNumber(raw).match({
    Ok: (n) => (n % 2 === 0 ? Result.Ok(n / 2) : Result.Error('Not even')),
    Error: Result.Error,
  });
}

/* ─────────────────────────────── b) formatCurrency  ─────────────────────── */

/* tagged error helpers */
class NetworkError {
  readonly _tag = 'NetworkError';
}
class InvalidNumber {
  readonly _tag = 'InvalidNumber';
  constructor(readonly number: number) { }
}

/* network request now returns Result, not throw */
function fetchNumber(flag: boolean): Result<number, NetworkError> {
  if (flag) return Result.Error(new NetworkError());
  const n = Math.random() > 0.5 ? -5 : 42; // -5 triggers InvalidNumber later
  return Result.Ok(n);
}

/*
   • call fetchNumber
   • bail early if network failed
   • verify positivity, else InvalidNumber
   • format to `$xx.xx`
*/
export function formatPositiveCurrency(
  flag: boolean
): Result<string, NetworkError | InvalidNumber> {
  return fetchNumber(flag).match({
    Ok: (n) =>
      n < 0 ? Result.Error(new InvalidNumber(n)) : Result.Ok(n.toFixed(2)),
    Error: Result.Error,
  });
}

/* ─────────────────────────────── c) pretty logger  ──────────────────────── */
/*
   Consumes Result<string, NetworkError | InvalidNumber>
   Variants = 3   (Ok | NetworkError | InvalidNumber) ➜ 3 console paths
*/
export function printFormattedCurrency(
  r: Result<string, NetworkError | InvalidNumber>
) {
  r.match({
    Ok: (txt) => console.log(`You have: ${txt} USD`),
    Error: (err) => {
      exhaustive(err, '_tag', {
        NetworkError: () => console.error('🚫 Network error, try again later.'),
        InvalidNumber: ({ number }) =>
          console.error(`🚫 Invalid number received: ${number}`),
      });
    },
  });
}

/* quick demo */
const currency = formatPositiveCurrency(false);
printFormattedCurrency(currency);
