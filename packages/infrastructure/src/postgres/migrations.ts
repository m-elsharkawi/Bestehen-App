import { createHash } from "node:crypto";
import { reasonRegistryV1 } from "@bestehen/domain";
import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

export const foundationRevision = "20260825_040_p03_foundation";

const identityAndReleaseSql = `
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE app.learner_scopes (
  id uuid PRIMARY KEY, state text NOT NULL CHECK (state IN ('active','deletion_in_progress','deleted')),
  next_sequence bigint NOT NULL DEFAULT 1 CHECK (next_sequence > 0), resource_version bigint NOT NULL DEFAULT 1 CHECK (resource_version > 0),
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), updated_at timestamptz NOT NULL DEFAULT transaction_timestamp(), deleted_at timestamptz
);
CREATE INDEX learner_scopes_state_idx ON app.learner_scopes(state);
CREATE TABLE app.principals (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK (kind IN ('account','guest','operator','worker')),
  state text NOT NULL CHECK (state IN ('active','retired','revoked')), created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), retired_at timestamptz
);
CREATE INDEX principals_kind_state_idx ON app.principals(kind,state);
CREATE TABLE app.credential_bindings (
  id uuid PRIMARY KEY, principal_id uuid NOT NULL REFERENCES app.principals(id), kind text NOT NULL CHECK (kind = 'oidc'), provider text NOT NULL,
  issuer text NOT NULL, subject text NOT NULL, subject_fingerprint text NOT NULL CHECK (length(subject_fingerprint)=64),
  state text NOT NULL CHECK (state IN ('active','retiring','retired','revoked')), verified_at timestamptz NOT NULL, retired_at timestamptz,
  identity_release text NOT NULL
);
CREATE UNIQUE INDEX credential_active_subject_uidx ON app.credential_bindings(issuer,subject) WHERE state='active';
CREATE UNIQUE INDEX credential_active_fingerprint_uidx ON app.credential_bindings(subject_fingerprint) WHERE state='active';
CREATE TABLE app.principal_scope_bindings (
  principal_id uuid NOT NULL REFERENCES app.principals(id), learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  state text NOT NULL CHECK (state IN ('pending','active','retired')), operation_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), retired_at timestamptz,
  PRIMARY KEY (principal_id,learner_scope_id,operation_id)
);
CREATE UNIQUE INDEX principal_scope_active_principal_uidx ON app.principal_scope_bindings(principal_id) WHERE state='active';
CREATE UNIQUE INDEX principal_scope_active_scope_uidx ON app.principal_scope_bindings(learner_scope_id) WHERE state='active';
CREATE TABLE app.app_sessions (
  id uuid PRIMARY KEY, token_digest text NOT NULL UNIQUE CHECK (length(token_digest)=64), principal_id uuid NOT NULL REFERENCES app.principals(id),
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), state text NOT NULL CHECK (state IN ('active','revoked','idle_expired','absolute_expired')),
  created_at timestamptz NOT NULL, last_used_at timestamptz NOT NULL, authenticated_at timestamptz NOT NULL,
  idle_expires_at timestamptz NOT NULL, absolute_expires_at timestamptz NOT NULL, revoked_at timestamptz,
  policy_release text NOT NULL CHECK (policy_release='session-policy/v1'), rotation_predecessor_id uuid REFERENCES app.app_sessions(id),
  CHECK (idle_expires_at <= absolute_expires_at)
);
CREATE INDEX app_sessions_scope_state_expiry_idx ON app.app_sessions(learner_scope_id,state,idle_expires_at,absolute_expires_at);
CREATE INDEX app_sessions_principal_idx ON app.app_sessions(principal_id,created_at DESC);
CREATE TABLE app.oidc_transactions (
  transaction_digest text PRIMARY KEY CHECK (length(transaction_digest)=64), state_digest text NOT NULL UNIQUE CHECK (length(state_digest)=64),
  nonce_digest text NOT NULL CHECK (length(nonce_digest)=64), pkce_verifier_sealed text NOT NULL,
  return_path text NOT NULL CHECK (return_path LIKE '/%' AND return_path NOT LIKE '//%'), created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL, used_at timestamptz, CHECK (expires_at > created_at)
);
CREATE INDEX oidc_transactions_expiry_idx ON app.oidc_transactions(expires_at) WHERE used_at IS NULL;
CREATE TABLE app.profile_facts (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), fact_kind text NOT NULL,
  operation_id uuid NOT NULL, learner_sequence bigint NOT NULL CHECK (learner_sequence > 0), schema_major integer NOT NULL CHECK (schema_major=1),
  payload jsonb NOT NULL, occurred_at timestamptz, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), effective_at timestamptz NOT NULL,
  supersedes_id uuid REFERENCES app.profile_facts(id), UNIQUE(learner_scope_id,operation_id,fact_kind), UNIQUE(learner_scope_id,learner_sequence)
);
CREATE TABLE app.release_units (
  id uuid PRIMARY KEY, unit_type text NOT NULL, name text NOT NULL, semantic_version text NOT NULL, digest text NOT NULL CHECK(length(digest)=64),
  state text NOT NULL CHECK(state IN ('candidate','active','retired','quarantined')), effective_at timestamptz,
  predecessor_id uuid REFERENCES app.release_units(id), provenance_ref text NOT NULL, evidence_ref text NOT NULL,
  UNIQUE(unit_type,name,semantic_version), UNIQUE(digest)
);
CREATE TABLE app.activation_manifests (
  id uuid PRIMARY KEY, profile text NOT NULL, version text NOT NULL, digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  state text NOT NULL CHECK(state IN ('candidate','active','retired','quarantined')), source_commit text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), activated_at timestamptz, predecessor_id uuid REFERENCES app.activation_manifests(id)
);
CREATE UNIQUE INDEX activation_one_active_profile_uidx ON app.activation_manifests(profile) WHERE state='active';
CREATE TABLE app.activation_manifest_units (
  manifest_id uuid NOT NULL REFERENCES app.activation_manifests(id), unit_id uuid NOT NULL REFERENCES app.release_units(id), role text NOT NULL,
  compatibility_status text NOT NULL CHECK(compatibility_status IN ('compatible','incompatible','unknown')),
  PRIMARY KEY(manifest_id,unit_id,role)
);
CREATE TABLE app.compatibility_windows (
  id uuid PRIMARY KEY, producer_kind text NOT NULL, producer_major integer NOT NULL CHECK(producer_major>0), consumer_kind text NOT NULL,
  consumer_major integer NOT NULL CHECK(consumer_major>0), minimum_revision text NOT NULL, maximum_revision text NOT NULL,
  effective_at timestamptz NOT NULL, retired_at timestamptz, migration_mode text NOT NULL CHECK(migration_mode IN ('read','write','job'))
);
CREATE INDEX compatibility_lookup_idx ON app.compatibility_windows(consumer_kind,consumer_major,producer_kind,producer_major);
CREATE TABLE app.reason_registry_releases (
  id text PRIMARY KEY, major integer NOT NULL CHECK(major=1), minor integer NOT NULL CHECK(minor>=0), digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE TABLE app.reason_codes (
  registry_id text NOT NULL REFERENCES app.reason_registry_releases(id), code text NOT NULL, family text NOT NULL CHECK(family IN ('VALIDITY','DIRECT','RISK','UNCERTAINTY','DUE','PROGRESSION','COVERAGE','PREFERENCE','CONTEXT','FALLBACK')),
  owner text NOT NULL, learner_fault boolean NOT NULL DEFAULT false, template_key text NOT NULL, retention_class text NOT NULL CHECK(retention_class IN ('semantic','operational','security')),
  PRIMARY KEY(registry_id,code), CHECK(code LIKE family || '.%')
);
CREATE TABLE app.content_families (
  id uuid PRIMARY KEY, family_key text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE TABLE app.content_revisions (
  id uuid PRIMARY KEY, family_id uuid NOT NULL REFERENCES app.content_families(id), revision text NOT NULL, role text NOT NULL,
  approval_state text NOT NULL CHECK(approval_state IN ('candidate','approved','denied','quarantined','retired')),
  rights_state text NOT NULL CHECK(rights_state IN ('eligible','restricted','withdrawn','unknown')),
  compatibility_state text NOT NULL CHECK(compatibility_state IN ('compatible','incompatible','unknown')),
  digest text NOT NULL CHECK(length(digest)=64), predecessor_id uuid REFERENCES app.content_revisions(id), UNIQUE(family_id,revision), UNIQUE(digest)
);
`;

const learnerFactsSql = `
CREATE TABLE app.plan_revisions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), source_cut bigint NOT NULL CHECK(source_cut>=0),
  policy_release text NOT NULL, reason_release text NOT NULL, template_release text NOT NULL, content_release text NOT NULL,
  intents jsonb NOT NULL, reasons jsonb NOT NULL, checksum text NOT NULL CHECK(length(checksum)=64), predecessor_id uuid REFERENCES app.plan_revisions(id),
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), UNIQUE(learner_scope_id,checksum)
);
CREATE INDEX plan_revisions_scope_cut_idx ON app.plan_revisions(learner_scope_id,source_cut DESC);
CREATE TABLE app.sessions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), plan_revision_id uuid NOT NULL REFERENCES app.plan_revisions(id),
  state text NOT NULL CHECK(state IN ('assembling','offered','active','updating','paused','partially_completed','completed','replanned','blocked','unavailable','failed','deleted')),
  resource_version bigint NOT NULL DEFAULT 1 CHECK(resource_version>0), started_at timestamptz, terminal_at timestamptz
);
CREATE INDEX sessions_scope_state_idx ON app.sessions(learner_scope_id,state);
CREATE TABLE app.activity_occurrences (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), session_id uuid NOT NULL REFERENCES app.sessions(id),
  operation_id uuid NOT NULL, state text NOT NULL, resource_version bigint NOT NULL DEFAULT 1, meaningful_boundary_at timestamptz, terminal_at timestamptz,
  UNIQUE(learner_scope_id,operation_id)
);
CREATE TABLE app.coaching_episodes (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), activity_occurrence_id uuid NOT NULL REFERENCES app.activity_occurrences(id),
  state text NOT NULL, resource_version bigint NOT NULL DEFAULT 1, terminal_at timestamptz
);
CREATE TABLE app.attempts (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), session_id uuid NOT NULL REFERENCES app.sessions(id),
  activity_occurrence_id uuid NOT NULL REFERENCES app.activity_occurrences(id), episode_id uuid NOT NULL REFERENCES app.coaching_episodes(id),
  content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id), modality text NOT NULL CHECK(modality IN ('reading','language_elements','listening','writing','speaking')),
  direct_lane text NOT NULL, state text NOT NULL CHECK(state IN ('started','checkpointed','submitted','completed','interrupted','not_counted')),
  resource_version bigint NOT NULL DEFAULT 1, operation_id uuid NOT NULL, occurred_at timestamptz, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), terminal_hash text,
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id), CHECK(terminal_hash IS NULL OR length(terminal_hash)=64)
);
CREATE INDEX attempts_scope_state_idx ON app.attempts(learner_scope_id,state,recorded_at DESC);
CREATE TABLE app.attempt_checkpoints (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL, attempt_id uuid NOT NULL, stream text NOT NULL, sequence bigint NOT NULL CHECK(sequence>0),
  expected_attempt_version bigint NOT NULL CHECK(expected_attempt_version>0), operation_id uuid NOT NULL, payload_digest text NOT NULL CHECK(length(payload_digest)=64),
  accepted_at timestamptz NOT NULL DEFAULT transaction_timestamp(), FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id),
  UNIQUE(attempt_id,stream,sequence), UNIQUE(learner_scope_id,operation_id)
);
CREATE TABLE app.response_facts (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL, attempt_id uuid NOT NULL, fact_type text NOT NULL, schema_major integer NOT NULL CHECK(schema_major=1),
  envelope jsonb NOT NULL, digest text NOT NULL CHECK(length(digest)=64), learner_sequence bigint NOT NULL CHECK(learner_sequence>0),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id), UNIQUE(learner_scope_id,learner_sequence), UNIQUE(attempt_id,fact_type,digest)
);
CREATE TABLE app.condition_facts (LIKE app.response_facts INCLUDING ALL);
CREATE TABLE app.exposure_facts (LIKE app.response_facts INCLUDING ALL);
CREATE TABLE app.independent_occasions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), episode_id uuid NOT NULL REFERENCES app.coaching_episodes(id),
  mock_occasion_id uuid, independence_class text NOT NULL CHECK(independence_class IN ('first_attempt','immediate_retry','delayed_transfer','retention_check','repeated_exposed_practice','mock_measurement')),
  family_relation text NOT NULL, policy_release text NOT NULL
);
CREATE TABLE app.evidence_observations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), attempt_id uuid NOT NULL REFERENCES app.attempts(id),
  occasion_id uuid NOT NULL REFERENCES app.independent_occasions(id), operation_id uuid NOT NULL, direct_lane text NOT NULL,
  supported_scope jsonb NOT NULL, outcome jsonb NOT NULL, conditions jsonb NOT NULL, evaluation jsonb NOT NULL, compatibility jsonb NOT NULL,
  learner_sequence bigint NOT NULL CHECK(learner_sequence>0), recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  current_assertion_id uuid, UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,learner_sequence)
);
CREATE INDEX evidence_observations_scope_sequence_idx ON app.evidence_observations(learner_scope_id,learner_sequence);
CREATE TABLE app.validity_assertions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), observation_id uuid NOT NULL REFERENCES app.evidence_observations(id),
  prior_assertion_id uuid REFERENCES app.validity_assertions(id), state text NOT NULL CHECK(state IN ('valid','partially_valid','pending','interrupted','not_counted')),
  affected_scope jsonb NOT NULL, unaffected_scope jsonb NOT NULL, reason_registry_id text NOT NULL, reason_code text NOT NULL,
  asserted_owner text NOT NULL, actor_ref text NOT NULL, evidence_ref text NOT NULL, effective_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), release text NOT NULL,
  FOREIGN KEY(reason_registry_id,reason_code) REFERENCES app.reason_codes(registry_id,code),
  CHECK(state NOT IN ('partially_valid','pending') OR (jsonb_array_length(affected_scope)>0 AND jsonb_array_length(unaffected_scope)>0))
);
ALTER TABLE app.evidence_observations ADD CONSTRAINT evidence_current_assertion_fk FOREIGN KEY(current_assertion_id) REFERENCES app.validity_assertions(id);
CREATE INDEX validity_assertions_scope_observation_idx ON app.validity_assertions(learner_scope_id,observation_id,recorded_at);
CREATE TABLE app.evidence_corrections (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), operation_id uuid NOT NULL,
  target_observation_id uuid REFERENCES app.evidence_observations(id), target_assertion_id uuid REFERENCES app.validity_assertions(id),
  selector_digest text NOT NULL CHECK(length(selector_digest)=64), impact_digest text NOT NULL CHECK(length(impact_digest)=64),
  reason_registry_id text NOT NULL, reason_code text NOT NULL, asserted_owner text NOT NULL, requested_projections jsonb NOT NULL,
  supersedes_id uuid REFERENCES app.evidence_corrections(id), recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  FOREIGN KEY(reason_registry_id,reason_code) REFERENCES app.reason_codes(registry_id,code), UNIQUE(learner_scope_id,operation_id),
  UNIQUE(learner_scope_id,asserted_owner,impact_digest), CHECK(target_observation_id IS NOT NULL OR target_assertion_id IS NOT NULL)
);
CREATE TABLE app.projection_generations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), owner text NOT NULL,
  kind text NOT NULL CHECK(kind IN ('capability','weakness','progression','readiness')), availability text NOT NULL CHECK(availability IN ('current','recomputing','stale','blocked_by_pending','unavailable','failed','deleted')),
  source_cut bigint NOT NULL CHECK(source_cut>=0), selector_digest text NOT NULL CHECK(length(selector_digest)=64), correction_digest text NOT NULL CHECK(length(correction_digest)=64),
  rules_release text NOT NULL, calibration_release text NOT NULL, target_release text, payload jsonb NOT NULL,
  checksum text NOT NULL CHECK(length(checksum)=64), predecessor_id uuid REFERENCES app.projection_generations(id), created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), published_at timestamptz,
  UNIQUE(learner_scope_id,kind,source_cut,rules_release,calibration_release,selector_digest,correction_digest)
);
CREATE INDEX projection_generations_scope_kind_cut_idx ON app.projection_generations(learner_scope_id,kind,source_cut DESC);
CREATE TABLE app.current_projection_pointers (
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), kind text NOT NULL, generation_id uuid NOT NULL REFERENCES app.projection_generations(id),
  resource_version bigint NOT NULL CHECK(resource_version>0), PRIMARY KEY(learner_scope_id,kind)
);
CREATE TABLE app.projection_source_refs (
  generation_id uuid NOT NULL REFERENCES app.projection_generations(id), observation_id uuid NOT NULL REFERENCES app.evidence_observations(id),
  assertion_id uuid NOT NULL REFERENCES app.validity_assertions(id), disposition text NOT NULL CHECK(disposition IN ('included','excluded')),
  reason_code text NOT NULL, PRIMARY KEY(generation_id,observation_id,assertion_id)
);
CREATE TABLE app.weakness_transitions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), weakness_id uuid NOT NULL, claim_key text NOT NULL,
  from_state text, to_state text NOT NULL CHECK(to_state IN ('candidate','historical_unconfirmed','known','repairing','stabilizing','repaired','resolved')),
  cause text NOT NULL, confidence text NOT NULL, source_cut bigint NOT NULL, reason_code text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE INDEX weakness_scope_claim_idx ON app.weakness_transitions(learner_scope_id,claim_key,recorded_at DESC);
CREATE TABLE app.review_obligations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), state text NOT NULL CHECK(state IN ('scheduled','window_open','overdue','pending_evaluation','blocked_content','repair_required','satisfied','completed')),
  required_lane text NOT NULL, required_condition text NOT NULL, required_stage text NOT NULL, window_start timestamptz, window_end timestamptz,
  source_cut bigint NOT NULL, resource_version bigint NOT NULL DEFAULT 1
);
CREATE INDEX review_scope_state_window_idx ON app.review_obligations(learner_scope_id,state,window_start);
CREATE TABLE app.progression_profiles (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), task_family_id uuid NOT NULL REFERENCES app.content_families(id),
  direct_lane text NOT NULL, progression text NOT NULL CHECK(progression IN ('P0','P1','P2','P3','P4')),
  adoption text NOT NULL CHECK(adoption IN ('confirmed','probe_eligible','probing','provisional','recovering')), axes jsonb NOT NULL,
  source_cut bigint NOT NULL, generation_id uuid NOT NULL REFERENCES app.projection_generations(id), UNIQUE(learner_scope_id,task_family_id,direct_lane,generation_id)
);
CREATE TABLE app.readiness_snapshots (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), state text NOT NULL CHECK(state IN ('evidence_building','not_ready','borderline','safe','ready_to_book','stale_contradicted')),
  written jsonb NOT NULL CHECK(written ? 'status'), oral jsonb NOT NULL CHECK(oral ? 'status'), source_cut bigint NOT NULL,
  rules_release text NOT NULL, generation_id uuid NOT NULL REFERENCES app.projection_generations(id), created_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE TABLE app.booking_gate_results (
  readiness_snapshot_id uuid NOT NULL REFERENCES app.readiness_snapshots(id), gate text NOT NULL CHECK(gate IN ('A','B','C','D','E','F')),
  status text NOT NULL CHECK(status IN ('met','not_met','pending','not_applicable')), reasons jsonb NOT NULL,
  PRIMARY KEY(readiness_snapshot_id,gate)
);
CREATE OR REPLACE FUNCTION app.reject_immutable_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'immutable_relation'; END $$;
CREATE OR REPLACE FUNCTION app.protect_evidence_observation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' OR (to_jsonb(NEW)-'current_assertion_id') <> (to_jsonb(OLD)-'current_assertion_id') THEN RAISE EXCEPTION 'immutable_relation'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER evidence_observations_immutable BEFORE UPDATE OR DELETE ON app.evidence_observations FOR EACH ROW EXECUTE FUNCTION app.protect_evidence_observation();
CREATE TRIGGER validity_assertions_immutable BEFORE UPDATE OR DELETE ON app.validity_assertions FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TRIGGER evidence_corrections_immutable BEFORE UPDATE OR DELETE ON app.evidence_corrections FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
`;

const jobsAuditRightsSql = `
CREATE TABLE app.operation_receipts (
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), operation_id uuid NOT NULL, kind text NOT NULL,
  canonicalization_version text NOT NULL CHECK(canonicalization_version='canonical-json/v1'), payload_digest text NOT NULL CHECK(length(payload_digest)=64),
  status text NOT NULL CHECK(status IN ('accepted','completed')), resource_ref text, result_ref text,
  first_seen_at timestamptz NOT NULL DEFAULT transaction_timestamp(), last_seen_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  expiry_class text NOT NULL CHECK(expiry_class IN ('semantic','retry_horizon','rights')), PRIMARY KEY(learner_scope_id,operation_id,kind)
);
CREATE TABLE app.job_resources (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('projection_rebuild_v1','outbox_dispatch_v1','rights_reconcile_v1')),
  semantic_identity text NOT NULL, state text NOT NULL CHECK(state IN ('accepted','scheduled','running','succeeded_candidate','retry_scheduled','cancel_requested','published','cancelled','failed_terminal','expired','quarantined','superseded')),
  revision bigint NOT NULL CHECK(revision>0), owner text NOT NULL, actor_scope text NOT NULL, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  payload_digest text NOT NULL CHECK(length(payload_digest)=64), contract_major integer NOT NULL CHECK(contract_major=1), release text NOT NULL,
  deadline timestamptz NOT NULL, attempt integer NOT NULL DEFAULT 0 CHECK(attempt>=0), maximum_attempts integer NOT NULL CHECK(maximum_attempts BETWEEN 1 AND 20),
  cancellation_requested_at timestamptz, dependent_scope jsonb NOT NULL, unaffected_scope jsonb NOT NULL,
  result_digest text, failure_reason text, predecessor_id uuid REFERENCES app.job_resources(id), created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), updated_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(kind,semantic_identity)
);
CREATE INDEX job_resources_state_deadline_idx ON app.job_resources(state,deadline);
CREATE INDEX job_resources_scope_state_idx ON app.job_resources(learner_scope_id,state);
CREATE TABLE app.job_transitions (
  job_id uuid NOT NULL REFERENCES app.job_resources(id), revision bigint NOT NULL, from_state text, to_state text NOT NULL,
  reason_code text, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), PRIMARY KEY(job_id,revision)
);
CREATE TABLE app.job_effect_receipts (
  job_id uuid NOT NULL REFERENCES app.job_resources(id), effect_identity text NOT NULL, effect_digest text NOT NULL CHECK(length(effect_digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), PRIMARY KEY(job_id,effect_identity)
);
CREATE TABLE app.outbox_events (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), event_type text NOT NULL, contract_major integer NOT NULL CHECK(contract_major=1),
  aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, aggregate_revision bigint NOT NULL CHECK(aggregate_revision>0), selector_payload jsonb NOT NULL,
  payload_digest text NOT NULL CHECK(length(payload_digest)=64), correlation_id uuid NOT NULL, causation_id uuid,
  dispatch_state text NOT NULL CHECK(dispatch_state IN ('pending','dispatched','failed','quarantined')), created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), dispatched_at timestamptz,
  UNIQUE(aggregate_type,aggregate_id,aggregate_revision,event_type)
);
CREATE INDEX outbox_pending_age_idx ON app.outbox_events(dispatch_state,created_at);
CREATE TABLE app.inbox_receipts (
  event_id uuid NOT NULL, consumer text NOT NULL, handler_major integer NOT NULL CHECK(handler_major=1),
  payload_digest text NOT NULL CHECK(length(payload_digest)=64), effect_digest text, status text NOT NULL CHECK(status IN ('accepted','completed','quarantined')),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), PRIMARY KEY(event_id,consumer,handler_major)
);
CREATE TABLE app.security_audit_events (
  id uuid PRIMARY KEY, actor_scope text NOT NULL, action text NOT NULL, target_class text NOT NULL, target_digest text NOT NULL CHECK(length(target_digest)=64),
  outcome text NOT NULL CHECK(outcome IN ('allowed','denied','conflict','failed')), reason_code text NOT NULL, request_id uuid NOT NULL, trace_id uuid NOT NULL,
  release text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), retention_class text NOT NULL CHECK(retention_class IN ('security_90d','semantic_until_deletion'))
);
CREATE INDEX security_audit_action_time_idx ON app.security_audit_events(action,recorded_at DESC);
CREATE TABLE app.export_operations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), operation_id uuid NOT NULL, source_cut bigint NOT NULL CHECK(source_cut>=0),
  format text NOT NULL, state text NOT NULL CHECK(state IN ('requested','building','available','expired','failed_retrying','deleted')),
  artifact_ref text, artifact_digest text, expires_at timestamptz, receipt_digest text, UNIQUE(learner_scope_id,operation_id,source_cut)
);
CREATE TABLE app.deletion_operations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), operation_id uuid NOT NULL,
  state text NOT NULL CHECK(state IN ('requested','access_revoked','live_purging','provider_pending','live_erased_backup_residual','fully_expired','failed_retrying')),
  inventory_version text NOT NULL, inventory_digest text NOT NULL CHECK(length(inventory_digest)=64), requested_at timestamptz NOT NULL,
  access_revoked_at timestamptz, live_erased_at timestamptz, backup_expires_at timestamptz, policy_release text NOT NULL,
  UNIQUE(learner_scope_id,operation_id)
);
CREATE UNIQUE INDEX deletion_one_active_scope_uidx ON app.deletion_operations(learner_scope_id) WHERE state NOT IN ('fully_expired');
CREATE TABLE app.deletion_steps (
  deletion_operation_id uuid NOT NULL REFERENCES app.deletion_operations(id), step text NOT NULL, owner text NOT NULL, target_class text NOT NULL,
  state text NOT NULL CHECK(state IN ('pending','running','completed','failed_retrying','provider_pending')), inventory_digest text NOT NULL,
  receipt_digest text, attempt integer NOT NULL DEFAULT 0, next_action_at timestamptz, updated_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(deletion_operation_id,step)
);
CREATE TABLE app.learner_tombstones (
  learner_scope_id uuid PRIMARY KEY, scope_digest text NOT NULL UNIQUE CHECK(length(scope_digest)=64), deletion_operation_id uuid NOT NULL REFERENCES app.deletion_operations(id),
  cutoff timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), expires_at timestamptz NOT NULL,
  state text NOT NULL CHECK(state IN ('active','expired')), CHECK(expires_at <= created_at + interval '91 days')
);
CREATE TABLE app.restore_suppression_journal (
  learner_scope_id uuid NOT NULL REFERENCES app.learner_tombstones(learner_scope_id), backup_generation text NOT NULL, cutoff timestamptz NOT NULL,
  replay_state text NOT NULL CHECK(replay_state IN ('pending','suppressed','verified','failed_retrying')), proof_digest text,
  expires_at timestamptz NOT NULL, PRIMARY KEY(learner_scope_id,backup_generation)
);
CREATE TRIGGER job_transitions_immutable BEFORE UPDATE OR DELETE ON app.job_transitions FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TRIGGER job_effect_receipts_immutable BEFORE UPDATE OR DELETE ON app.job_effect_receipts FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TRIGGER security_audit_immutable BEFORE UPDATE OR DELETE ON app.security_audit_events FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
`;

const compatibilitySql = `
CREATE TABLE app.schema_revisions (
  revision text PRIMARY KEY, checksum text NOT NULL CHECK(length(checksum)=64), applied_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
INSERT INTO app.schema_revisions(revision,checksum) VALUES ('20260825_040_p03_foundation', repeat('0',64));
`;

function checksum(source: string): string {
  return createHash("sha256").update(source).digest("hex");
}

async function execute(db: Kysely<unknown>, source: string): Promise<void> {
  await sql.raw(source).execute(db);
}

function immutableMigration(
  source: string,
  seed?: (db: Kysely<unknown>) => Promise<void>,
): Migration {
  return {
    async up(db) {
      await execute(db, source);
      await seed?.(db);
    },
    async down() {
      throw new Error("Stage 03 migrations are roll-forward only");
    },
  };
}

export const migrationSources = {
  "20260825_010_identity_release": identityAndReleaseSql,
  "20260825_020_learner_facts_evidence": learnerFactsSql,
  "20260825_030_jobs_audit_rights": jobsAuditRightsSql,
  [foundationRevision]: compatibilitySql,
} as const;

export const migrationChecksums: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(migrationSources).map(([name, source]) => [name, checksum(source)]),
);

export const foundationMigrations: Readonly<Record<string, Migration>> = {
  "20260825_010_identity_release": immutableMigration(identityAndReleaseSql, async (db) => {
    const registryDigest = checksum(JSON.stringify(reasonRegistryV1));
    await sql`INSERT INTO app.reason_registry_releases(id,major,minor,digest) VALUES ('reason-registry/v1',1,0,${registryDigest})`.execute(
      db,
    );
    for (const reason of reasonRegistryV1) {
      await sql`INSERT INTO app.reason_codes(registry_id,code,family,owner,learner_fault,template_key,retention_class)
        VALUES ('reason-registry/v1',${reason.code},${reason.code.split(".")[0]},${reason.owner},${reason.learnerFault},${reason.templateKey},${reason.retentionClass})`.execute(
        db,
      );
    }
  }),
  "20260825_020_learner_facts_evidence": immutableMigration(learnerFactsSql),
  "20260825_030_jobs_audit_rights": immutableMigration(jobsAuditRightsSql),
  [foundationRevision]: immutableMigration(compatibilitySql, async (db) => {
    for (const [revision, digest] of Object.entries(migrationChecksums)) {
      await sql`INSERT INTO app.schema_revisions(revision,checksum) VALUES (${revision},${digest})
        ON CONFLICT (revision) DO UPDATE SET checksum=EXCLUDED.checksum`.execute(db);
    }
  }),
};
