type Tagged<Tag extends string = string> = { _tag: Tag };

type Handlers<U extends Tagged> = {
  [K in U['_tag']]: (v: Extract<U, { _tag: K }>) => any;
};

export function matchTagged<U extends Tagged>(
  value: U,
  handlers: Handlers<U>
): ReturnType<Handlers<U>[U['_tag']]> {
  const key = value._tag as U['_tag'];

  return handlers[key](value as never);
}

// ── Define some tagged error types
class NetworkError {
  readonly _tag = 'NetworkError' as const;
  constructor(public msg: string) { }
}
class ValidationError {
  readonly _tag = 'ValidationError' as const;
  constructor(
    public field: string,
    public msg: string
  ) { }
}

type AppError = NetworkError | ValidationError;

// ── Somewhere in your code:
function handleError(err: AppError) {
  return matchTagged(err, {
    NetworkError: (e) => `Could not reach server: ${e.msg}`,
    ValidationError: (e) => `Field ${e.field} is invalid: ${e.msg}`,
  });
}
