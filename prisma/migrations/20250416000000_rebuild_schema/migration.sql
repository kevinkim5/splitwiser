-- Migration: Rebuild schema for Splitwiser
-- Adds Expenses, ExpenseSplits, Settlements tables
-- Updates Users.mobile from Int to String

-- Drop old tables that are no longer needed
DROP TABLE IF EXISTS "Transactions" CASCADE;

-- Update Users.mobile type from Int to String
ALTER TABLE "Users" ALTER COLUMN "mobile" TYPE TEXT USING "mobile"::TEXT;

-- Create Expenses table
CREATE TABLE IF NOT EXISTS "Expenses" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "group_id" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paid_by_id" UUID NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "split_type" TEXT NOT NULL DEFAULT 'equal',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Expenses_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id"),
    CONSTRAINT "Expenses_paid_by_id_fkey" FOREIGN KEY ("paid_by_id") REFERENCES "Users"("id")
);

-- Create ExpenseSplits table
CREATE TABLE IF NOT EXISTS "ExpenseSplits" (
    "id" BIGSERIAL NOT NULL,
    "expense_id" BIGINT NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    CONSTRAINT "ExpenseSplits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ExpenseSplits_expense_id_user_id_key" UNIQUE ("expense_id", "user_id"),
    CONSTRAINT "ExpenseSplits_expense_id_fkey" FOREIGN KEY ("expense_id") REFERENCES "Expenses"("id"),
    CONSTRAINT "ExpenseSplits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id")
);

-- Create Settlements table
CREATE TABLE IF NOT EXISTS "Settlements" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "group_id" BIGINT NOT NULL,
    "payer_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMPTZ(6) NOT NULL,
    "note" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    "deleted_at" TIMESTAMPTZ(6),
    CONSTRAINT "Settlements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Settlements_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id"),
    CONSTRAINT "Settlements_payer_id_fkey" FOREIGN KEY ("payer_id") REFERENCES "Users"("id"),
    CONSTRAINT "Settlements_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "Users"("id")
);
