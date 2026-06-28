import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Snackbar, useTheme } from 'react-native-paper';
import { AiInsightCard } from '@/components/AiInsightCard';
import { BarChartCard } from '@/components/BarChartCard';
import { CashflowGraphCard } from '@/components/CashflowGraphCard';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { StatCard } from '@/components/StatCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { aiApi } from '@/services/ai.service';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import type { AiFinanceInsight } from '@/types/ai';
import { formatCurrency } from '@/utils/currency';

export function ReportsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const monthly = useAsyncData(useCallback(() => financeApi.monthlyReport(), [revision]));
  const category = useAsyncData(useCallback(() => financeApi.categoryReport(), [revision]));
  const [summary, setSummary] = useState<AiFinanceInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const generateMonthlySummary = useCallback(async () => {
    try {
      setIsAiLoading(true);
      setSummary(await aiApi.monthlySummary());
    } catch {
      setNotice('Unable to generate monthly summary');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  if (monthly.isLoading || category.isLoading) return <StateView loading message="Building reports" />;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    }
  ];

  return (
    <Screen refreshing={monthly.isLoading || category.isLoading} onRefresh={() => { monthly.refresh(); category.refresh(); }}>
      <PageHeroCard
        icon="chart-areaspline"
        title="Reports"
        subtitle="Understand income, expenses, savings, and category trends."
        value={formatCurrency(monthly.data?.savings ?? 0)}
        caption="Monthly savings"
        color={palette.blue}
      />
      <AiInsightCard
        title="AI Monthly Summary"
        subtitle="Summarize this month and get practical next steps."
        buttonLabel="Generate Summary"
        icon="chart-timeline-variant"
        color={palette.blue}
        insight={summary}
        loading={isAiLoading}
        onGenerate={generateMonthlySummary}
      />
      {monthly.data ? (
        <>
          <CashflowGraphCard income={monthly.data.totalIncome} expenses={monthly.data.totalExpenses} savings={monthly.data.savings} />
          <View style={styles.grid}>
            <StatCard icon="cash-multiple" style={styles.stat} label="Income Breakdown" value={monthly.data.totalIncome} tone="income" />
            <StatCard icon="credit-card-minus-outline" style={styles.stat} label="Expense Breakdown" value={monthly.data.totalExpenses} tone="expense" />
            <StatCard icon="piggy-bank-outline" style={styles.stat} label="Savings Overview" value={monthly.data.savings} tone="savings" />
          </View>
        </>
      ) : <StateView title="No monthly report" message={monthly.error ?? 'Report data is empty'} />}
      {category.data?.length ? (
        <BarChartCard title="Expense Breakdown" data={category.data.map((item) => ({ label: item.category, value: item.amount }))} />
      ) : (
        <Card style={cardStyle}>
          <Card.Content>
            <StateView title="No category data" message="Category charts appear after expenses are recorded." />
          </Card.Content>
        </Card>
      )}
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2400}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { flexBasis: '47%' },
});

