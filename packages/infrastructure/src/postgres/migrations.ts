import { createHash } from "node:crypto";
import { reasonRegistryRelease, reasonRegistryV1 } from "@bestehen/domain";
import { type Kysely, sql } from "kysely";
import type { Migration } from "kysely/migration";

export const foundationRevision = "20260825_040_p03_foundation";

/**
 * Terminal Stage 05 revision. `checkSchemaCompatibility` builds its ordinal list from
 * `Object.keys(foundationMigrations)`, so insertion order — not the numeric prefix — is the
 * contract; the prefixes are numbered to agree with it anyway.
 */
export const stage05Revision = "20260901_054_p05_content_runtime";

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
  supersedes_id uuid, UNIQUE(learner_scope_id,operation_id,fact_kind), UNIQUE(learner_scope_id,learner_sequence), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,supersedes_id) REFERENCES app.profile_facts(learner_scope_id,id)
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
  intents jsonb NOT NULL, reasons jsonb NOT NULL, checksum text NOT NULL CHECK(length(checksum)=64), predecessor_id uuid,
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), UNIQUE(learner_scope_id,checksum), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,predecessor_id) REFERENCES app.plan_revisions(learner_scope_id,id)
);
CREATE INDEX plan_revisions_scope_cut_idx ON app.plan_revisions(learner_scope_id,source_cut DESC);
CREATE TABLE app.sessions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), plan_revision_id uuid NOT NULL,
  state text NOT NULL CHECK(state IN ('assembling','offered','active','updating','paused','partially_completed','completed','replanned','blocked','unavailable','failed','deleted')),
  resource_version bigint NOT NULL DEFAULT 1 CHECK(resource_version>0), started_at timestamptz, terminal_at timestamptz,
  UNIQUE(learner_scope_id,id), FOREIGN KEY(learner_scope_id,plan_revision_id) REFERENCES app.plan_revisions(learner_scope_id,id)
);
CREATE INDEX sessions_scope_state_idx ON app.sessions(learner_scope_id,state);
CREATE TABLE app.activity_occurrences (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), session_id uuid NOT NULL,
  operation_id uuid NOT NULL, state text NOT NULL CHECK(state IN ('assembling','offered','active','updating','paused','partially_completed','completed','replanned','blocked','unavailable','failed','deleted')),
  resource_version bigint NOT NULL DEFAULT 1, meaningful_boundary_at timestamptz, terminal_at timestamptz,
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,session_id) REFERENCES app.sessions(learner_scope_id,id)
);
CREATE TABLE app.coaching_episodes (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), activity_occurrence_id uuid NOT NULL,
  state text NOT NULL CHECK(state IN ('assembling','offered','active','updating','paused','partially_completed','completed','replanned','blocked','unavailable','failed','deleted')),
  resource_version bigint NOT NULL DEFAULT 1, terminal_at timestamptz,
  UNIQUE(learner_scope_id,id), FOREIGN KEY(learner_scope_id,activity_occurrence_id) REFERENCES app.activity_occurrences(learner_scope_id,id)
);
CREATE TABLE app.attempts (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), session_id uuid NOT NULL,
  activity_occurrence_id uuid NOT NULL, episode_id uuid NOT NULL,
  content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id), modality text NOT NULL CHECK(modality IN ('reading','language_elements','listening','writing','speaking')),
  direct_lane text NOT NULL, state text NOT NULL CHECK(state IN ('started','checkpointed','submitted','completed','interrupted','not_counted')),
  resource_version bigint NOT NULL DEFAULT 1, operation_id uuid NOT NULL, occurred_at timestamptz, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), terminal_hash text,
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id), CHECK(terminal_hash IS NULL OR length(terminal_hash)=64),
  FOREIGN KEY(learner_scope_id,session_id) REFERENCES app.sessions(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,activity_occurrence_id) REFERENCES app.activity_occurrences(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,episode_id) REFERENCES app.coaching_episodes(learner_scope_id,id)
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
ALTER TABLE app.condition_facts ADD FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id);
ALTER TABLE app.exposure_facts ADD FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id);
CREATE TABLE app.independent_occasions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), episode_id uuid NOT NULL,
  mock_occasion_id uuid, independence_class text NOT NULL CHECK(independence_class IN ('first_attempt','immediate_retry','delayed_transfer','retention_check','repeated_exposed_practice','mock_measurement')),
  family_relation text NOT NULL, policy_release text NOT NULL, UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,episode_id) REFERENCES app.coaching_episodes(learner_scope_id,id)
);
CREATE TABLE app.evidence_observations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), attempt_id uuid NOT NULL,
  occasion_id uuid NOT NULL, operation_id uuid NOT NULL, direct_lane text NOT NULL,
  supported_scope jsonb NOT NULL, outcome jsonb NOT NULL, conditions jsonb NOT NULL, evaluation jsonb NOT NULL, compatibility jsonb NOT NULL,
  learner_sequence bigint NOT NULL CHECK(learner_sequence>0), recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  current_assertion_id uuid, UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,learner_sequence), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,occasion_id) REFERENCES app.independent_occasions(learner_scope_id,id)
);
CREATE INDEX evidence_observations_scope_sequence_idx ON app.evidence_observations(learner_scope_id,learner_sequence);
CREATE TABLE app.validity_assertions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), observation_id uuid NOT NULL,
  prior_assertion_id uuid, state text NOT NULL CHECK(state IN ('valid','partially_valid','pending','interrupted','not_counted')),
  affected_scope jsonb NOT NULL, unaffected_scope jsonb NOT NULL, reason_registry_id text NOT NULL, reason_code text NOT NULL,
  asserted_owner text NOT NULL, actor_ref text NOT NULL, evidence_ref text NOT NULL, effective_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), release text NOT NULL,
  UNIQUE(learner_scope_id,id), FOREIGN KEY(learner_scope_id,observation_id) REFERENCES app.evidence_observations(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,prior_assertion_id) REFERENCES app.validity_assertions(learner_scope_id,id),
  FOREIGN KEY(reason_registry_id,reason_code) REFERENCES app.reason_codes(registry_id,code),
  CHECK(state NOT IN ('partially_valid','pending') OR (jsonb_array_length(affected_scope)>0 AND jsonb_array_length(unaffected_scope)>0))
);
ALTER TABLE app.evidence_observations ADD CONSTRAINT evidence_current_assertion_fk FOREIGN KEY(learner_scope_id,current_assertion_id) REFERENCES app.validity_assertions(learner_scope_id,id);
CREATE INDEX validity_assertions_scope_observation_idx ON app.validity_assertions(learner_scope_id,observation_id,recorded_at);
CREATE TABLE app.evidence_corrections (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), operation_id uuid NOT NULL,
  target_observation_id uuid, target_assertion_id uuid,
  selector_digest text NOT NULL CHECK(length(selector_digest)=64), impact_digest text NOT NULL CHECK(length(impact_digest)=64),
  reason_registry_id text NOT NULL, reason_code text NOT NULL, asserted_owner text NOT NULL, requested_projections jsonb NOT NULL,
  supersedes_id uuid, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  FOREIGN KEY(reason_registry_id,reason_code) REFERENCES app.reason_codes(registry_id,code), UNIQUE(learner_scope_id,operation_id),
  UNIQUE(learner_scope_id,asserted_owner,impact_digest), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,target_observation_id) REFERENCES app.evidence_observations(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,target_assertion_id) REFERENCES app.validity_assertions(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,supersedes_id) REFERENCES app.evidence_corrections(learner_scope_id,id),
  CHECK(target_observation_id IS NOT NULL OR target_assertion_id IS NOT NULL)
);
CREATE TABLE app.projection_generations (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), owner text NOT NULL,
  kind text NOT NULL CHECK(kind IN ('capability','weakness','progression','readiness')), availability text NOT NULL CHECK(availability IN ('current','recomputing','stale','blocked_by_pending','unavailable','failed','deleted')),
  source_cut bigint NOT NULL CHECK(source_cut>=0), selector_digest text NOT NULL CHECK(length(selector_digest)=64), correction_digest text NOT NULL CHECK(length(correction_digest)=64),
  rules_release text NOT NULL, calibration_release text NOT NULL, target_release text, payload jsonb NOT NULL,
  checksum text NOT NULL CHECK(length(checksum)=64), predecessor_id uuid, created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), published_at timestamptz,
  UNIQUE(learner_scope_id,kind,source_cut,rules_release,calibration_release,selector_digest,correction_digest),
  UNIQUE(learner_scope_id,id), UNIQUE(learner_scope_id,kind,id),
  FOREIGN KEY(learner_scope_id,predecessor_id) REFERENCES app.projection_generations(learner_scope_id,id)
);
CREATE INDEX projection_generations_scope_kind_cut_idx ON app.projection_generations(learner_scope_id,kind,source_cut DESC);
CREATE TABLE app.current_projection_pointers (
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), kind text NOT NULL, generation_id uuid NOT NULL,
  resource_version bigint NOT NULL CHECK(resource_version>0), PRIMARY KEY(learner_scope_id,kind),
  FOREIGN KEY(learner_scope_id,kind,generation_id) REFERENCES app.projection_generations(learner_scope_id,kind,id)
);
CREATE TABLE app.projection_source_refs (
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), generation_id uuid NOT NULL, observation_id uuid NOT NULL,
  assertion_id uuid NOT NULL, disposition text NOT NULL CHECK(disposition IN ('included','excluded')),
  reason_code text NOT NULL, PRIMARY KEY(generation_id,observation_id,assertion_id),
  FOREIGN KEY(learner_scope_id,generation_id) REFERENCES app.projection_generations(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,observation_id) REFERENCES app.evidence_observations(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,assertion_id) REFERENCES app.validity_assertions(learner_scope_id,id)
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
  source_cut bigint NOT NULL, generation_id uuid NOT NULL, UNIQUE(learner_scope_id,task_family_id,direct_lane,generation_id),
  FOREIGN KEY(learner_scope_id,generation_id) REFERENCES app.projection_generations(learner_scope_id,id)
);
CREATE TABLE app.readiness_snapshots (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), state text NOT NULL CHECK(state IN ('evidence_building','not_ready','borderline','safe','ready_to_book','stale_contradicted')),
  written jsonb NOT NULL CHECK(written ? 'status'), oral jsonb NOT NULL CHECK(oral ? 'status'), source_cut bigint NOT NULL,
  rules_release text NOT NULL, generation_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(learner_scope_id,id), FOREIGN KEY(learner_scope_id,generation_id) REFERENCES app.projection_generations(learner_scope_id,id)
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
  result_digest text, failure_reason text, predecessor_id uuid, created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), updated_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(learner_scope_id,kind,semantic_identity), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,predecessor_id) REFERENCES app.job_resources(learner_scope_id,id)
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
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id)
);
CREATE UNIQUE INDEX deletion_one_active_scope_uidx ON app.deletion_operations(learner_scope_id) WHERE state NOT IN ('fully_expired');
CREATE TABLE app.deletion_steps (
  deletion_operation_id uuid NOT NULL REFERENCES app.deletion_operations(id), step text NOT NULL, owner text NOT NULL, target_class text NOT NULL,
  state text NOT NULL CHECK(state IN ('pending','running','completed','failed_retrying','provider_pending')), inventory_digest text NOT NULL,
  receipt_digest text, attempt integer NOT NULL DEFAULT 0, next_action_at timestamptz, updated_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(deletion_operation_id,step)
);
CREATE TABLE app.learner_tombstones (
  learner_scope_id uuid PRIMARY KEY REFERENCES app.learner_scopes(id), scope_digest text NOT NULL UNIQUE CHECK(length(scope_digest)=64), deletion_operation_id uuid NOT NULL,
  cutoff timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), expires_at timestamptz NOT NULL,
  state text NOT NULL CHECK(state IN ('active','expired')), CHECK(expires_at <= created_at + interval '91 days'),
  FOREIGN KEY(learner_scope_id,deletion_operation_id) REFERENCES app.deletion_operations(learner_scope_id,id)
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

/*
 * ------------------------------------------------------------------------------------------------
 * Stage 05 — content and deterministic learning runtime.
 *
 * Every Stage 05 schema change is an `ALTER`/`CREATE` in a NEW source. The four Stage 03 source
 * strings above are immutable: `migrationChecksums` is `sha256(source)` per entry and
 * `verifyMigrationChecksums` reads any difference as drift against every already-migrated database.
 * ------------------------------------------------------------------------------------------------
 */

const contentGraphSql = `
CREATE TABLE app.rights_envelopes (
  id uuid PRIMARY KEY, envelope_key text NOT NULL,
  state text NOT NULL CHECK(state IN ('current','superseded','withdrawn','takedown')),
  envelope jsonb NOT NULL, digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  predecessor_id uuid REFERENCES app.rights_envelopes(id), effective_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE UNIQUE INDEX rights_envelopes_current_key_uidx ON app.rights_envelopes(envelope_key) WHERE state='current';
CREATE TABLE app.accessibility_manifests (
  id text PRIMARY KEY, manifest jsonb NOT NULL, language_tag text NOT NULL,
  gate_status text NOT NULL CHECK(gate_status IN ('pass','blocked','not_evaluated')),
  digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE TABLE app.corpus_bundles (
  bundle_id text NOT NULL, revision integer NOT NULL CHECK(revision>0),
  state text NOT NULL CHECK(state IN ('imported','superseded','withdrawn')),
  digest text NOT NULL UNIQUE CHECK(length(digest)=64), provenance jsonb NOT NULL,
  rights_envelope_id uuid NOT NULL REFERENCES app.rights_envelopes(id),
  imported_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(bundle_id,revision)
);
CREATE TABLE app.media_assets (
  id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('audio','image')), manifest_revision text NOT NULL,
  predecessor_id uuid REFERENCES app.media_assets(id), content_family_id uuid REFERENCES app.content_families(id),
  listening_family text CHECK(listening_family IS NULL OR (kind='audio' AND listening_family IN ('H1','H2','H3'))),
  source_role text NOT NULL CHECK(source_role IN ('reviewed_tts','audited_premium_tts','native_human','reusable_direct','authored_image')),
  authored_speed_ratio numeric CHECK(authored_speed_ratio IS NULL OR authored_speed_ratio>0),
  generator jsonb NOT NULL, qa jsonb NOT NULL,
  rights_envelope_id uuid NOT NULL REFERENCES app.rights_envelopes(id),
  accessibility_manifest_id text REFERENCES app.accessibility_manifests(id),
  status text NOT NULL CHECK(status IN ('current','superseded','quarantined','withdrawn')),
  digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), UNIQUE(id,manifest_revision)
);
CREATE TABLE app.media_revisions (
  id uuid PRIMARY KEY, asset_id uuid NOT NULL REFERENCES app.media_assets(id),
  predecessor_id uuid REFERENCES app.media_revisions(id),
  role text NOT NULL CHECK(role IN ('web_primary','future_optimized')),
  object_key text NOT NULL, byte_digest text NOT NULL CHECK(length(byte_digest)=64),
  bytes bigint NOT NULL CHECK(bytes>0), mime text NOT NULL, codec text NOT NULL, container text NOT NULL,
  duration_ms integer NOT NULL CHECK(duration_ms>=0),
  sample_rate integer CHECK(sample_rate IS NULL OR sample_rate>0),
  channels integer CHECK(channels IS NULL OR channels>0),
  bitrate integer CHECK(bitrate IS NULL OR bitrate>0),
  cache_policy_ref text NOT NULL, rights_actions jsonb NOT NULL,
  manifest_digest text NOT NULL UNIQUE CHECK(length(manifest_digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), UNIQUE(object_key,byte_digest)
);
CREATE INDEX media_revisions_asset_role_idx ON app.media_revisions(asset_id,role);
CREATE TABLE app.transcript_revisions (
  id uuid PRIMARY KEY, media_revision_id uuid NOT NULL REFERENCES app.media_revisions(id),
  kind text NOT NULL CHECK(kind IN ('instructional_equivalent','target_transcript','focused_repair_excerpt')),
  answer_bearing boolean NOT NULL,
  earliest_reveal_phase text NOT NULL CHECK(earliest_reveal_phase IN ('never','after_attempt','after_block')),
  rights_envelope_id uuid NOT NULL REFERENCES app.rights_envelopes(id), language text NOT NULL,
  digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp()
);
CREATE TABLE app.approval_decisions (
  id uuid PRIMARY KEY,
  subject_kind text NOT NULL CHECK(subject_kind IN ('content_revision','content_form','media_asset')),
  subject_id uuid NOT NULL, content_class text NOT NULL CHECK(content_class IN ('C0','C1','C2','C3','C4')),
  level text NOT NULL CHECK(level IN ('draft','quarantine','training','independent_b1','readiness_p4','gold','retired')),
  outcome text NOT NULL CHECK(outcome IN ('granted','denied')),
  author_ref text NOT NULL, validator_ref text NOT NULL, approver_ref text NOT NULL, method_version text NOT NULL,
  reason_registry_id text NOT NULL, reason_code text NOT NULL, evidence_ref text NOT NULL,
  predecessor_id uuid REFERENCES app.approval_decisions(id), decided_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  FOREIGN KEY(reason_registry_id,reason_code) REFERENCES app.reason_codes(registry_id,code),
  UNIQUE(subject_kind,subject_id,level,decided_at)
);
CREATE INDEX approval_decisions_subject_idx ON app.approval_decisions(subject_kind,subject_id,recorded_at DESC);
CREATE TRIGGER approval_decisions_immutable BEFORE UPDATE OR DELETE ON app.approval_decisions FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.content_items (
  id uuid PRIMARY KEY, content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  predecessor_item_id uuid REFERENCES app.content_items(id), ordinal integer NOT NULL CHECK(ordinal>0),
  response_kind text NOT NULL CHECK(response_kind IN ('single_select','match','cloze_local_option','cloze_bank_candidate')),
  binding jsonb NOT NULL, scorable jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(content_revision_id,ordinal), UNIQUE(content_revision_id,id)
);
CREATE TABLE app.key_revisions (
  id uuid PRIMARY KEY, content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  content_item_id uuid NOT NULL REFERENCES app.content_items(id),
  predecessor_id uuid REFERENCES app.key_revisions(id),
  accepted_response_set jsonb NOT NULL CHECK(jsonb_array_length(accepted_response_set)>0),
  response_cardinality_min integer NOT NULL CHECK(response_cardinality_min>=0),
  response_cardinality_max integer NOT NULL CHECK(response_cardinality_max>=response_cardinality_min),
  scoring_policy_ref text NOT NULL, decisive_evidence jsonb NOT NULL, distractor_rationale jsonb NOT NULL,
  intended_cause_mapping jsonb NOT NULL, independent_validation jsonb NOT NULL,
  digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  FOREIGN KEY(content_revision_id,content_item_id) REFERENCES app.content_items(content_revision_id,id)
);
REVOKE ALL ON app.key_revisions FROM PUBLIC;
COMMENT ON TABLE app.key_revisions IS 'Server-only key material. Only a key digest may cross the serving boundary; no learner-facing query may read this relation.';
CREATE TRIGGER key_revisions_immutable BEFORE UPDATE OR DELETE ON app.key_revisions FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.content_gate_results (
  id uuid PRIMARY KEY, content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  gate text NOT NULL CHECK(gate IN ('eligibility_brief','semantic_task_design','language_media_creation','deterministic_structure','independent_key_validation','naturalness_register','difficulty_target_fit','anti_copy_diversity','final_media_render_interaction','approval_publish','post_publication_loop')),
  ordinal integer NOT NULL CHECK(ordinal BETWEEN 1 AND 11),
  status text NOT NULL CHECK(status IN ('pass','blocked','not_evaluated','not_applicable')),
  gate_version text NOT NULL, reviewer_ref text NOT NULL, method_version text NOT NULL,
  findings jsonb NOT NULL, material_defect boolean NOT NULL DEFAULT false,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(content_revision_id,gate,method_version,recorded_at)
);
CREATE INDEX content_gate_results_revision_idx ON app.content_gate_results(content_revision_id,ordinal);
CREATE TRIGGER content_gate_results_immutable BEFORE UPDATE OR DELETE ON app.content_gate_results FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.content_forms (
  id uuid PRIMARY KEY, form_revision_id text NOT NULL, form_family_id text,
  target_blueprint_release_id text NOT NULL,
  approval_decision_id uuid NOT NULL REFERENCES app.approval_decisions(id),
  intended_role text NOT NULL CHECK(intended_role IN ('learning_practice','repair_check','independent_practice','mini_mock','section_mock','full_mock','booking_confirmation')),
  progression_profile text NOT NULL CHECK(progression_profile IN ('P0','P1','P2','P3','P4')),
  block_contracts jsonb NOT NULL, navigation_policy text NOT NULL, feedback_policy text NOT NULL,
  checkpoint_policy_ref text NOT NULL, rights_and_accessibility_refs jsonb NOT NULL,
  digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(), UNIQUE(id,form_revision_id)
);
CREATE TABLE app.content_form_entries (
  form_id uuid NOT NULL REFERENCES app.content_forms(id), ordinal integer NOT NULL CHECK(ordinal>0),
  block_id text NOT NULL, content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  content_item_id uuid REFERENCES app.content_items(id), PRIMARY KEY(form_id,ordinal),
  FOREIGN KEY(content_revision_id,content_item_id) REFERENCES app.content_items(content_revision_id,id)
);
CREATE TABLE app.content_releases (
  id text PRIMARY KEY, release_identity text NOT NULL,
  state text NOT NULL CHECK(state IN ('candidate','active','retired','quarantined')),
  digest text NOT NULL UNIQUE CHECK(length(digest)=64), predecessor_id text REFERENCES app.content_releases(id),
  created_at timestamptz NOT NULL DEFAULT transaction_timestamp(), activated_at timestamptz, retired_at timestamptz
);
CREATE UNIQUE INDEX content_releases_one_active_uidx ON app.content_releases(release_identity) WHERE state='active';
CREATE TABLE app.content_release_entries (
  release_id text NOT NULL REFERENCES app.content_releases(id),
  content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  form_id uuid REFERENCES app.content_forms(id), PRIMARY KEY(release_id,content_revision_id)
);
ALTER TABLE app.content_families
  ADD COLUMN task_definition_id text,
  ADD COLUMN task_definition_revision integer CHECK(task_definition_revision IS NULL OR task_definition_revision>0),
  ADD COLUMN task_family_kind text CHECK(task_family_kind IS NULL OR task_family_kind IN ('R1HeadingMatching','R2DetailedSelect','R3SituationNoticeMatching','SB1ContextualGrammarCloze','SB2SharedBankLexicalCloze','H1ShortAnnouncements','H2ConversationInterview','H3ShortFunctionalTexts')),
  ADD COLUMN assignment_basis jsonb,
  ADD COLUMN review_state text CHECK(review_state IS NULL OR review_state IN ('same_family','independent','unresolved'));
ALTER TABLE app.content_revisions
  ADD COLUMN content_class text CHECK(content_class IS NULL OR content_class IN ('C0','C1','C2','C3','C4')),
  ADD COLUMN task_definition_id text,
  ADD COLUMN task_definition_revision integer CHECK(task_definition_revision IS NULL OR task_definition_revision>0),
  ADD COLUMN generation_brief_id text,
  ADD COLUMN generation_brief_revision integer CHECK(generation_brief_revision IS NULL OR generation_brief_revision>0),
  ADD COLUMN corpus_bundle_id text,
  ADD COLUMN corpus_bundle_revision integer,
  ADD COLUMN target_blueprint_release text,
  ADD COLUMN taxonomy_release text,
  ADD COLUMN capability_refs jsonb,
  ADD COLUMN progression_profile text CHECK(progression_profile IS NULL OR progression_profile IN ('P0','P1','P2','P3','P4')),
  ADD COLUMN intended_evidence_roles jsonb,
  ADD COLUMN instruction jsonb,
  ADD COLUMN learner_payload jsonb,
  ADD COLUMN frozen_at timestamptz,
  ADD COLUMN rights_envelope_id uuid REFERENCES app.rights_envelopes(id),
  ADD COLUMN accessibility_manifest_id text REFERENCES app.accessibility_manifests(id),
  ADD COLUMN current_approval_decision_id uuid REFERENCES app.approval_decisions(id),
  ADD CONSTRAINT content_revisions_corpus_bundle_fk FOREIGN KEY(corpus_bundle_id,corpus_bundle_revision) REFERENCES app.corpus_bundles(bundle_id,revision);
CREATE INDEX content_revisions_family_approval_idx ON app.content_revisions(family_id,approval_state);
`;

const attemptRuntimeSql = `
-- Whole-scope 'pending' is representable. The Stage 03 constraint required BOTH partitions to be
-- non-empty for 'partially_valid' AND 'pending', but a content quarantine after pin legitimately
-- suspends the WHOLE supported scope: 'classifyInitialValidity' emits 'pending' with an empty
-- 'unaffected' for it, and Architecture/15-… §6.2 (OriginalOutcome --> Pending) endorses exactly
-- that. Only the 'pending' arm is widened: 'partially_valid' without a surviving partition is still
-- meaningless and is still rejected, as is either state with an empty affected scope.
DO $do$
DECLARE target text;
BEGIN
  SELECT conname INTO target FROM pg_constraint
   WHERE conrelid='app.validity_assertions'::regclass AND contype='c'
     AND pg_get_constraintdef(oid) LIKE '%unaffected_scope%';
  IF target IS NULL THEN RAISE EXCEPTION 'validity partition constraint not found'; END IF;
  EXECUTE format('ALTER TABLE app.validity_assertions DROP CONSTRAINT %I', target);
END $do$;
ALTER TABLE app.validity_assertions ADD CONSTRAINT validity_assertions_partition_check CHECK(
  state NOT IN ('partially_valid','pending')
  OR (jsonb_array_length(affected_scope)>0
      AND (state='pending' OR jsonb_array_length(unaffected_scope)>0))
);
-- D06 data disposition. The old constraint is dropped FIRST, not last: 'in_progress' and
-- 'result_available' are not in the Stage 03 union, so rewriting a row while that CHECK is still in
-- force fails with 23514. The migration runs inside one transaction, so the table is never visible
-- to anyone else without a state constraint.
DO $do$
DECLARE target text;
BEGIN
  SELECT conname INTO target FROM pg_constraint
   WHERE conrelid='app.attempts'::regclass AND contype='c'
     AND pg_get_constraintdef(oid) LIKE '%not_counted%';
  IF target IS NULL THEN RAISE EXCEPTION 'attempt state constraint not found'; END IF;
  EXECUTE format('ALTER TABLE app.attempts DROP CONSTRAINT %I', target);
END $do$;
-- Steps 1-3 then run unconditionally and report their row counts.
DO $do$
DECLARE started_rows bigint; completed_rows bigint; not_counted_rows bigint;
BEGIN
  UPDATE app.attempts SET state='in_progress' WHERE state='started';
  GET DIAGNOSTICS started_rows = ROW_COUNT;
  UPDATE app.attempts SET state='result_available' WHERE state='completed';
  GET DIAGNOSTICS completed_rows = ROW_COUNT;
  WITH appended AS (
    INSERT INTO app.validity_assertions(
      id,learner_scope_id,observation_id,prior_assertion_id,state,affected_scope,unaffected_scope,
      reason_registry_id,reason_code,asserted_owner,actor_ref,evidence_ref,effective_at,release)
    SELECT gen_random_uuid(),o.learner_scope_id,o.id,o.current_assertion_id,'not_counted',
           o.supported_scope,'[]'::jsonb,'reason-registry/v1.1','VALIDITY.RESPONSE_STRUCTURALLY_INVALID',
           'Evidence & Capability','migration:20260901_052_attempt_runtime',
           'migration:20260901_052_attempt_runtime',transaction_timestamp(),'evidence-contract/v1'
      FROM app.evidence_observations o
      JOIN app.attempts a ON a.learner_scope_id=o.learner_scope_id AND a.id=o.attempt_id
     WHERE a.state='not_counted'
    RETURNING id,learner_scope_id,observation_id)
  UPDATE app.evidence_observations o SET current_assertion_id=appended.id
    FROM appended WHERE o.learner_scope_id=appended.learner_scope_id AND o.id=appended.observation_id;
  UPDATE app.attempts SET state='interrupted' WHERE state='not_counted';
  GET DIAGNOSTICS not_counted_rows = ROW_COUNT;
  RAISE NOTICE 'attempt state reconciliation: started->in_progress %, completed->result_available %, not_counted->interrupted %',
    started_rows, completed_rows, not_counted_rows;
END $do$;
ALTER TABLE app.attempts ADD CONSTRAINT attempts_state_check CHECK(state IN (
  'acquiring_manifest','ready','in_progress','checkpointed','submission_unknown','submitted',
  'scoring','interpreting_evidence','result_available','interrupted','unavailable'));
CREATE TABLE app.serving_manifests (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  operation_id uuid NOT NULL, form_id uuid REFERENCES app.content_forms(id),
  content_class text NOT NULL CHECK(content_class IN ('C0','C1','C2','C3','C4')),
  approval_role text NOT NULL CHECK(approval_role IN ('draft','quarantine','training','independent_b1','readiness_p4','gold','retired')),
  key_revision_digests jsonb NOT NULL, allowed_conditions jsonb NOT NULL,
  learner_safe_payload_digest text NOT NULL CHECK(length(learner_safe_payload_digest)=64),
  freshness_decision text NOT NULL CHECK(freshness_decision IN ('fresh','exposed_review','not_independent','unavailable')),
  compared_family_refs jsonb NOT NULL, authorization_version text NOT NULL,
  content_release_identity text NOT NULL, issued_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
  revocation_state text NOT NULL CHECK(revocation_state IN ('active','revoked_before_start','revoked_after_pin')),
  digest text NOT NULL CHECK(length(digest)=64),
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id), CHECK(expires_at>issued_at)
);
CREATE INDEX serving_manifests_scope_expiry_idx ON app.serving_manifests(learner_scope_id,revocation_state,expires_at);
CREATE TABLE app.serving_manifest_entries (
  serving_manifest_id uuid NOT NULL, learner_scope_id uuid NOT NULL, ordinal integer NOT NULL CHECK(ordinal>0),
  content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  content_item_id uuid REFERENCES app.content_items(id),
  media_revision_id uuid REFERENCES app.media_revisions(id),
  PRIMARY KEY(serving_manifest_id,ordinal),
  FOREIGN KEY(learner_scope_id,serving_manifest_id) REFERENCES app.serving_manifests(learner_scope_id,id),
  FOREIGN KEY(content_revision_id,content_item_id) REFERENCES app.content_items(content_revision_id,id)
);
ALTER TABLE app.attempts ADD COLUMN serving_manifest_id uuid,
  ADD CONSTRAINT attempts_serving_manifest_fk FOREIGN KEY(learner_scope_id,serving_manifest_id) REFERENCES app.serving_manifests(learner_scope_id,id);
CREATE TABLE app.attempt_submissions (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  attempt_id uuid NOT NULL, operation_id uuid NOT NULL, serving_manifest_id uuid NOT NULL,
  checkpoint_sequence bigint NOT NULL CHECK(checkpoint_sequence>=0), canonical_response jsonb NOT NULL,
  response_digest text NOT NULL CHECK(length(response_digest)=64), conditions jsonb NOT NULL,
  uncaptured_item_ids jsonb NOT NULL, form_and_key_versions jsonb NOT NULL,
  committed_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id), UNIQUE(learner_scope_id,attempt_id),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,serving_manifest_id) REFERENCES app.serving_manifests(learner_scope_id,id)
);
CREATE TRIGGER attempt_submissions_immutable BEFORE UPDATE OR DELETE ON app.attempt_submissions FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.objective_outcomes (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  submission_id uuid NOT NULL, attempt_id uuid NOT NULL, algorithm_version text NOT NULL,
  scoring_policy_ref text NOT NULL, form_and_key_versions jsonb NOT NULL, task_rollups jsonb NOT NULL,
  raw_official_conversion jsonb,
  supported_scope jsonb NOT NULL CHECK(jsonb_array_length(supported_scope)>0),
  structurally_invalid_scope jsonb NOT NULL, uncaptured_scope jsonb NOT NULL,
  checksum text NOT NULL CHECK(length(checksum)=64),
  scored_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(learner_scope_id,submission_id), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,submission_id) REFERENCES app.attempt_submissions(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id)
);
CREATE TRIGGER objective_outcomes_immutable BEFORE UPDATE OR DELETE ON app.objective_outcomes FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.objective_unit_outcomes (
  outcome_id uuid NOT NULL, learner_scope_id uuid NOT NULL,
  content_item_id uuid NOT NULL REFERENCES app.content_items(id),
  kind text NOT NULL CHECK(kind IN ('correct','incorrect','blank','structurally_invalid')),
  issue_code text, task_ref text NOT NULL, key_revision_id uuid NOT NULL REFERENCES app.key_revisions(id),
  PRIMARY KEY(outcome_id,content_item_id),
  FOREIGN KEY(learner_scope_id,outcome_id) REFERENCES app.objective_outcomes(learner_scope_id,id),
  CHECK(issue_code IS NULL OR kind='structurally_invalid')
);
CREATE TRIGGER objective_unit_outcomes_immutable BEFORE UPDATE OR DELETE ON app.objective_unit_outcomes FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.assistance_events (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  attempt_id uuid NOT NULL, operation_id uuid NOT NULL,
  kind text NOT NULL CHECK(kind IN ('instruction_example','vocabulary_preview','word_help','phrase_translation','sentence_explanation','full_translation','strategy_cue','evidence_location','answer_narrowing','accessibility_support')),
  state text NOT NULL CHECK(state IN ('offered','used')),
  phase text NOT NULL CHECK(phase IN ('before_response','during_response','after_submission','repair')),
  affected_scope jsonb NOT NULL, answer_bearing text NOT NULL CHECK(answer_bearing IN ('yes','no','uncertain')),
  tested_capability_effect text NOT NULL CHECK(tested_capability_effect IN ('equivalent','altering','unverified','not_applicable')),
  policy_version text NOT NULL, occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id)
);
CREATE TRIGGER assistance_events_immutable BEFORE UPDATE OR DELETE ON app.assistance_events FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.listening_plans (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  attempt_id uuid NOT NULL, serving_manifest_id uuid NOT NULL, form_id uuid REFERENCES app.content_forms(id),
  contract_major integer NOT NULL CHECK(contract_major=1), plan_version text NOT NULL,
  target_blueprint_version text NOT NULL,
  evidence_role text NOT NULL CHECK(evidence_role IN ('learning_practice','repair_check','independent_practice','mini_mock','section_mock','full_mock','booking_confirmation')),
  progression_profile text NOT NULL CHECK(progression_profile IN ('P0','P1','P2','P3','P4')),
  preflight_policy_ref text NOT NULL, playback_policy_ref text NOT NULL, timer_policy_ref text NOT NULL,
  issued_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
  revocation_state text NOT NULL CHECK(revocation_state IN ('active','revoked_before_start','revoked_after_pin')),
  UNIQUE(learner_scope_id,id), UNIQUE(learner_scope_id,attempt_id), CHECK(expires_at>issued_at),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,serving_manifest_id) REFERENCES app.serving_manifests(learner_scope_id,id)
);
CREATE TABLE app.listening_plan_occurrences (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL, listening_plan_id uuid NOT NULL,
  ordinal integer NOT NULL CHECK(ordinal>0), item_or_part_scope jsonb NOT NULL,
  candidate_media_revision_ids jsonb NOT NULL CHECK(jsonb_array_length(candidate_media_revision_ids)>0),
  allowed_play_count integer NOT NULL CHECK(allowed_play_count BETWEEN 1 AND 32),
  authored_speed_ratio numeric NOT NULL CHECK(authored_speed_ratio>0),
  seeking_allowed boolean NOT NULL, pause_allowed boolean NOT NULL,
  transcript_phase text NOT NULL CHECK(transcript_phase IN ('never','after_attempt','after_block')),
  response_window jsonb NOT NULL, UNIQUE(learner_scope_id,id), UNIQUE(listening_plan_id,ordinal),
  FOREIGN KEY(learner_scope_id,listening_plan_id) REFERENCES app.listening_plans(learner_scope_id,id)
);
CREATE TABLE app.playback_occurrences (
  occurrence_id uuid NOT NULL, learner_scope_id uuid NOT NULL, play_ordinal integer NOT NULL CHECK(play_ordinal>0),
  operation_id uuid NOT NULL, idempotency_hash text NOT NULL CHECK(length(idempotency_hash)=64),
  state text NOT NULL CHECK(state IN ('authorized','started','completed','failed')),
  media_revision_id uuid NOT NULL REFERENCES app.media_revisions(id),
  authorized_at timestamptz NOT NULL, started_at timestamptz, completed_at timestamptz,
  start_position_ms integer NOT NULL DEFAULT 0 CHECK(start_position_ms>=0),
  observed_end_position_ms integer CHECK(observed_end_position_ms IS NULL OR observed_end_position_ms>=0),
  visibility_changes integer NOT NULL DEFAULT 0 CHECK(visibility_changes>=0),
  stall_intervals jsonb NOT NULL DEFAULT '[]'::jsonb, output_or_device_change boolean NOT NULL DEFAULT false,
  learner_pause_ms integer, technical_pause_ms integer,
  speed_actual numeric CHECK(speed_actual IS NULL OR speed_actual>0),
  transcript_opened boolean NOT NULL DEFAULT false, help_used boolean NOT NULL DEFAULT false,
  fault_reason text, client_sequence bigint NOT NULL CHECK(client_sequence>=0), server_receipt text,
  PRIMARY KEY(occurrence_id,play_ordinal), UNIQUE(learner_scope_id,operation_id),
  FOREIGN KEY(learner_scope_id,occurrence_id) REFERENCES app.listening_plan_occurrences(learner_scope_id,id),
  CHECK(state<>'failed' OR fault_reason IS NOT NULL)
);
CREATE TABLE app.media_preflight_receipts (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  listening_plan_id uuid NOT NULL, operation_id uuid NOT NULL, policy_versions jsonb NOT NULL,
  candidate_media_revisions jsonb NOT NULL, verified_digest_and_length jsonb NOT NULL,
  decoded_or_loaded jsonb NOT NULL, local_retention_class text NOT NULL,
  output_probe_confirmed boolean NOT NULL, checkpoint_path_confirmed boolean NOT NULL,
  environment_change_counter integer NOT NULL DEFAULT 0 CHECK(environment_change_counter>=0),
  outcome text NOT NULL CHECK(outcome IN ('ready','retryable','unavailable_affected_activity')),
  issued_at timestamptz NOT NULL, expires_at timestamptz NOT NULL,
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id), CHECK(expires_at>issued_at),
  FOREIGN KEY(learner_scope_id,listening_plan_id) REFERENCES app.listening_plans(learner_scope_id,id)
);
CREATE TABLE app.content_exposure_index (
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  content_family_id uuid NOT NULL REFERENCES app.content_families(id),
  exposure_class text NOT NULL CHECK(exposure_class IN ('unseen','exposed_family','near_duplicate_family','answer_exposed')),
  last_trigger text NOT NULL CHECK(last_trigger IN ('learner_visible_stimulus','decisive_information','key_or_rationale','transcript','partner_private_content')),
  last_content_revision_id uuid REFERENCES app.content_revisions(id),
  occurrence_count bigint NOT NULL DEFAULT 1 CHECK(occurrence_count>0),
  first_exposed_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  last_exposed_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(learner_scope_id,content_family_id)
);
`;

const contentImpactSql = `
CREATE TABLE app.content_impact_assertions (
  id uuid PRIMARY KEY, incident_id text NOT NULL, owner_context text NOT NULL,
  actor_ref text NOT NULL, authorization_version text NOT NULL,
  cause_kind text NOT NULL CHECK(cause_kind IN ('content_defect','media_defect','evaluator_release','rubric_or_prompt_defect','rights_takedown','taxonomy_change','blueprint_change','timer_or_platform_fault','manual_correction')),
  impact_mode text NOT NULL CHECK(impact_mode IN ('serving_only','visibility_redaction','validity_change','target_mapping_change','reevaluation_required')),
  requested_validity text CHECK(requested_validity IS NULL OR requested_validity IN ('valid','partially_valid','pending','interrupted','not_counted')),
  selectors jsonb NOT NULL, declared_cardinality bigint NOT NULL CHECK(declared_cardinality>=0),
  affected_scope jsonb NOT NULL, unaffected_scope jsonb NOT NULL,
  reason_registry_id text NOT NULL, reason_code text NOT NULL, evidence_refs jsonb NOT NULL,
  policy_and_contract_versions jsonb NOT NULL, unknown_scope_superset jsonb, reviewed_policy_override_ref text,
  effective_at timestamptz NOT NULL, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  digest text NOT NULL UNIQUE CHECK(length(digest)=64),
  FOREIGN KEY(reason_registry_id,reason_code) REFERENCES app.reason_codes(registry_id,code),
  CHECK(impact_mode<>'serving_only' OR requested_validity IS NULL)
);
CREATE INDEX content_impact_assertions_incident_idx ON app.content_impact_assertions(incident_id,recorded_at DESC);
CREATE TRIGGER content_impact_assertions_immutable BEFORE UPDATE OR DELETE ON app.content_impact_assertions FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.content_impact_targets (
  impact_assertion_id uuid NOT NULL REFERENCES app.content_impact_assertions(id),
  learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id), observation_id uuid NOT NULL,
  assertion_id uuid, disposition text NOT NULL CHECK(disposition IN ('resolved','unresolved_superset')),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(impact_assertion_id,learner_scope_id,observation_id),
  FOREIGN KEY(learner_scope_id,observation_id) REFERENCES app.evidence_observations(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,assertion_id) REFERENCES app.validity_assertions(learner_scope_id,id)
);
CREATE TRIGGER content_impact_targets_immutable BEFORE UPDATE OR DELETE ON app.content_impact_targets FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TABLE app.content_defect_reports (
  id uuid PRIMARY KEY, learner_scope_id uuid NOT NULL REFERENCES app.learner_scopes(id),
  operation_id uuid NOT NULL, content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  content_item_id uuid REFERENCES app.content_items(id), attempt_id uuid,
  category text NOT NULL CHECK(category IN ('ambiguous_key','contradictory_stimulus','media_defect','accessibility_barrier','rights_concern','other')),
  note text CHECK(note IS NULL OR length(note)<=400),
  state text NOT NULL CHECK(state IN ('open','triaged','resolved','dismissed')),
  resolution_impact_assertion_id uuid REFERENCES app.content_impact_assertions(id),
  reported_at timestamptz NOT NULL, recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  UNIQUE(learner_scope_id,operation_id), UNIQUE(learner_scope_id,id),
  FOREIGN KEY(learner_scope_id,attempt_id) REFERENCES app.attempts(learner_scope_id,id),
  FOREIGN KEY(content_revision_id,content_item_id) REFERENCES app.content_items(content_revision_id,id)
);
CREATE INDEX content_defect_reports_state_idx ON app.content_defect_reports(state,reported_at DESC);
-- The job-kind widening is strictly additive: every Stage 03 kind stays accepted.
DO $do$
DECLARE target text;
BEGIN
  SELECT conname INTO target FROM pg_constraint
   WHERE conrelid='app.job_resources'::regclass AND contype='c'
     AND pg_get_constraintdef(oid) LIKE '%rights_reconcile_v1%';
  IF target IS NULL THEN RAISE EXCEPTION 'job kind constraint not found'; END IF;
  EXECUTE format('ALTER TABLE app.job_resources DROP CONSTRAINT %I', target);
END $do$;
ALTER TABLE app.job_resources ADD CONSTRAINT job_resources_kind_check CHECK(kind IN (
  'projection_rebuild_v1','outbox_dispatch_v1','rights_reconcile_v1',
  'content_publication_v1','content_impact_recompute_v1'));
`;

const stage05CompatibilitySql = `
INSERT INTO app.schema_revisions(revision,checksum) VALUES ('20260901_054_p05_content_runtime', repeat('0',64))
  ON CONFLICT (revision) DO NOTHING;
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
      throw new Error("App migrations are roll-forward only");
    },
  };
}

export const migrationSources = {
  "20260825_010_identity_release": identityAndReleaseSql,
  "20260825_020_learner_facts_evidence": learnerFactsSql,
  "20260825_030_jobs_audit_rights": jobsAuditRightsSql,
  [foundationRevision]: compatibilitySql,
  "20260901_051_content_graph": contentGraphSql,
  "20260901_052_attempt_runtime": attemptRuntimeSql,
  "20260901_053_content_impact": contentImpactSql,
  [stage05Revision]: stage05CompatibilitySql,
} as const;

export const migrationChecksums: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(migrationSources).map(([name, source]) => [name, checksum(source)]),
);

async function upsertSchemaRevisions(db: Kysely<unknown>): Promise<void> {
  for (const [revision, digest] of Object.entries(migrationChecksums)) {
    await sql`INSERT INTO app.schema_revisions(revision,checksum) VALUES (${revision},${digest})
      ON CONFLICT (revision) DO UPDATE SET checksum=EXCLUDED.checksum`.execute(db);
  }
}

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
    await upsertSchemaRevisions(db);
  }),
  // The `reason-registry/v1.1` release and its codes land HERE, not in the terminal source: the
  // `20260901_052` rewrite appends a validity assertion carrying the composite FK to
  // `app.reason_codes(registry_id,code)`, so the codes must already exist when 052 runs.
  "20260901_051_content_graph": immutableMigration(contentGraphSql, async (db) => {
    const digest = checksum(
      JSON.stringify({ release: reasonRegistryRelease, codes: reasonRegistryV1 }),
    );
    await sql`INSERT INTO app.reason_registry_releases(id,major,minor,digest)
      VALUES (${reasonRegistryRelease.id},${reasonRegistryRelease.major},${reasonRegistryRelease.minor},${digest})
      ON CONFLICT (id) DO NOTHING`.execute(db);
    for (const reason of reasonRegistryV1) {
      await sql`INSERT INTO app.reason_codes(registry_id,code,family,owner,learner_fault,template_key,retention_class)
        VALUES (${reasonRegistryRelease.id},${reason.code},${reason.code.split(".")[0]},${reason.owner},${reason.learnerFault},${reason.templateKey},${reason.retentionClass})
        ON CONFLICT (registry_id,code) DO NOTHING`.execute(db);
    }
  }),
  "20260901_052_attempt_runtime": immutableMigration(attemptRuntimeSql),
  "20260901_053_content_impact": immutableMigration(contentImpactSql),
  // Terminal compatibility source. It creates no relation and inserts no reason code; it records the
  // Stage 05 revision and re-upserts the WHOLE checksum map, because an existing Stage 03 database
  // never re-runs the P03 compatibility migration and `verifyMigrationChecksums` demands exact set
  // equality between `app.schema_revisions` and `migrationChecksums`.
  [stage05Revision]: immutableMigration(stage05CompatibilitySql, async (db) => {
    await upsertSchemaRevisions(db);
  }),
};
