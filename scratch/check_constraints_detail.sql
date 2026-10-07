SELECT
    t.relname as table_name,
    c.conname as constraint_name,
    c.contype as constraint_type,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND t.relname IN ('jury_assignments', 'applications')
ORDER BY t.relname, c.contype, c.conname;
