CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "avatar" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "receiptImage" TEXT,
  "transactionDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Income" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "description" TEXT,
  "transactionDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Budget" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "limitAmount" DECIMAL(12,2) NOT NULL,
  "month" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Expense_userId_transactionDate_idx" ON "Expense"("userId", "transactionDate");
CREATE INDEX "Expense_userId_category_idx" ON "Expense"("userId", "category");
CREATE INDEX "Income_userId_transactionDate_idx" ON "Income"("userId", "transactionDate");
CREATE UNIQUE INDEX "Budget_userId_category_month_key" ON "Budget"("userId", "category", "month");
CREATE INDEX "Budget_userId_month_idx" ON "Budget"("userId", "month");

ALTER TABLE "Expense" ADD CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

