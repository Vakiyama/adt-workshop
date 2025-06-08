import { useEffect, useState } from 'react';
import { AsyncData, Result } from '@swan-io/boxed';

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * 10 ‣ ASYNCDATA — one discriminant for every async flow
 * ──────────────────────────────────────────────────────────────────────────────
 *
 *  # Problem (flash-back to Lesson 02)
 *    Our `QueryResult` flags (`data / isLoading / error`) yielded 8 states,
 *    4 of which were impossible but still had to be considered.
 *
 *  # Solution — `AsyncData<T>`
 *
 *               NotAsked           no request yet
 *               Loading            request in flight
 *               Done(Result<T,E>)  finished (Ok | Err)
 *
 *    A *single* discriminant covers “not started”, “loading”, and
 *    “success / failure”.  No flag juggling, no impossible tuples.
 *
 *  # Dependencies
 *      already installed: @swan-io/boxed
 */

/* ─────────────────────────── 1. CONSTRUCTING ASYNCDATA ───────────────────── */

export type User = { id: number; name: string };

export const idle = AsyncData.NotAsked<User>(); // NotAsked
export const loading = AsyncData.Loading<User>(); // Loading
export const okUser = AsyncData.Done(Result.Ok<User>({ id: 1, name: 'Ada' })); // Done-Ok
export const koUser = AsyncData.Done(Result.Error('404')); // Done-Err
// constructors: NotAsked, Loading, Done(value)

/* ───────────────────── 2. PATTERN-MATCHING & MAP HELPERS ─────────────────── */

/*
   Map over the inner Result when and only when we are in Done-Ok.
*/
export function uppercaseName(ad: AsyncData<Result<User, string>>) {
  return ad.map((r) => r.map((u) => ({ ...u, name: u.name.toUpperCase() })));
}

/*
   Rendering helper — ONE match, three branches, exhaustiveness guaranteed.
*/
export function render(userQuery: AsyncData<Result<User, string>>): string {
  {
    return userQuery.match({
      NotAsked: () => 'Idle',
      Loading: () => 'Loading...',
      Done: (userResult) => {
        return userResult.match({
          Ok: (user) => `Name: ${user.name}`,
          Error: (error) => `${error}`,
        });
      },
    });
  }
}

/* ─────────── 3. FLATMAP — CHAINING ASYNCDATA WITHOUT NESTING ────────────── */

const toInitials = (u: User): Result<string, string> =>
  u.name.length < 2
    ? Result.Error('too short')
    : Result.Ok(u.name[0] + u.name[1]);

// Without flatMap: AsyncData< Result< Result<string,E>,E > >
// With flatMap   : AsyncData< Result<string,E> >
export const initials = okUser.map((res) => res.flatMap(toInitials)); // unwrap AsyncData.Done

/* ─────────────── 4. REACT EXAMPLE — BEFORE & AFTER REFACTOR ─────────────── */

// helpers simulating fetch
const fetchUser = (id: number) =>
  new Promise<User>((res) => setTimeout(() => res({ id, name: 'Grace' }), 800));

/* BEFORE — a component with three flags */
export function UserCardLegacy({ id }: { id: number }) {
  const [data, setData] = useState<User | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setLoad] = useState(false);

  useEffect(() => {
    setLoad(true);
    fetchUser(id)
      .then((u) => setData(u))
      .catch(() => setError('network'))
      .finally(() => setLoad(false));
  }, [id]);

  if (isLoading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>Idle</p>;
  return <p>{data.name}</p>;
}

function fetchUserAsyncData() {
  return AsyncData.Done<Result<User, string>>(
    Result.Ok<User, string>({ id: 234, name: 'John' })
  );
}
/* AFTER — single AsyncData state */
export function UserCard({ id }: { id: number }) {
  const [state, setState] = useState<AsyncData<Result<User, string>>>(
    AsyncData.NotAsked()
  );

  useEffect(() => {
    setState(fetchUserAsyncData());
  }, [id]);

  return (
    <p>
      {state.match({
        NotAsked: () => 'Idle',
        Loading: () => 'Loading...',
        Done: (userResult) => {
          return userResult.match({
            Ok: (user) => `Name: ${user.name}`,
            Error: (error) => `${error}`,
          });
        },
      })}
    </p>
  );
}

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
  throw new Error('TODO');
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
