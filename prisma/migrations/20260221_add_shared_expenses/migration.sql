-- Add isShared flag to expenses
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "isShared" BOOLEAN NOT NULL DEFAULT false;

-- Create expense_allocations table for unit-level splits
CREATE TABLE IF NOT EXISTS "expense_allocations" (
  "id" TEXT NOT NULL,
  "expenseId" TEXT NOT NULL,
  "unitId" TEXT NOT NULL,
  "percentage" DOUBLE PRECISION NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "expense_allocations_pkey" PRIMARY KEY ("id")
);

-- Foreign key: allocation -> expense (cascade delete)
ALTER TABLE "expense_allocations" ADD CONSTRAINT "expense_allocations_expenseId_fkey"
  FOREIGN KEY ("expenseId") REFERENCES "expenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign key: allocation -> unit (cascade delete)
ALTER TABLE "expense_allocations" ADD CONSTRAINT "expense_allocations_unitId_fkey"
  FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
