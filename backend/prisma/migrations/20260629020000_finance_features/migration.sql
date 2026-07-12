CREATE TABLE "public"."SavingGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(12,2) NOT NULL,
    "currentAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavingGoal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."BillReminder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillReminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."RecurringTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "category" TEXT,
    "frequency" TEXT NOT NULL,
    "nextRunDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Debt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "interestRate" DECIMAL(5,2),
    "dueDate" TIMESTAMP(3),
    "minimumPayment" DECIMAL(12,2),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."AllowancePlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "dailyAmount" DECIMAL(12,2) NOT NULL,
    "spendingLimit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "weekdays" INTEGER[] NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowancePlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SavingGoal_userId_targetDate_idx" ON "public"."SavingGoal"("userId", "targetDate");
CREATE INDEX "BillReminder_userId_dueDate_idx" ON "public"."BillReminder"("userId", "dueDate");
CREATE INDEX "BillReminder_userId_isPaid_idx" ON "public"."BillReminder"("userId", "isPaid");
CREATE INDEX "RecurringTransaction_userId_nextRunDate_idx" ON "public"."RecurringTransaction"("userId", "nextRunDate");
CREATE INDEX "RecurringTransaction_userId_isActive_idx" ON "public"."RecurringTransaction"("userId", "isActive");
CREATE INDEX "Debt_userId_dueDate_idx" ON "public"."Debt"("userId", "dueDate");
CREATE INDEX "AllowancePlan_userId_month_idx" ON "public"."AllowancePlan"("userId", "month");

ALTER TABLE "public"."SavingGoal" ADD CONSTRAINT "SavingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."BillReminder" ADD CONSTRAINT "BillReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."Debt" ADD CONSTRAINT "Debt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."AllowancePlan" ADD CONSTRAINT "AllowancePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
