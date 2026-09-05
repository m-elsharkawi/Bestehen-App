/** Append-only operation facts plus a versioned, replaceable Listening state projection. */
export const listeningRuntimeSql = `
ALTER TABLE app.listening_plans
  ADD COLUMN plan_json jsonb,
  ADD COLUMN resource_version bigint NOT NULL DEFAULT 0 CHECK(resource_version>=0),
  ADD COLUMN context jsonb,
  ADD COLUMN begin_at timestamptz,
  ADD COLUMN started_at timestamptz,
  ADD COLUMN block_completed_at timestamptz;
ALTER TABLE app.media_preflight_receipts
  ADD COLUMN observation jsonb,
  ADD COLUMN receipt jsonb;
ALTER TABLE app.playback_occurrences
  ADD COLUMN local_intent_id text,
  ADD COLUMN preflight_receipt_id uuid,
  ADD COLUMN context jsonb,
  ADD CONSTRAINT playback_preflight_scope_fk FOREIGN KEY(learner_scope_id,preflight_receipt_id)
    REFERENCES app.media_preflight_receipts(learner_scope_id,id);
CREATE TABLE app.listening_operation_facts (
  learner_scope_id uuid NOT NULL,
  operation_id text NOT NULL,
  listening_plan_id uuid NOT NULL,
  kind text NOT NULL CHECK(kind IN ('preflight','playback')),
  payload_digest text NOT NULL CHECK(length(payload_digest)=64),
  command jsonb NOT NULL,
  receipt jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(learner_scope_id,operation_id),
  FOREIGN KEY(learner_scope_id,listening_plan_id) REFERENCES app.listening_plans(learner_scope_id,id)
);
CREATE INDEX listening_operation_plan_idx ON app.listening_operation_facts(learner_scope_id,listening_plan_id,recorded_at,operation_id);
CREATE TRIGGER listening_operation_facts_immutable BEFORE UPDATE OR DELETE ON app.listening_operation_facts FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TRIGGER media_preflight_receipts_immutable BEFORE UPDATE OR DELETE ON app.media_preflight_receipts FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TRIGGER listening_plan_occurrences_immutable BEFORE UPDATE OR DELETE ON app.listening_plan_occurrences FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE FUNCTION app.guard_listening_plan_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (to_jsonb(NEW)-ARRAY['resource_version','context','begin_at','started_at','block_completed_at','revocation_state']) IS DISTINCT FROM
     (to_jsonb(OLD)-ARRAY['resource_version','context','begin_at','started_at','block_completed_at','revocation_state']) THEN
    RAISE EXCEPTION 'immutable Listening plan identity';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER listening_plan_identity_immutable BEFORE UPDATE ON app.listening_plans FOR EACH ROW EXECUTE FUNCTION app.guard_listening_plan_identity();
CREATE TRIGGER listening_plan_delete_immutable BEFORE DELETE ON app.listening_plans FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
`;
