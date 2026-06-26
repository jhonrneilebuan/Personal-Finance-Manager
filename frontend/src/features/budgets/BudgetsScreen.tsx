import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, ProgressBar, Text, TextInput } from 'react-native-paper';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { formatCurrency } from '@/utils/currency';

const currentMonthIso = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

export function BudgetsScreen() {
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.budgets(), [revision]));
  const dashboard = useAsyncData(useCallback(() => financeApi.dashboard(), [revision]));
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { category: 'Food', limitAmount: '', month: currentMonthIso() },
  });

  const create = handleSubmit(async (values) => {
    await financeApi.createBudget({ category: values.category, limitAmount: Number(values.limitAmount), month: values.month });
    reset({ category: 'Food', limitAmount: '', month: currentMonthIso() });
    await Promise.all([refresh(), dashboard.refresh()]);
    markChanged();
  });

  return (
    <Screen refreshing={isLoading || dashboard.isLoading} onRefresh={() => { refresh(); dashboard.refresh(); }}>
      <Card mode="contained" style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <Text variant="titleLarge">Create Budget</Text>
          <Text style={styles.subtitle}>Set category limits for this month.</Text>
          {(['category', 'limitAmount', 'month'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput mode="outlined" label={name === 'limitAmount' ? 'Limit Amount' : name[0].toUpperCase() + name.slice(1)} value={value} onChangeText={onChange} keyboardType={name === 'limitAmount' ? 'numeric' : 'default'} />
            )} />
          ))}
          <Button icon="target" mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={create}>Save Budget</Button>
        </Card.Content>
      </Card>
      <Card mode="contained" style={styles.listCard}>
        <Card.Content style={styles.listContent}>
          <Text variant="titleMedium">Budget Progress</Text>
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load budgets" message={error} /> : data?.length ? data.map((item) => (
            <View key={item.id} style={styles.budgetItem}>
              <View style={styles.budgetMeta}>
                <Text variant="titleSmall">{item.category}</Text>
                <Text>{formatCurrency(Number(item.limitAmount))}</Text>
              </View>
              <ProgressBar progress={Math.min(((dashboard.data?.budgetUsage.find((budget) => budget.category === item.category)?.spentAmount ?? 0) / Number(item.limitAmount)), 1)} />
              <Text style={styles.subtitle}>
                Spent {formatCurrency(dashboard.data?.budgetUsage.find((budget) => budget.category === item.category)?.spentAmount ?? 0)}
              </Text>
            </View>
          )) : <StateView title="No budgets" message="Create budgets to track category limits." />}
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  budgetItem: { borderColor: 'rgba(120,120,120,0.25)', borderRadius: 8, borderWidth: 1, gap: 10, padding: 14 },
  budgetMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  formCard: { borderRadius: 8 },
  formContent: { gap: 12 },
  listCard: { borderRadius: 8 },
  listContent: { gap: 16 },
  subtitle: { opacity: 0.68 },
});
