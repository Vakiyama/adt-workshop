import { AsyncData, Result } from '@swan-io/boxed';

type User = { id: number; name: string };

/* ───────────────────── 5. HANDS-ON REFACTOR TASKS ─────────────────────────

   1. Create a helper that converts from the tanstack query type to a AsyncData<Result<...>>

*/

type QueryResult<Data, Error> = {
  data: Data | undefined; // present on success
  error: Error | undefined; // present on failure
  isLoading: boolean; // true while fetching
};

export function fromTanstackQuery<Data, Error>(
  queryResult: QueryResult<Data, Error>
): AsyncData<Result<Data, Error>> {
  if (queryResult.data) {
    return AsyncData.Done(Result.Ok<Data, Error>(queryResult.data));
  }

  if (queryResult.error) {
    return AsyncData.Done(Result.Error<Data, Error>(queryResult.error));
  }

  if (queryResult.isLoading) {
    return AsyncData.Loading();
  }

  return AsyncData.NotAsked(); // this implementation assumes that the incoming data is valid...
}

/*
   2. Using `initials` above as inspiration, create a pipeline that
      fetches a user, validates the name length, and upper-cases it,
      all in one expression:
         fetchUserAsyncData(...)
           .flatMap(…)  // fetch
           .flatMap(…)  // validate
           .map(…)      // transform

      // hint: check out the https://boxed.cool/async-data-result async data result type helpers.
*/

function fetchUserAsyncData() {
  return AsyncData.Done<Result<User, string>>(
    Result.Ok<User, string>({ id: 234, name: 'John' })
  );
}

function validateNameLength(user: User, length: number) {
  if (user.name.length >= length) return Result.Ok(user);

  return Result.Error('Invalid length');
}

function upperCaseName(user: User) {
  const chars = user.name.split('');
  chars[0] = chars[0].toUpperCase();

  return chars.join();
}

export const result = fetchUserAsyncData()
  .mapOkToResult((user) => validateNameLength(user, 10))
  .mapOk(upperCaseName);
