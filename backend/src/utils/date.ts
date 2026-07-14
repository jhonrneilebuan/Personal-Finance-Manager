export const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

const pad2 = (value: number) => String(value).padStart(2, '0');

export const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatMonthKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

export const parseMonth = (value?: string) => {
  if (!value) return startOfMonth();
  const [year, month] = value.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) return startOfMonth();
  return new Date(year, month - 1, 1);
};
