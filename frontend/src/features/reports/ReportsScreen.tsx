import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Button, Card, Snackbar, Text, useTheme } from 'react-native-paper';
import { Svg, Circle } from 'react-native-svg';
import { AiInsightCard } from '@/components/AiInsightCard';
import { BarChartCard } from '@/components/BarChartCard';
import { CashflowGraphCard } from '@/components/CashflowGraphCard';
import { MonthSelector } from '@/components/MonthSelector';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { StatCard } from '@/components/StatCard';
import { useAsyncData } from '@/hooks/useAsyncData';
import { aiApi } from '@/services/ai.service';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import type { AiFinanceInsight } from '@/types/ai';
import { formatCurrency } from '@/utils/currency';
import { formatLocalMonthKey, shiftLocalMonth, startOfLocalMonth } from '@/utils/date';

const formatMonth = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);

export function ReportsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const [selectedMonth, setSelectedMonth] = useState(() => startOfLocalMonth());
  const selectedMonthKey = formatLocalMonthKey(selectedMonth);
  const monthly = useAsyncData(useCallback(() => financeApi.monthlyReport(selectedMonthKey), [revision, selectedMonthKey]));
  const category = useAsyncData(useCallback(() => financeApi.categoryReport(selectedMonthKey), [revision, selectedMonthKey]));
  const [summary, setSummary] = useState<AiFinanceInsight | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState('');

  const generateMonthlySummary = useCallback(async () => {
    try {
      setIsAiLoading(true);
      setSummary(await aiApi.monthlySummary(selectedMonthKey));
    } catch {
      setNotice('Unable to generate monthly summary');
    } finally {
      setIsAiLoading(false);
    }
  }, [selectedMonthKey]);

  const exportReport = useCallback(async (format: 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      const report = await financeApi.exportReport(format, selectedMonthKey);
      const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

      if (!directory) {
        throw new Error('No file directory available');
      }

      const fileUri = `${directory}${report.filename}`;
      await FileSystem.writeAsStringAsync(fileUri, report.base64, { encoding: FileSystem.EncodingType.Base64 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: report.contentType,
          dialogTitle: `Share ${format.toUpperCase()} report`,
        });
      }

      setNotice(`${format.toUpperCase()} report ready`);
    } catch {
      setNotice('Unable to export report');
    } finally {
      setIsExporting(false);
    }
  }, [selectedMonthKey]);

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
        subtitle="PisoPilot AI turns your month into clear cashflow, category, and savings patterns."
        value={formatCurrency(monthly.data?.savings ?? 0)}
        caption={formatMonth(selectedMonth)}
        color={palette.forest}
        mascot
      />
      <Card style={cardStyle}>
        <Card.Content style={styles.monthContent}>
          <MonthSelector
            title="Report Month"
            monthLabel={formatMonth(selectedMonth)}
            caption="Review cashflow, charts, exports, and AI summary"
            color={palette.forest}
            onPrevious={() => setSelectedMonth((value) => shiftLocalMonth(value, -1))}
            onNext={() => setSelectedMonth((value) => shiftLocalMonth(value, 1))}
            onCurrent={() => setSelectedMonth(startOfLocalMonth())}
          />
        </Card.Content>
      </Card>
      <AiInsightCard
        title="AI Monthly Summary"
        subtitle="Let PisoPilot AI explain what changed and what to adjust next."
        buttonLabel="Generate Summary"
        icon="chart-timeline-variant"
        color={palette.forest}
        insight={summary}
        loading={isAiLoading}
        onGenerate={generateMonthlySummary}
      />
      <Card style={cardStyle}>
        <Card.Content style={styles.exportContent}>
          <SectionHeader icon="file-export-outline" title="Export Report" subtitle="Generate and share the selected month as PDF or CSV." color={palette.forest} />
          <View style={styles.exportButtons}>
            <Button icon="file-pdf-box" mode="contained" loading={isExporting} disabled={isExporting} onPress={() => exportReport('pdf')}>Export PDF</Button>
            <Button icon="file-delimited-outline" mode="contained-tonal" loading={isExporting} disabled={isExporting} onPress={() => exportReport('csv')}>Export CSV</Button>
          </View>
        </Card.Content>
      </Card>
      {monthly.isLoading ? (
        <Card style={cardStyle}>
          <Card.Content>
            <StateView loading message="Building reports" />
          </Card.Content>
        </Card>
      ) : monthly.data ? (
        <>
          <CashflowGraphCard income={monthly.data.totalIncome} expenses={monthly.data.totalExpenses} savings={monthly.data.savings} />
          <View style={styles.grid}>
            <StatCard icon="cash-multiple" style={styles.stat} label="Income Breakdown" value={monthly.data.totalIncome} tone="income" />
            <StatCard icon="credit-card-minus-outline" style={styles.stat} label="Expense Breakdown" value={monthly.data.totalExpenses} tone="expense" />
            <StatCard icon="piggy-bank-outline" style={styles.stat} label="Savings Overview" value={monthly.data.savings} tone="savings" />
            <StatCard icon="format-list-numbered" style={styles.stat} label="Transactions" value={monthly.data.transactionCount} format="number" />
          </View>
        </>
      ) : <StateView title="No monthly report" message={monthly.error ?? 'Report data is empty'} />}
      {category.isLoading ? (
        <Card style={cardStyle}>
          <Card.Content>
            <StateView loading message="Loading category chart" />
          </Card.Content>
        </Card>
      ) : category.data?.length ? (
        <>
          <ExpenseDistributionCard data={category.data} />
          <BarChartCard title="Expense Breakdown" data={category.data.map((item) => ({ label: item.category, value: item.amount }))} />
        </>
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

function ExpenseDistributionCard({ data }: { data: Array<{ category: string; amount: number }> }) {
  const theme = useTheme();
  const total = data.reduce((sum, item) => sum + Number(item.amount), 0);
  const circumference = 2 * Math.PI * 44;
  const colors = [palette.forest, palette.leaf, palette.green, palette.orange, palette.pink, palette.teal];
  let offset = 0;
  const topCategory = data[0];
  const topPercent = total > 0 && topCategory ? Math.round((topCategory.amount / total) * 100) : 0;

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderWidth: theme.dark ? 1 : 0,
        },
      ]}
    >
      <Card.Content style={styles.distributionContent}>
        <SectionHeader icon="chart-donut" title="Expense Distribution" subtitle="Top categories for the selected month" color={palette.forest} />
        <View style={styles.distributionBody}>
          <View style={styles.donutWrap}>
            <Svg width={132} height={132} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="44" stroke={theme.colors.surfaceVariant} strokeWidth="18" fill="none" />
              {data.map((item, index) => {
                const length = total > 0 ? (item.amount / total) * circumference : 0;
                const dashOffset = -offset;
                offset += length;
                return (
                  <Circle
                    key={item.category}
                    cx="60"
                    cy="60"
                    r="44"
                    stroke={colors[index % colors.length]}
                    strokeWidth="18"
                    fill="none"
                    strokeDasharray={`${length} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                );
              })}
            </Svg>
            <View style={styles.donutCenter}>
              <Text style={[styles.donutPercent, { color: theme.colors.onSurface }]}>{topPercent}%</Text>
              <Text numberOfLines={1} style={[styles.donutLabel, { color: theme.colors.onSurfaceVariant }]}>{topCategory?.category ?? 'Top'}</Text>
            </View>
          </View>
          <View style={styles.legendList}>
            {data.slice(0, 6).map((item, index) => (
              <View key={item.category} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors[index % colors.length] }]} />
                <Text numberOfLines={1} style={[styles.legendText, { color: theme.colors.onSurface }]}>{item.category}</Text>
                <Text style={[styles.legendAmount, { color: theme.colors.onSurfaceVariant }]}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { 
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exportButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  exportContent: { gap: 12, paddingVertical: 18 },
  distributionBody: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  distributionContent: { gap: 16, paddingVertical: 18 },
  donutCenter: { alignItems: 'center', gap: 1, left: 0, position: 'absolute', right: 0, top: 46 },
  donutLabel: { fontSize: 11, fontWeight: '800', maxWidth: 78, opacity: 0.72, textAlign: 'center' },
  donutPercent: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  donutWrap: { alignItems: 'center', height: 132, justifyContent: 'center', width: 132 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendAmount: { fontSize: 12, fontWeight: '800' },
  legendDot: { borderRadius: 5, height: 10, width: 10 },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  legendList: { flex: 1, gap: 10, minWidth: 180 },
  legendText: { flex: 1, fontSize: 13, fontWeight: '800' },
  monthContent: { paddingVertical: 18 },
  stat: { flexBasis: '47%' },
});
