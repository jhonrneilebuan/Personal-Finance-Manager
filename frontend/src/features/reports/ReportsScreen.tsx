import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from 'react-native-paper';
import { BarChartCard } from '@/components/BarChartCard';
import { CashflowGraphCard } from '@/components/CashflowGraphCard';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { StatCard } from '@/components/StatCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';

export function ReportsScreen() {
  const revision = useFinanceStore((state) => state.revision);
  const monthly = useAsyncData(useCallback(() => financeApi.monthlyReport(), [revision]));
  const category = useAsyncData(useCallback(() => financeApi.categoryReport(), [revision]));

  if (monthly.isLoading || category.isLoading) return <StateView loading message="Building reports" />;

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
        <Card mode="elevated" style={styles.emptyCard}><Card.Content><StateView title="No category data" message="Category charts appear after expenses are recorded." /></Card.Content></Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCard: { borderRadius: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { flexBasis: '47%' },
});
