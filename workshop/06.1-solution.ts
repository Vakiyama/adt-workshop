// My solution to 06.

import { Option } from '@swan-io/boxed';

export type DayUsage = Option<{ prototypesGenerated: number }>;

export type LastWeek = DayUsage[]; // week is a list of day

// LastWeek -> string
export function getMessage(lastWeek: LastWeek) {
  const result = lastWeek.find((day) =>
    day.match({
      None: () => true, // not tracked
      Some: (value) => value.prototypesGenerated === 0, // tracked, but no prototypes generated
    })
  );

  // we can convert result to an option:
  const resultOption = Option.fromUndefined(result);
  // This is now an Option<Option<DayUsage>>

  // and we can match on it

  return resultOption.match({
    None: () =>
      'Welcome to Arkhet! (we have no previous data of your activity)',
    Some: (value) =>
      value.match({
        None: () => "Seems like you didn't log in last week!", // no data, day was None
        Some: () => "I see you didn't generate any prototypes last week!", // did log in, didn't generate anything
      }),
  });

  // You can ALWAYS do everything you need with boxed types using match statements.
  // when in doubt, use them.
}
