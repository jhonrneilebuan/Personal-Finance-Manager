import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { endOfMonth, formatDateKey, formatMonthKey, parseMonth } from '../utils/date';

const money = (value: Prisma.Decimal | number | null | undefined) => Number(value ?? 0);

const csvEscape = (value: string | number) => {
  const raw = String(value);
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
};

const escapePdfText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const createSimplePdf = (lines: string[]) => {
  const content = [
    'BT',
    '/F1 12 Tf',
    '16 TL',
    '50 760 Td',
    ...lines.slice(0, 34).map((line, index) => `${index === 0 ? '' : 'T* '}(${escapePdfText(line)}) Tj`),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  const offsets = [0];
  let pdf = '%PDF-1.4\n';
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf);
};

export const reportService = {
  async monthly(userId: string, month?: string) {
    const start = parseMonth(month);
    const end = endOfMonth(start);

    const [income, expenses, incomeCount, expenseCount] = await Promise.all([
      prisma.income.aggregate({
        where: { userId, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.expense.aggregate({
        where: { userId, transactionDate: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      prisma.income.count({ where: { userId, transactionDate: { gte: start, lte: end } } }),
      prisma.expense.count({ where: { userId, transactionDate: { gte: start, lte: end } } }),
    ]);

    const totalIncome = money(income._sum.amount);
    const totalExpenses = money(expenses._sum.amount);
    return {
      month: formatMonthKey(start),
      totalIncome,
      totalExpenses,
      savings: totalIncome - totalExpenses,
      transactionCount: incomeCount + expenseCount,
    };
  },

  async category(userId: string, month?: string) {
    const start = parseMonth(month);
    const end = endOfMonth(start);

    const grouped = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId, transactionDate: { gte: start, lte: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    });

    return grouped.map((item) => ({ category: item.category, amount: money(item._sum.amount) }));
  },

  async exportMonthly(userId: string, month?: string, format: 'csv' | 'pdf' = 'csv') {
    const start = parseMonth(month);
    const end = endOfMonth(start);
    const [monthly, categories, incomes, expenses] = await Promise.all([
      reportService.monthly(userId, month),
      reportService.category(userId, month),
      prisma.income.findMany({
        where: { userId, transactionDate: { gte: start, lte: end } },
        orderBy: { transactionDate: 'desc' },
      }),
      prisma.expense.findMany({
        where: { userId, transactionDate: { gte: start, lte: end } },
        orderBy: { transactionDate: 'desc' },
      }),
    ]);

    const baseName = `pesopilot-report-${monthly.month}`;
    const transactions = [
      ...expenses.map((item) => ({
        date: formatDateKey(item.transactionDate),
        type: 'Expense',
        category: item.category,
        account: 'Cash',
        note: item.description || item.title,
        amount: -money(item.amount),
      })),
      ...incomes.map((item) => ({
        date: formatDateKey(item.transactionDate),
        type: 'Income',
        category: item.source,
        account: 'Cash',
        note: item.description || item.source,
        amount: money(item.amount),
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    const lines = [
      'PesoPilot Monthly Report',
      `Month: ${monthly.month}`,
      `Total Income: PHP ${monthly.totalIncome.toFixed(2)}`,
      `Total Expenses: PHP ${monthly.totalExpenses.toFixed(2)}`,
      `Savings: PHP ${monthly.savings.toFixed(2)}`,
      '',
      'Expense Categories',
      ...categories.map((item) => `${item.category}: PHP ${item.amount.toFixed(2)}`),
      '',
      'Transactions',
      ...(transactions.length
        ? transactions.slice(0, 22).map((item) => `${item.date} | ${item.type} | ${item.category} | ${item.note} | PHP ${item.amount.toFixed(2)}`)
        : ['No transactions recorded for this month.']),
    ];

    if (format === 'pdf') {
      return {
        filename: `${baseName}.pdf`,
        contentType: 'application/pdf',
        body: createSimplePdf(lines),
      };
    }

    const rows = [
      ['Date', 'Type', 'Category', 'Account', 'Note', 'Amount'],
      ...transactions.map((item) => [item.date, item.type, item.category, item.account, item.note, item.amount]),
      [],
      ['Summary', 'Total Income', '', '', '', monthly.totalIncome],
      ['Summary', 'Total Expenses', '', '', '', monthly.totalExpenses],
      ['Summary', 'Net Flow', '', '', '', monthly.savings],
      ...categories.map((item) => ['Category', 'Expense', item.category, '', '', item.amount]),
    ];

    return {
      filename: `${baseName}.csv`,
      contentType: 'text/csv; charset=utf-8',
      body: Buffer.from(rows.map((row) => row.map(csvEscape).join(',')).join('\n')),
    };
  },
};
