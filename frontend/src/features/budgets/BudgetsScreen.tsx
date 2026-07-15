import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button, Card, ProgressBar, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { AiInsightCard } from '@/components/AiInsightCard';
import { MonthSelector } from '@/components/MonthSelector';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { aiApi } from '@/services/ai.service';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import type { AiBudgetRecommendation, AiFinanceInsight } from '@/types/ai';
import { formatCurrency } from '@/utils/currency';
import { formatLocalDateKey, monthKeyToDate, shiftMonthKey, startOfLocalMonth } from '@/utils/date';

const currentMonthKey = () => formatLocalDateKey(startOfLocalMonth());

const shiftMonth = (dateKey: string, delta: number) => shiftMonthKey(dateKey, delta);

const formatMonth = (dateKey: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(monthKeyToDate(dateKey));

const inputIcon = { category: 'shape-outline', limitAmount: 'wallet-outline' } as const;

export function BudgetsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const [notice, setNotice] = useState('');
  const [aiAdvice, setAiAdvice] = useState<AiFinanceInsight | null>(null);
  const [recommendation, setRecommendation] = useState<AiBudgetRecommendation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(false);
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.budgets(), [revision]));
  const dashboard = useAsyncData(useCallback(() => financeApi.dashboard(), [revision]));
  const { control, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: { category: 'Food', limitAmount: '', month: currentMonthKey() },
  });
  const selectedMonth = useWatch({ control, name: 'month' });
  const categorySpending = useAsyncData(useCallback(() => financeApi.categoryReport(selectedMonth?.slice(0, 7)), [revision, selectedMonth]));
  const selectedMonthKey = selectedMonth?.slice(0, 7);
  const selectedBudgets = useMemo(
    () => data?.filter((item) => item.month.slice(0, 7) === selectedMonthKey) ?? [],
    [data, selectedMonthKey],
  );
  const totalBudget = useMemo(() => selectedBudgets.reduce((sum, item) => sum + Number(item.limitAmount), 0), [selectedBudgets]);
  const spentByCategory = useMemo(
    () => new Map((categorySpending.data ?? []).map((item) => [item.category, Number(item.amount)])),
    [categorySpending.data],
  );

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

  const generateRecommendation = useCallback(async () => {
    try {
      setIsRecommendationLoading(true);
      setRecommendation(await aiApi.budgetRecommendation());
    } catch {
      setNotice('Unable to generate budget recommendation');
    } finally {
      setIsRecommendationLoading(false);
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
      reset({ category: 'Food', limitAmount: '', month: currentMonthKey() });
      await Promise.all([refresh(), dashboard.refresh(), categorySpending.refresh()]);
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
    <Screen refreshing={isLoading || dashboard.isLoading || categorySpending.isLoading} onRefresh={() => { refresh(); dashboard.refresh(); categorySpending.refresh(); }}>
      <PageHeroCard
        icon="target-variant"
        title="Budgets"
        subtitle="Set monthly guardrails and let Tarsi recommend smarter limits."
        value={formatCurrency(totalBudget)}
        caption={formatMonth(selectedMonth)}
        color={palette.forest}
        mascot
      />
      <AiInsightCard
        title="Tarsi Budget Coach"
        subtitle="Get advice on limits, overspending, and what to adjust next."
        buttonLabel="Analyze Budgets"
        icon="target-variant"
        color={palette.forest}
        insight={aiAdvice}
        loading={isAiLoading}
        onGenerate={generateBudgetAdvice}
      />
      <Card style={cardStyle}>
        <Card.Content style={styles.recommendationContent}>
          <SectionHeader icon="robot-excited-outline" title="AI Budget Recommendation" subtitle="Suggest limits and a savings target for the next month." color={palette.forest} />
          <Button
            icon="auto-fix"
            mode="contained-tonal"
            loading={isRecommendationLoading}
            disabled={isRecommendationLoading}
            onPress={generateRecommendation}
          >
            Suggest Next Limits
          </Button>
          {recommendation ? (
            <View style={styles.recommendationList}>
              <View style={[styles.savingsTarget, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text style={[styles.savingsTargetLabel, { color: theme.colors.onSurfaceVariant }]}>Savings target</Text>
                <Text style={[styles.savingsTargetValue, { color: palette.forest }]}>{formatCurrency(recommendation.savingsTarget)}</Text>
              </View>
              <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{recommendation.summary}</Text>
              {recommendation.recommendations.map((item) => (
                <View key={`${item.category}-${item.priority}`} style={[styles.recommendationItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={styles.budgetMeta}>
                    <Text style={[styles.budgetTitle, { color: theme.colors.onSurface }]}>{item.category}</Text>
                    <Text style={[styles.budgetLimitText, { color: palette.forest }]}>{formatCurrency(item.suggestedLimit)}</Text>
                  </View>
                  <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{item.priority.toUpperCase()} - {item.reason}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </Card.Content>
      </Card>
      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="target-variant" title="New Budget" subtitle="Choose month, category, and spending limit." color={palette.forest} />
          <MonthSelector
            title="Budget Month"
            monthLabel={formatMonth(selectedMonth)}
            caption={`${selectedBudgets.length} categories planned`}
            color={palette.forest}
            onPrevious={() => setValue('month', shiftMonth(selectedMonth, -1))}
            onNext={() => setValue('month', shiftMonth(selectedMonth, 1))}
            onCurrent={() => setValue('month', currentMonthKey())}
          />

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
          <SectionHeader icon="chart-donut" title="Budget Progress" subtitle="Current month usage by category" color={palette.forest} />
          {isLoading || categorySpending.isLoading ? <StateView loading /> : error ? <StateView title="Unable to load budgets" message={error} /> : selectedBudgets.length ? (
            <View style={styles.budgetList}>
              {selectedBudgets.map((item) => {
                const spentAmount = spentByCategory.get(item.category) ?? 0;
                const rawProgress = spentAmount / Number(item.limitAmount);
                const progress = Math.min(rawProgress, 1);
                const progressColor = rawProgress >= 1 ? theme.colors.error : rawProgress >= 0.85 ? palette.orange : palette.leaf;
                return (
                  <View key={item.id} style={[styles.budgetItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.budgetMeta}>
                      <View style={styles.budgetTitleGroup}>
                        <Text style={[styles.budgetTitle, { color: theme.colors.onSurface }]}>{item.category}</Text>
                        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Spent {formatCurrency(spentAmount)}</Text>
                      </View>
                      <Text style={[styles.budgetLimitText, { color: theme.colors.onSurface }]}>{formatCurrency(Number(item.limitAmount))}</Text>
                    </View>
                    <ProgressBar progress={progress} color={progressColor} style={styles.progress} />
                  </View>
                );
              })}
            </View>
          ) : <StateView title="No budgets this month" message="Create budgets for the selected month to track category limits." />}
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
    backgroundColor: palette.forest,
    borderRadius: 16,
    shadowColor: palette.forest,
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
  budgetList: { gap: 8 },
  recommendationContent: { gap: 12, paddingVertical: 18 },
  recommendationItem: { borderRadius: 18, gap: 6, padding: 12 },
  recommendationList: { gap: 10 },
  savingsTarget: { borderRadius: 20, gap: 3, padding: 14 },
  savingsTargetLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  savingsTargetValue: { fontSize: 22, fontWeight: '900' },
  progress: { borderRadius: 4, height: 8 },
  subtitle: { fontSize: 12, opacity: 0.6, fontWeight: '500' },
});
