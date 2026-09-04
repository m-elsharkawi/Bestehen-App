/** A byte digest proves text integrity, not the identity of its rights/media/reveal metadata. */
export const transcriptLineageSql = `
DO $do$
DECLARE target text;
BEGIN
  SELECT c.conname INTO target FROM pg_constraint c
   WHERE c.conrelid='app.transcript_revisions'::regclass AND c.contype='u'
     AND c.conname='transcript_revisions_digest_key'
     AND (SELECT array_agg(a.attname::text ORDER BY k.ordinal)
       FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum,ordinal)
       JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.attnum)
       =ARRAY['digest']::text[];
  IF target IS NULL THEN RAISE EXCEPTION 'expected transcript byte digest uniqueness not found'; END IF;
  EXECUTE format('ALTER TABLE app.transcript_revisions DROP CONSTRAINT %I', target);
END $do$;
CREATE INDEX transcript_revisions_digest_idx ON app.transcript_revisions(digest);
`;
