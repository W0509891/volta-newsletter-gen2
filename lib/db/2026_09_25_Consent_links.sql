CREATE TABLE IF NOT EXISTS do_not_feature (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  requested_at date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT do_not_feature_name_unique UNIQUE (name)
);

-- Repair tables created by the earlier draft of this migration, which declared
-- "updatedAt timestamptz DEFAULT timestamptz 'now'". That literal is folded to a
-- constant when the table is created, so every row got the same timestamp.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'do_not_feature'
      AND column_name = 'updatedat'
  ) THEN
    ALTER TABLE do_not_feature RENAME COLUMN updatedat TO updated_at;
  END IF;
END $$;

ALTER TABLE do_not_feature ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE do_not_feature ALTER COLUMN requested_at SET DEFAULT CURRENT_DATE;
