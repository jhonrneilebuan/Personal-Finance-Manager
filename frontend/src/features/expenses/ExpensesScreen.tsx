import { Fragment, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Card, Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { TransactionRow } from '@/components/TransactionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { aiApi } from '@/services/ai.service';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';

const inputIcon = { title: 'store-outline', amount: 'cash-minus', category: 'shape-outline', description: 'note-text-outline' } as const;
const expenseFields = ['title', 'amount', 'category', 'description'] as const;

type ExpenseFormValues = {
  title: string;
  amount: string;
  category: string;
  description: string;
};

export function ExpensesScreen() {
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.expenses(), []));
  const markChanged = useFinanceStore((state) => state.markChanged);
  const [notice, setNotice] = useState('');
  const [aiReason, setAiReason] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { control, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ExpenseFormValues>({
    defaultValues: { title: '', amount: '', category: '', description: '' },
  });
  const titleValue = watch('title');
  const amountValue = watch('amount');
  const descriptionValue = watch('description');
  const totalExpenses = useMemo(() => data?.reduce((sum, item) => sum + Number(item.amount), 0) ?? 0, [data]);

  const suggestCategory = useCallback(async () => {
    const title = titleValue.trim();
    const amount = Number(amountValue);

    if (title.length < 2) {
      setNotice('Enter an expense title first');
      return;
    }

    try {
      setIsSuggesting(true);
      const suggestion = await aiApi.suggestExpenseCategory({
        title,
        amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
        description: descriptionValue.trim() || undefined,
      });
      const confidence = Math.round(suggestion.confidence * 100);
      setValue('category', suggestion.category, { shouldDirty: true, shouldValidate: true });
      setAiReason(`${suggestion.category} (${confidence}%): ${suggestion.reason}`);
      setNotice(`${suggestion.source === 'ai' ? 'AI' : 'PesoPilot'} suggested ${suggestion.category}`);
    } catch {
      setNotice('Unable to suggest a category');
    } finally {
      setIsSuggesting(false);
    }
  }, [amountValue, descriptionValue, setValue, titleValue]);

  const create = handleSubmit(async (values) => {
    const amount = Number(values.amount);
    if (!values.title.trim() || !values.category.trim() || !Number.isFinite(amount) || amount <= 0) {
      setNotice('Enter a valid expense title, category, and amount');
      return;
    }

    try {
      await financeApi.createExpense({
        title: values.title,
        amount,
        category: values.category,
        description: values.description,
        transactionDate: new Date().toISOString(),
      });
      reset();
      setAiReason('');
      await refresh();
      markChanged();
      setNotice('Expense saved');
    } catch {
      setNotice('Unable to save expense');
    }
  });

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <PageHeroCard
        icon="credit-card-minus-outline"
        title="Expenses"
        subtitle="Control where your money goes and keep spending visible."
        value={formatCurrency(totalExpenses)}
        caption={`${data?.length ?? 0} records`}
        color={palette.red}
      />
      <Card mode="elevated" style={styles.formCard}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="robot-outline" title="New Expense" subtitle="Use AI to suggest the best category before saving." color={palette.red} />
          {expenseFields.map((name) => (
            <Fragment key={name}>
              <Controller control={control} name={name} render={({ field: { value, onChange } }) => (
                <TextInput left={<TextInput.Icon icon={inputIcon[name]} />} mode="outlined" label={name[0].toUpperCase() + name.slice(1)} value={value} onChangeText={onChange} keyboardType={name === 'amount' ? 'numeric' : 'default'} />
              )} />
              {name === 'amount' ? (
                <>
                  <Button icon="robot-outline" mode="contained-tonal" loading={isSuggesting} disabled={isSuggesting || isSubmitting} onPress={suggestCategory}>
                    AI Suggest Category
                  </Button>
                  {aiReason ? <Text variant="bodySmall" style={styles.aiReason}>{aiReason}</Text> : null}
                </>
              ) : null}
            </Fragment>
          ))}
          <Button icon="plus-circle-outline" contentStyle={styles.button} mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={create}>Save Expense</Button>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={styles.listCard}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="history" title="Expense History" subtitle="Latest spending records" color={palette.red} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load expenses" message={error} /> : data?.length ? (
            data.map((item) => <TransactionRow key={item.id} title={item.title} subtitle={item.category} amount={Number(item.amount)} type="expense" />)
          ) : <StateView title="No expenses" message="Expenses you add will appear here." />}
        </Card.Content>
      </Card>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2400}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  aiReason: { color: palette.slate, lineHeight: 19 },
  button: { height: 48 },
  formCard: { borderRadius: 8 },
  formContent: { gap: 13, paddingVertical: 20 },
  listCard: { borderRadius: 8 },
  listContent: { gap: 10, paddingVertical: 20 },
});
