import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button, Card, ProgressBar, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { AiInsightCard } from '@/components/AiInsightCard';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { aiApi } from '@/services/ai.service';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import type { AiFinanceInsight } from '@/types/ai';
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
  const [aiAdvice, setAiAdvice] = useState<AiFinanceInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.budgets(), [revision]));
  const dashboard = useAsyncData(useCallback(() => financeApi.dashboard(), [revision]));
  const { control, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { category: 'Food', limitAmount: '', month: currentMonthIso() },
  });
  const selectedMonth = useWatch({ control, name: 'month' });
  const totalBudget = useMemo(() => data?.reduce((sum, item) => sum + Number(item.limitAmount), 0) ?? 0, [data]);

  const generateBudgetAdvice = useCallback(async () => {
    try {
      setIsAiLoading(true);
      setAiAdvice(await aiApi.budgetAdvice());
    } catch {
      setNotice('Unable to generate budget advice');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

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

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    }
  ];

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
      <AiInsightCard
        title="AI Budget Coach"
        subtitle="Get advice on limits, overspending, and what to adjust next."
        buttonLabel="Analyze Budgets"
        icon="target-variant"
        color={palette.indigo}
        insight={aiAdvice}
        loading={isAiLoading}
        onGenerate={generateBudgetAdvice}
      />
      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="target-variant" title="New Budget" subtitle="Choose month, category, and spending limit." color={palette.indigo} />
          
          <View style={[styles.monthPicker, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Button 
              icon="chevron-left" 
              mode="text" 
              textColor={theme.colors.primary}
              onPress={() => setValue('month', shiftMonth(selectedMonth, -1))}
            >
              Prev
            </Button>
            <View style={styles.monthLabel}>
              <Text style={[styles.monthLabelText, { color: theme.colors.onSurfaceVariant }]}>Budget Month</Text>
              <Text style={[styles.monthText, { color: theme.colors.onSurface }]}>{formatMonth(selectedMonth)}</Text>
            </View>
            <Button 
              contentStyle={styles.nextMonthButton} 
              icon="chevron-right" 
              mode="text" 
              textColor={theme.colors.primary}
              onPress={() => setValue('month', shiftMonth(selectedMonth, 1))}
            >
              Next
            </Button>
          </View>

          {(['category', 'limitAmount'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput 
                left={<TextInput.Icon icon={inputIcon[name]} color="rgba(120,120,120,0.5)" />} 
                mode="outlined" 
                label={name === 'limitAmount' ? 'Limit Amount' : name[0].toUpperCase() + name.slice(1)} 
                value={value} 
                onChangeText={onChange} 
                keyboardType={name === 'limitAmount' ? 'numeric' : 'default'}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}
          <Button 
            icon="target-variant" 
            style={styles.saveButton}
            contentStyle={styles.buttonContent} 
            mode="contained" 
            loading={isSubmitting} 
            disabled={isSubmitting} 
            onPress={create}
          >
            Save Budget
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="chart-donut" title="Budget Progress" subtitle="Current month usage by category" color={palette.indigo} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load budgets" message={error} /> : data?.length ? (
            <View style={styles.budgetList}>
              {data.map((item) => {
                const spentAmount = dashboard.data?.budgetUsage.find((budget) => budget.category === item.category)?.spentAmount ?? 0;
                const progress = Math.min(spentAmount / Number(item.limitAmount), 1);
                return (
                  <View key={item.id} style={[styles.budgetItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.budgetMeta}>
                      <View style={styles.budgetTitleGroup}>
                        <Text style={[styles.budgetTitle, { color: theme.colors.onSurface }]}>{item.category}</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Spent {formatCurrency(spentAmount)}</Text>
                      </View>
                      <Text style={[styles.budgetLimitText, { color: theme.colors.onSurface }]}>{formatCurrency(Number(item.limitAmount))}</Text>
                    </View>
                    <ProgressBar progress={progress} color={progress >= 1 ? theme.colors.error : '#5E5CE6'} style={styles.progress} />
                  </View>
                );
              })}
            </View>
          ) : <StateView title="No budgets" message="Create budgets to track category limits." />}
        </Card.Content>
      </Card>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2800}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  budgetItem: { 
    borderRadius: 12, 
    gap: 10, 
    padding: 14 
  },
  budgetMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  budgetTitleGroup: { gap: 1 },
  budgetTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.1 },
  budgetLimitText: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  buttonContent: { height: 48 },
  saveButton: {
    backgroundColor: '#5E5CE6',
    borderRadius: 12,
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  card: { 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formContent: { gap: 14, paddingVertical: 18 },
  listContent: { gap: 12, paddingVertical: 18 },
  budgetList: { gap: 8 },
  monthLabel: { alignItems: 'center', flex: 1, gap: 1 },
  monthLabelText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', opacity: 0.6 },
  monthPicker: { 
    alignItems: 'center', 
    borderRadius: 12, 
    flexDirection: 'row', 
    gap: 4, 
    padding: 6 
  },
  monthText: { fontSize: 15, fontWeight: '800', textAlign: 'center', letterSpacing: -0.1 },
  nextMonthButton: { flexDirection: 'row-reverse' },
  progress: { borderRadius: 4, height: 8 },
  subtitle: { fontSize: 12, opacity: 0.6, fontWeight: '500' },
});

