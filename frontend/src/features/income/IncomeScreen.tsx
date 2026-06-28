import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Snackbar, TextInput } from 'react-native-paper';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { TransactionRow } from '@/components/TransactionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';

const inputIcon = { source: 'briefcase-outline', amount: 'cash-plus', description: 'note-text-outline' } as const;

export function IncomeScreen() {
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.income(), []));
  const markChanged = useFinanceStore((state) => state.markChanged);
  const [notice, setNotice] = useState('');
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { source: '', amount: '', description: '' },
  });
  const totalIncome = useMemo(() => data?.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0, [data]);

  const create = handleSubmit(async (values) => {
    const amount = Number(values.amount);
    if (!values.source.trim() || !Number.isFinite(amount) || amount <= 0) {
      setNotice('Enter a valid income source and amount');
      return;
    }

    try {
      await financeApi.createIncome({ source: values.source, amount, description: values.description, transactionDate: new Date().toISOString() });
      reset();
      await refresh();
      markChanged();
      setNotice('Income saved');
    } catch {
      setNotice('Unable to save income');
    }
  });

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <PageHeroCard
        icon="cash-plus"
        title="Income"
        subtitle="Record every source of money and watch cashflow improve."
        value={formatCurrency(totalIncome)}
        caption={`${data?.length ?? 0} records`}
        color={palette.green}
      />
      <Card mode="elevated" style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="cash-plus" title="New Income" subtitle="Add salary, freelance, business, or other money in." color={palette.green} />
          {(['source', 'amount', 'description'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput left={<TextInput.Icon icon={inputIcon[name]} />} mode="outlined" label={name[0].toUpperCase() + name.slice(1)} value={value} onChangeText={onChange} keyboardType={name === 'amount' ? 'numeric' : 'default'} />
            )} />
          ))}
          <Button icon="cash-plus" contentStyle={styles.button} mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={create}>Save Income</Button>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={styles.listCard}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="history" title="Income History" subtitle="Latest money-in records" color={palette.green} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load income" message={error} /> : data?.length ? (
            data.map((item) => <TransactionRow key={item.id} title={item.source} subtitle={item.description ?? 'Income'} amount={Number(item.amount)} type="income" />)
          ) : <StateView title="No income" message="Income records you add will appear here." />}
        </Card.Content>
      </Card>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2400}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { height: 48 },
  formCard: { borderRadius: 8 },
  formContent: { gap: 13, paddingVertical: 20 },
  listCard: { borderRadius: 8 },
  listContent: { gap: 10, paddingVertical: 20 },
});
