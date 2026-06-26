import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { BarChartCard } from '@/components/BarChartCard';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { StatCard } from '@/components/StatCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';

export function ReportsScreen() {
  const revision = useFinanceStore((state) => state.revision);
  const monthly = useAsyncData(useCallback(() => financeApi.monthlyReport(), [revision]));
  const category = useAsyncData(useCallback(() => financeApi.categoryReport(), [revision]));

  if (monthly.isLoading || category.isLoading) return <StateView loading message="Building reports" />;

  return (
    <Screen refreshing={monthly.isLoading || category.isLoading} onRefresh={() => { monthly.refresh(); category.refresh(); }}>
      <Text variant="titleLarge">Monthly Report</Text>
      {monthly.data ? (
        <View style={styles.grid}>
          <StatCard style={styles.stat} label="Income Breakdown" value={monthly.data.totalIncome} tone="income" />
          <StatCard style={styles.stat} label="Expense Breakdown" value={monthly.data.totalExpenses} tone="expense" />
          <StatCard style={styles.stat} label="Savings Overview" value={monthly.data.savings} tone="savings" />
        </View>
      ) : <StateView title="No monthly report" message={monthly.error ?? 'Report data is empty'} />}
      {category.data?.length ? (
        <BarChartCard title="Expense Breakdown" data={category.data.map((item) => ({ label: item.category, value: item.amount }))} />
      ) : (
        <Card mode="contained"><Card.Content><StateView title="No category data" message="Category charts appear after expenses are recorded." /></Card.Content></Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { flexBasis: '47%' },
});
