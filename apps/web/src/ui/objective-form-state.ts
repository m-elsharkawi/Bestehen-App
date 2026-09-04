export interface ObjectiveFormState {
  readonly status: "editing" | "invalid" | "retry" | "session_expired";
  readonly values: Readonly<Record<string, string>>;
  readonly invalidFields: readonly string[];
  readonly message: string;
}
export type ObjectiveFormAction = (
  previous: ObjectiveFormState,
  data: FormData,
) => Promise<ObjectiveFormState>;
export const initialObjectiveFormState: ObjectiveFormState = {
  status: "editing",
  values: {},
  invalidFields: [],
  message: "",
};
