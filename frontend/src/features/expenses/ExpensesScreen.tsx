import { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Card, Button, Text, TextInput } from 'react-native-paper';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { TransactionRow } from '@/components/TransactionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';

export function ExpensesScreen() {
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.expenses(), []));
  const markChanged = useFinanceStore((state) => state.markChanged);
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { title: '', amount: '', category: 'Food', description: '' },
  });

  const create = handleSubmit(async (values) => {
    await financeApi.createExpense({
      title: values.title,
      amount: Number(values.amount),
      category: values.category,
      description: values.description,
      transactionDate: new Date().toISOString(),
    });
    reset();
    await refresh();
    markChanged();
  });

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <Card mode="contained" style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <Text variant="titleLarge">Create Expense</Text>
          <Text style={styles.subtitle}>Track spending as soon as it happens.</Text>
          {(['title', 'amount', 'category', 'description'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput mode="outlined" label={name[0].toUpperCase() + name.slice(1)} value={value} onChangeText={onChange} keyboardType={name === 'amount' ? 'numeric' : 'default'} />
            )} />
          ))}
          <Button icon="plus" mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={create}>Save Expense</Button>
        </Card.Content>
      </Card>
      <Card mode="contained" style={styles.listCard}>
        <Card.Content style={styles.listContent}>
          <Text variant="titleMedium">Expense History</Text>
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load expenses" message={error} /> : data?.length ? (
            data.map((item) => <TransactionRow key={item.id} title={item.title} subtitle={item.category} amount={Number(item.amount)} type="expense" />)
          ) : <StateView title="No expenses" message="Expenses you add will appear here." />}
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: { borderRadius: 8 },
  formContent: { gap: 12 },
  listCard: { borderRadius: 8 },
  listContent: { gap: 8 },
  subtitle: { opacity: 0.68 },
});
