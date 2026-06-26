import { useCallback } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { BarChartCard } from '@/components/BarChartCard';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { StatCard } from '@/components/StatCard';
import { TransactionRow } from '@/components/TransactionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { formatCurrency } from '@/utils/currency';

export function DashboardScreen() {
  const revision = useFinanceStore((state) => state.revision);
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const isWide = width >= 520;
  const load = useCallback(() => financeApi.dashboard(), [revision]);
  const { data, isLoading, error, refresh } = useAsyncData(load);

  if (isLoading) return <StateView loading message="Loading dashboard" />;
  if (error || !data) return <StateView title="Dashboard unavailable" message={error ?? 'No dashboard data'} actionLabel="Retry" onAction={refresh} />;

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <Card mode="contained" style={[styles.hero, { backgroundColor: theme.colors.primary }]}>
        <Card.Content style={styles.heroContent}>
          <View>
            <Text variant="labelLarge" style={styles.heroLabel}>Available Balance</Text>
            <Text variant="headlineLarge" style={styles.heroValue}>{formatCurrency(data.currentBalance)}</Text>
          </View>
          <Text style={styles.heroMeta}>Income {formatCurrency(data.totalIncome)} • Expenses {formatCurrency(data.totalExpenses)}</Text>
        </Card.Content>
      </Card>
      <View style={styles.grid}>
        <StatCard style={isWide ? styles.statWide : styles.statHalf} label="Monthly Income" value={data.totalIncome} tone="income" />
        <StatCard style={isWide ? styles.statWide : styles.statHalf} label="Monthly Expenses" value={data.totalExpenses} tone="expense" />
        <StatCard style={isWide ? styles.statWide : styles.statHalf} label="Monthly Savings" value={data.savings} tone="savings" />
        <StatCard style={isWide ? styles.statWide : styles.statHalf} label="Net Balance" value={data.currentBalance} />
      </View>
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">Quick Actions</Text>
          <View style={styles.actions}>
            <Button icon="plus" mode="contained" onPress={() => router.push('/(tabs)/expenses')}>Expense</Button>
            <Button icon="cash-plus" mode="outlined" onPress={() => router.push('/(tabs)/income')}>Income</Button>
            <Button icon="target" mode="outlined" onPress={() => router.push('/(tabs)/budgets')}>Budget</Button>
          </View>
        </Card.Content>
      </Card>
      <BarChartCard title="Expense by Category" data={data.expenseByCategory.map((item) => ({ label: item.category, value: item.amount }))} />
      <BarChartCard title="Budget Usage" data={data.budgetUsage.map((item) => ({ label: item.category, value: item.spentAmount }))} />
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.actions}>
          <Text variant="titleMedium">Recent Transactions</Text>
          {data.recentTransactions.length === 0 ? (
            <StateView title="No transactions yet" message="Create your first income or expense to begin tracking." />
          ) : (
            data.recentTransactions.map((item, index) => (
              <TransactionRow
                key={`${String(item.id)}-${index}`}
                title={String(item.title ?? item.source)}
                subtitle={String(item.category ?? item.type)}
                amount={Number(item.amount)}
                type={item.type === 'income' ? 'income' : 'expense'}
              />
            ))
          )}
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
  card: { borderRadius: 8 },
  cardContent: { gap: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  hero: { borderRadius: 8 },
  heroContent: { gap: 16, paddingVertical: 20 },
  heroLabel: { color: 'rgba(255,255,255,0.78)' },
  heroMeta: { color: 'rgba(255,255,255,0.78)' },
  heroValue: { color: '#FFFFFF', fontWeight: '700' },
  statHalf: { flexBasis: '47%' },
  statWide: { flexBasis: '23%' },
});
