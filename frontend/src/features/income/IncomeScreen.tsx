import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Snackbar, TextInput, useTheme } from 'react-native-paper';
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
const INCOME_ACCENT = palette.green;

export function IncomeScreen() {
  const theme = useTheme();
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

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    }
  ];

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <PageHeroCard
        icon="cash-plus"
        title="Income"
        subtitle="Track every money-in moment so PisoPilot AI can read your cashflow better."
        value={formatCurrency(totalIncome)}
        caption={`${data?.length ?? 0} records`}
        color={INCOME_ACCENT}
        mascot
      />
      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="cash-plus" title="New Income" subtitle="Add salary, freelance, business, baon, or other money in." color={INCOME_ACCENT} />
          {(['source', 'amount', 'description'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput 
                left={<TextInput.Icon icon={inputIcon[name]} color="rgba(120,120,120,0.5)" />} 
                mode="outlined" 
                label={name[0].toUpperCase() + name.slice(1)} 
                value={value} 
                onChangeText={onChange} 
                keyboardType={name === 'amount' ? 'numeric' : 'default'}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}
          <Button 
            icon="cash-plus" 
            style={styles.saveButton}
            contentStyle={styles.buttonContent} 
            mode="contained" 
            loading={isSubmitting} 
            disabled={isSubmitting} 
            onPress={create}
          >
            Save Income
          </Button>
        </Card.Content>
      </Card>
      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="history" title="Income History" subtitle="Latest money-in records" color={INCOME_ACCENT} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load income" message={error} /> : data?.length ? (
            <View style={styles.list}>
              {data.map((item) => <TransactionRow key={item.id} title={item.source} subtitle={item.description ?? 'Income'} amount={Number(item.amount)} type="income" />)}
            </View>
          ) : <StateView title="No income" message="Income records you add will appear here." />}
        </Card.Content>
      </Card>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2400}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonContent: { height: 48 },
  saveButton: {
    backgroundColor: INCOME_ACCENT,
    borderRadius: 16,
    shadowColor: INCOME_ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  card: { 
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formContent: { gap: 14, paddingVertical: 18 },
  listContent: { gap: 12, paddingVertical: 18 },
  list: { gap: 4 },
});
