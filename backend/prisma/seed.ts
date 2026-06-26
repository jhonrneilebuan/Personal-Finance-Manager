import bcrypt from 'bcrypt';
import { prisma } from '../src/config/prisma';

async function main() {
  const password = await bcrypt.hash('Password123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@pesopilot.app' },
    update: {},
    create: {
      fullName: 'PesoPilot Demo',
      email: 'demo@pesopilot.app',
      password,
    },
  });

  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.income.deleteMany({ where: { userId: user.id } });
  await prisma.budget.deleteMany({ where: { userId: user.id } });

  const month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  await prisma.income.createMany({
    data: [
      { userId: user.id, source: 'Salary', amount: 65000, transactionDate: month },
      { userId: user.id, source: 'Freelance', amount: 12000, transactionDate: new Date() },
    ],
    skipDuplicates: true,
  });

  await prisma.expense.createMany({
    data: [
      { userId: user.id, title: 'Jollibee', amount: 350, category: 'Food', transactionDate: new Date() },
      { userId: user.id, title: 'Grab', amount: 180, category: 'Transportation', transactionDate: new Date() },
      { userId: user.id, title: 'Meralco', amount: 2500, category: 'Utilities', transactionDate: new Date() },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: 'Food', limitAmount: 12000, month },
      { userId: user.id, category: 'Transportation', limitAmount: 7000, month },
      { userId: user.id, category: 'Utilities', limitAmount: 6000, month },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
