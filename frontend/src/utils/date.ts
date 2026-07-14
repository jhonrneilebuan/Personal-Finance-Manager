const pad2 = (value: number) => String(value).padStart(2, '0');

export const startOfLocalMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

export const shiftLocalMonth = (date: Date, delta: number) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

export const formatLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const formatLocalMonthKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;

export const parseLocalDate = (value: string | Date) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
};

export const monthKeyToDate = (value: string) => {
  const [year, month] = value.slice(0, 7).split('-').map(Number);
  if (!year || !month) return startOfLocalMonth();
  return new Date(year, month - 1, 1);
};

export const shiftMonthKey = (value: string, delta: number) =>
  formatLocalDateKey(shiftLocalMonth(monthKeyToDate(value), delta));

