import { Result } from '@swan-io/boxed';

// helpers

function parseIntResult(raw: string): Result<number, string> {
  const n = Number.parseInt(raw);
  return Number.isNaN(n) ? Result.Error('NaN') : Result.Ok(n);
}

function ensurePositive(n: number): Result<number, string> {
  return n > 0 ? Result.Ok(n) : Result.Error('negative number..');
}

/*
   5.1  Add a new validator
          function under100(n:number): Result<number,string>
        then compose parseIntResult ▸ ensurePositive ▸ under100 with flatMap.
*/

function under100(n: number): Result<number, string> {
  return n < 100
    ? Result.Ok(n)
    : Result.Error(`Number is greater than 100. Number: ${n}.`);
}

function printResult<V, E>(result: Result<V, E>) {
  // helper to print the inner result

  return result.match({
    Ok: (a) => console.log(a),
    Error: (e) => console.error(e),
  });
}

const success = parseIntResult('10').flatMap(ensurePositive).flatMap(under100);
const over100 = parseIntResult('101').flatMap(ensurePositive).flatMap(under100);
const negative = parseIntResult('-10')
  .flatMap(ensurePositive)
  .flatMap(under100);

printResult(success);
printResult(over100);
printResult(negative);

/*
   5.2  Replace nestedMatches() by pipeline using
        flatMap / map; confirm it returns identical results.
*/

export function nestedMatchesImproved(raw: string): Result<string, string> {
  return parseIntResult(raw)
    .flatMap(ensurePositive)
    .map((pos) => `value = ${pos}`);
}

/*
   5.3  Write
          function safeDivide(a:string, b:string): Result<number,string>
        that
          • parses both
          • fails if b === 0
          • otherwise returns a / b

*/

function ensureNot0(n: number) {
  return n === 0 ? Result.Error('Number cannot be 0.') : Result.Ok(n);
}

function safeDivide(a: string, b: string): Result<number, string> {
  return parseIntResult(a).flatMap((a) => {
    return parseIntResult(b)
      .flatMap(ensureNot0)
      .map((b) => a / b);
  });
}

printResult(safeDivide('10', '20'));
printResult(safeDivide('10', '0'));
