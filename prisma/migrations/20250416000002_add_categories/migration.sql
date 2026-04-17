-- Create Categories table
CREATE TABLE IF NOT EXISTS "Categories" (
    "id"         BIGSERIAL    NOT NULL,
    "name"       TEXT         NOT NULL,
    "emoji"      TEXT         NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "Categories_pkey"     PRIMARY KEY ("id"),
    CONSTRAINT "Categories_name_key" UNIQUE ("name")
);

-- Seed default categories
INSERT INTO "Categories" ("name", "emoji") VALUES
  ('Food',               '🍔'),
  ('Drinks',             '🍹'),
  ('Groceries',          '🛒'),
  ('Transport',          '🚗'),
  ('Flights',            '✈️'),
  ('Accommodation',      '🏨'),
  ('Attractions',        '🎡'),
  ('Mortgage',           '🏠'),
  ('Utilities',          '💡'),
  ('Household Supplies', '🧹'),
  ('Entertainment',      '🎬'),
  ('Sports & Fitness',   '💪'),
  ('Wellness',           '💆'),
  ('Pets',               '🐾'),
  ('Gifts',              '🎁'),
  ('Health & Medical',   '🏥'),
  ('Subscriptions',      '📺'),
  ('Insurance',          '🛡️'),
  ('Electronics & Tech', '📱'),
  ('Education',          '🎓'),
  ('Business',           '💼'),
  ('General',            '📦')
ON CONFLICT ("name") DO NOTHING;

-- Add category_id to Expenses
ALTER TABLE "Expenses"
  ADD COLUMN IF NOT EXISTS "category_id" BIGINT
  REFERENCES "Categories"("id");
