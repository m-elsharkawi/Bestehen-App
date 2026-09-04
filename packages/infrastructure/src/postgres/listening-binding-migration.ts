/** Corrects only the overbroad 055 uniqueness rule; exact manifest tuples keep their primary key. */
export const listeningBindingSql = `
DO $do$
DECLARE target text;
BEGIN
  SELECT c.conname INTO target FROM pg_constraint c
   WHERE c.conrelid='app.content_item_media_bindings'::regclass AND c.contype='u'
     AND c.conname='content_item_media_bindings_content_revision_id_content_ite_key'
     AND (SELECT array_agg(a.attname::text ORDER BY k.ordinal)
       FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum,ordinal)
       JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.attnum)
       =ARRAY['content_revision_id','content_item_id','media_revision_id']::text[];
  IF target IS NULL THEN RAISE EXCEPTION 'expected legacy media binding uniqueness not found'; END IF;
  EXECUTE format('ALTER TABLE app.content_item_media_bindings DROP CONSTRAINT %I', target);
END $do$;
`;
