declare const opaqueId: unique symbol;

/** App-owned identifier. Provider identifiers must never be used as domain identifiers. */
export type AppId<Kind extends string> = string & {
  readonly [opaqueId]: Kind;
};

export type Result<Value, Failure> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: Failure };

export function appId<Kind extends string>(value: string): AppId<Kind> {
  if (!/^[a-z0-9][a-z0-9_-]{7,127}$/i.test(value)) {
    throw new Error("App identifiers must be opaque and between 8 and 128 safe characters.");
  }
  return value as AppId<Kind>;
}
