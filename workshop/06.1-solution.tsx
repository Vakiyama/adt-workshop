// My solution to 05.

import { Option } from '@swan-io/boxed';
import { match, P } from 'ts-pattern';

export type DayUsage = Option<{ prototypesGenerated: number }>;

export type LastWeek = DayUsage[]; // week is a list of day

// LastWeek -> string
export function getMessage(lastWeek: LastWeek) {
  const result = lastWeek.find((day) =>
    match(day)
      .with(Option.P.None, () => true) // not tracked
      .with(
        Option.P.Some(P.select()),
        (value) => value.prototypesGenerated === 0
      ) // tracked, but no prototypes generated
      .exhaustive()
  );

  // we can convert result to an option:
  const resultOption = Option.fromUndefined(result);
  // This is now an Option<Option<DayUsage>>

  // and we can match on it

  return match(resultOption)
    .with(
      // outer option: we found no empty days or prototypes generated that were 0
      Option.P.None,
      () => 'Welcome to Arkhet! (we have no previous data of your activity)'
    )
    .with(Option.P.Some(P.select()), (value) => {
      // now we have the inner option, the day usage
      // let's match again:

      match(value)
        .with(Option.P.None, () => "Seems like you didn't log in yesterday!") // no data, day was None
        .with(
          Option.P.Some(P.select()),
          () => "I see you didn't generate any prototypes yesterday!"
        ) // did log in, didn't generate anything
        .exhaustive(); // we know we're done
    })
    .exhaustive();

  // NOTE: This is pretty verbose. Option has helpers that make things simpler, but we're trying to avoid the
  // extra complexity to get the point across.

  // You can ALWAYS do everything you need with boxed types using match statements.
  // when in doubt, use them.
}
