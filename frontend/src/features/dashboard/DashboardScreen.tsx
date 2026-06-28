import { useCallback, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Snackbar, Text, useTheme } from 'react-native-paper';
import { Svg, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { AiInsightCard } from '@/components/AiInsightCard';
import { AiSpendingPlannerCard } from '@/components/AiSpendingPlannerCard';
import { BarChartCard } from '@/components/BarChartCard';
import { CashflowGraphCard } from '@/components/CashflowGraphCard';
import { Screen } from '@/components/Screen';
import { StateView } from '@/components/StateView';
import { StatCard } from '@/components/StatCard';
import { TransactionRow } from '@/components/TransactionRow';
import { useAsyncData } from '@/hooks/useAsyncData';
import { aiApi } from '@/services/ai.service';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import type { AiFinanceInsight } from '@/types/ai';
import { formatCurrency } from '@/utils/currency';


export function DashboardScreen() {
  const revision = useFinanceStore((state) => state.revision);
  const { width } = useWindowDimensions();
  const theme = useTheme();
  const isWide = width >= 560;
  const load = useCallback(() => financeApi.dashboard(), [revision]);
  const { data, isLoading, error, refresh } = useAsyncData(load);
  const [aiInsight, setAiInsight] = useState<AiFinanceInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const generateDashboardInsight = useCallback(async () => {
    try {
      setIsAiLoading(true);
      setAiInsight(await aiApi.dashboardInsight());
    } catch {
      setNotice('Unable to generate AI insight');
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  if (isLoading) return <StateView loading message="Loading dashboard" />;
  if (error || !data) return <StateView title="Dashboard unavailable" message={error ?? 'No dashboard data'} actionLabel="Retry" onAction={refresh} />;

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <Card style={styles.hero}>
        <View style={StyleSheet.absoluteFill}>
          <Svg height="100%" width="100%">
            <Defs>
              <LinearGradient id="dashHeroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#0A84FF" />
                <Stop offset="100%" stopColor="#0052B3" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#dashHeroGrad)" />
          </Svg>
        </View>
        <Card.Content style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View style={styles.heroTopRight}>
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons name="wallet-bifold-outline" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.heroTitle}>PesoPilot Wallet</Text>
                <Text style={styles.heroSubcopy}>Live financial snapshot</Text>
              </View>
            </View>
            <Text style={styles.heroPill}>Live</Text>
          </View>
          <View>
            <Text style={styles.heroLabel}>Available Balance</Text>
            <Text style={styles.heroValue}>{formatCurrency(data.currentBalance)}</Text>
          </View>
          <Text style={styles.heroMeta}>Income {formatCurrency(data.totalIncome)} / Expenses {formatCurrency(data.totalExpenses)}</Text>
        </Card.Content>
      </Card>
      
      <AiInsightCard
        title="AI Dashboard Coach"
        subtitle="Generate a quick read on balance, spending, and next actions."
        buttonLabel="Generate Insight"
        color={theme.colors.primary}
        insight={aiInsight}
        loading={isAiLoading}
        onGenerate={generateDashboardInsight}
      />
      <AiSpendingPlannerCard defaultAvailableMoney={Math.max(0, data.savings || data.currentBalance)} />
      <View style={styles.grid}>
        <StatCard icon="cash-plus" style={isWide ? styles.statWide : styles.statHalf} label="Monthly Income" value={data.totalIncome} tone="income" />
        <StatCard icon="credit-card-minus-outline" style={isWide ? styles.statWide : styles.statHalf} label="Monthly Expenses" value={data.totalExpenses} tone="expense" />
        <StatCard icon="piggy-bank-outline" style={isWide ? styles.statWide : styles.statHalf} label="Monthly Savings" value={data.savings} tone="savings" />
        <StatCard icon="wallet-outline" style={isWide ? styles.statWide : styles.statHalf} label="Net Balance" value={data.currentBalance} />
      </View>
      <CashflowGraphCard income={data.totalIncome} expenses={data.totalExpenses} savings={data.savings} />
      <BarChartCard title="Expense by Category" data={data.expenseByCategory.map((item) => ({ label: item.category, value: item.amount }))} />
      <BarChartCard title="Budget Usage" data={data.budgetUsage.map((item) => ({ label: item.category, value: item.spentAmount }))} />
      
      <Card 
        style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outlineVariant,
            borderWidth: theme.dark ? 1 : 0,
          }
        ]}
      >
        <Card.Content style={styles.cardContent}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.headerIcon, { backgroundColor: `${theme.colors.primary}12` }]}>
                <MaterialCommunityIcons name="history" color={theme.colors.primary} size={18} />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Recent Transactions</Text>
            </View>
          </View>
          {data.recentTransactions.length === 0 ? (
            <StateView title="No transactions yet" message="Create your first income or expense to begin tracking." />
          ) : (
            <View style={styles.list}>
              {data.recentTransactions.map((item, index) => (
                <TransactionRow
                  key={`${String(item.id)}-${index}`}
                  title={String(item.title ?? item.source)}
                  subtitle={String(item.category ?? item.type)}
                  amount={Number(item.amount)}
                  type={item.type === 'income' ? 'income' : 'expense'}
                />
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
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
  cardContent: { gap: 12, paddingVertical: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  hero: { 
    borderRadius: 20, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  heroContent: { gap: 16, padding: 20, zIndex: 1 },
  heroIcon: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, height: 44, justifyContent: 'center', width: 44 },
  heroLabel: { color: 'rgba(255,255,255,0.80)', fontSize: 13, fontWeight: '600' },
  heroMeta: { color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: 13 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 10, color: '#FFFFFF', fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6, fontSize: 12 },
  heroSubcopy: { color: 'rgba(255,255,255,0.72)', fontSize: 12 },
  heroTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16, letterSpacing: -0.2 },
  heroTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  heroTopRight: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  heroValue: { color: '#FFFFFF', fontWeight: '900', letterSpacing: -0.6, fontSize: 28, marginTop: 4 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  headerIcon: { alignItems: 'center', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  statHalf: { flexBasis: '47%' },
  statWide: { flexBasis: '23%' },
  list: { gap: 4 },
});
