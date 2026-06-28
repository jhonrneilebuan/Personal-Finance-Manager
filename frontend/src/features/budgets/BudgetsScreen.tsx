import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button, Card, ProgressBar, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';

const currentMonthIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

const shiftMonth = (isoDate: string, delta: number) => {
  const date = new Date(isoDate);
  return new Date(date.getFullYear(), date.getMonth() + delta, 1).toISOString();
};

const formatMonth = (isoDate: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(isoDate));

const inputIcon = { category: 'shape-outline', limitAmount: 'wallet-outline' } as const;

export function BudgetsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const [notice, setNotice] = useState('');
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.budgets(), [revision]));
  const dashboard = useAsyncData(useCallback(() => financeApi.dashboard(), [revision]));
  const { control, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { category: 'Food', limitAmount: '', month: currentMonthIso() },
  });
  const selectedMonth = useWatch({ control, name: 'month' });
  const totalBudget = useMemo(() => data?.reduce((sum, item) => sum + Number(item.limitAmount), 0) ?? 0, [data]);

  const create = handleSubmit(async (values) => {
    const limitAmount = Number(values.limitAmount);
    if (!values.category.trim() || !Number.isFinite(limitAmount) || limitAmount <= 0) {
      setNotice('Enter a valid budget category and limit');
      return;
    }

    try {
      await financeApi.createBudget({ category: values.category, limitAmount, month: values.month });
      reset({ category: 'Food', limitAmount: '', month: currentMonthIso() });
      await Promise.all([refresh(), dashboard.refresh()]);
      markChanged();
      setNotice('Budget saved');
    } catch {
      setNotice('Unable to save budget. Check if this category already has a budget for the month.');
    }
  });

  return (
    <Screen refreshing={isLoading || dashboard.isLoading} onRefresh={() => { refresh(); dashboard.refresh(); }}>
      <PageHeroCard
        icon="target-variant"
        title="Budgets"
        subtitle="Set monthly guardrails and compare limits against spending."
        value={formatCurrency(totalBudget)}
        caption={formatMonth(selectedMonth)}
        color={palette.indigo}
      />
      <Card mode="elevated" style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="target-variant" title="New Budget" subtitle="Choose month, category, and spending limit." color={palette.indigo} />
          <View style={styles.monthPicker}>
            <Button icon="chevron-left" mode="text" onPress={() => setValue('month', shiftMonth(selectedMonth, -1))}>Prev</Button>
            <View style={styles.monthLabel}>
              <Text variant="labelLarge" style={styles.subtitle}>Budget Month</Text>
              <Text variant="titleMedium" style={styles.monthText}>{formatMonth(selectedMonth)}</Text>
            </View>
            <Button contentStyle={styles.nextMonthButton} icon="chevron-right" mode="text" onPress={() => setValue('month', shiftMonth(selectedMonth, 1))}>Next</Button>
          </View>
          {(['category', 'limitAmount'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput left={<TextInput.Icon icon={inputIcon[name]} />} mode="outlined" label={name === 'limitAmount' ? 'Limit Amount' : name[0].toUpperCase() + name.slice(1)} value={value} onChangeText={onChange} keyboardType={name === 'limitAmount' ? 'numeric' : 'default'} />
            )} />
          ))}
          <Button icon="target-variant" contentStyle={styles.button} mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={create}>Save Budget</Button>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={styles.listCard}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="chart-donut" title="Budget Progress" subtitle="Current month usage by category" color={palette.indigo} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load budgets" message={error} /> : data?.length ? data.map((item) => {
            const spentAmount = dashboard.data?.budgetUsage.find((budget) => budget.category === item.category)?.spentAmount ?? 0;
            const progress = Math.min(spentAmount / Number(item.limitAmount), 1);
            return (
              <View key={item.id} style={[styles.budgetItem, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.budgetMeta}>
                  <View>
                    <Text variant="titleSmall" style={styles.budgetTitle}>{item.category}</Text>
                    <Text style={styles.subtitle}>Spent {formatCurrency(spentAmount)}</Text>
                  </View>
                  <Text variant="titleSmall">{formatCurrency(Number(item.limitAmount))}</Text>
                </View>
                <ProgressBar progress={progress} color={progress >= 1 ? theme.colors.error : theme.colors.primary} style={styles.progress} />
              </View>
            );
          }) : <StateView title="No budgets" message="Create budgets to track category limits." />}
        </Card.Content>
      </Card>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2800}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  budgetItem: { borderRadius: 8, gap: 12, padding: 16 },
  budgetMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  budgetTitle: { fontWeight: '800' },
  button: { height: 48 },
  formCard: { borderRadius: 8 },
  formContent: { gap: 13, paddingVertical: 20 },
  listCard: { borderRadius: 8 },
  listContent: { gap: 14, paddingVertical: 20 },
  monthLabel: { alignItems: 'center', flex: 1, gap: 2 },
  monthPicker: { alignItems: 'center', backgroundColor: 'rgba(120,120,120,0.08)', borderRadius: 8, flexDirection: 'row', gap: 4, padding: 8 },
  monthText: { fontWeight: '800', textAlign: 'center' },
  nextMonthButton: { flexDirection: 'row-reverse' },
  progress: { borderRadius: 8, height: 9 },
  subtitle: { opacity: 0.64 },
  title: { fontWeight: '800' },
});
