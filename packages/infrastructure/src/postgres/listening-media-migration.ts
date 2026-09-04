/**
 * Additive Listening storage. Existing assets deliberately receive no synthetic manifests.
 * SQL verifies stored bytes and explicit identities; the media importer/read adapter must also
 * validate the complete manifest and canonical-json/v1 serialization before admission.
 */
export const listeningMediaSql = `
DO $do$
DECLARE target text;
BEGIN
  SELECT conname INTO target FROM pg_constraint
   WHERE conrelid='app.media_assets'::regclass AND contype='c'
     AND pg_get_constraintdef(oid) LIKE '%reviewed_tts%';
  IF target IS NULL THEN RAISE EXCEPTION 'media source role constraint not found'; END IF;
  EXECUTE format('ALTER TABLE app.media_assets DROP CONSTRAINT %I', target);
END $do$;
ALTER TABLE app.media_assets ADD CONSTRAINT media_assets_source_role_check CHECK(source_role IN (
  'reviewed_tts','audited_premium_tts','native_human','reusable_direct','authored_image',
  'deterministic_non_speech_fixture'));
CREATE TRIGGER media_revisions_immutable BEFORE UPDATE OR DELETE ON app.media_revisions
  FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
CREATE TRIGGER transcript_revisions_immutable BEFORE UPDATE OR DELETE ON app.transcript_revisions
  FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();

CREATE TABLE app.audio_asset_manifests (
  asset_id uuid NOT NULL REFERENCES app.media_assets(id),
  manifest_revision text NOT NULL CHECK(length(manifest_revision) BETWEEN 1 AND 160),
  content_revision_id uuid NOT NULL REFERENCES app.content_revisions(id),
  stimulus_id text NOT NULL CHECK(length(stimulus_id) BETWEEN 1 AND 160),
  canonicalization_version text NOT NULL CHECK(canonicalization_version='canonical-json/v1'),
  canonical_manifest text NOT NULL,
  manifest jsonb GENERATED ALWAYS AS (canonical_manifest::jsonb) STORED,
  digest text NOT NULL CHECK(digest ~ '^[a-f0-9]{64}$'),
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(asset_id,manifest_revision),
  UNIQUE(asset_id,manifest_revision,content_revision_id,stimulus_id),
  CHECK(digest=encode(sha256(convert_to(canonical_manifest,'UTF8')),'hex')),
  CHECK((jsonb_typeof(manifest)='object'
    AND manifest->>'assetId'=asset_id::text
    AND manifest->>'manifestRevision'=manifest_revision
    AND manifest->>'contentRevisionId'=content_revision_id::text
    AND manifest->>'stimulusId'=stimulus_id
    AND jsonb_typeof(manifest->'learnerMediaRevisions')='array'
    AND jsonb_array_length(manifest->'learnerMediaRevisions')>0) IS TRUE)
);
CREATE FUNCTION app.require_audio_manifest_scope() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM app.media_assets a JOIN app.content_revisions c ON c.family_id=a.content_family_id
    WHERE a.id=NEW.asset_id AND a.kind='audio' AND c.id=NEW.content_revision_id
  ) THEN RAISE EXCEPTION 'audio_manifest_scope_mismatch'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER audio_asset_manifests_scope BEFORE INSERT ON app.audio_asset_manifests
  FOR EACH ROW EXECUTE FUNCTION app.require_audio_manifest_scope();
CREATE TRIGGER audio_asset_manifests_immutable BEFORE UPDATE OR DELETE ON app.audio_asset_manifests
  FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();

ALTER TABLE app.media_revisions ADD CONSTRAINT media_revisions_asset_identity UNIQUE(asset_id,id);
CREATE TABLE app.audio_manifest_renditions (
  asset_id uuid NOT NULL, manifest_revision text NOT NULL, media_revision_id uuid NOT NULL,
  PRIMARY KEY(asset_id,manifest_revision,media_revision_id),
  FOREIGN KEY(asset_id,manifest_revision) REFERENCES app.audio_asset_manifests(asset_id,manifest_revision),
  FOREIGN KEY(asset_id,media_revision_id) REFERENCES app.media_revisions(asset_id,id)
);
CREATE FUNCTION app.require_manifest_rendition() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM app.audio_asset_manifests m
    WHERE m.asset_id=NEW.asset_id AND m.manifest_revision=NEW.manifest_revision
      AND m.manifest @> jsonb_build_object('learnerMediaRevisions',
        jsonb_build_array(jsonb_build_object('mediaRevisionId',NEW.media_revision_id::text)))
  ) THEN RAISE EXCEPTION 'rendition_not_in_exact_manifest'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER audio_manifest_renditions_membership BEFORE INSERT ON app.audio_manifest_renditions
  FOR EACH ROW EXECUTE FUNCTION app.require_manifest_rendition();
CREATE TRIGGER audio_manifest_renditions_immutable BEFORE UPDATE OR DELETE ON app.audio_manifest_renditions
  FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();

CREATE TABLE app.content_item_media_bindings (
  content_revision_id uuid NOT NULL, content_item_id uuid NOT NULL,
  stimulus_id text NOT NULL CHECK(length(stimulus_id) BETWEEN 1 AND 160),
  asset_id uuid NOT NULL, manifest_revision text NOT NULL, media_revision_id uuid NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(content_revision_id,content_item_id,stimulus_id,asset_id,manifest_revision,media_revision_id),
  UNIQUE(content_revision_id,content_item_id,media_revision_id),
  FOREIGN KEY(content_revision_id,content_item_id) REFERENCES app.content_items(content_revision_id,id),
  FOREIGN KEY(asset_id,manifest_revision,content_revision_id,stimulus_id)
    REFERENCES app.audio_asset_manifests(asset_id,manifest_revision,content_revision_id,stimulus_id),
  FOREIGN KEY(asset_id,manifest_revision,media_revision_id)
    REFERENCES app.audio_manifest_renditions(asset_id,manifest_revision,media_revision_id)
);
CREATE TRIGGER content_item_media_bindings_immutable BEFORE UPDATE OR DELETE ON app.content_item_media_bindings
  FOR EACH ROW EXECUTE FUNCTION app.reject_immutable_mutation();
`;
