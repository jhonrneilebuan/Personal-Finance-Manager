import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, useTheme } from 'react-native-paper';
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
  const [exportPreview, setExportPreview] = useState('');
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
      if (format === 'csv' && typeof report === 'string') {
        setExportPreview(report.slice(0, 600));
      } else {
        setExportPreview('');
      }
      setNotice(`${format.toUpperCase()} report generated`);
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
        subtitle="Tarsi turns your month into clear cashflow, category, and savings patterns."
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
        subtitle="Let Tarsi explain what changed and what to adjust next."
        buttonLabel="Generate Summary"
        icon="chart-timeline-variant"
        color={palette.forest}
        insight={summary}
        loading={isAiLoading}
        onGenerate={generateMonthlySummary}
      />
      <Card style={cardStyle}>
        <Card.Content style={styles.exportContent}>
          <SectionHeader icon="file-export-outline" title="Export Report" subtitle="Generate CSV or PDF from the current month." color={palette.forest} />
          <View style={styles.exportButtons}>
            <Button icon="file-delimited-outline" mode="contained-tonal" loading={isExporting} disabled={isExporting} onPress={() => exportReport('csv')}>CSV</Button>
            <Button icon="file-pdf-box" mode="contained-tonal" loading={isExporting} disabled={isExporting} onPress={() => exportReport('pdf')}>PDF</Button>
          </View>
          {exportPreview ? (
            <View style={[styles.previewBox, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={[styles.previewText, { color: theme.colors.onSurfaceVariant }]}>{exportPreview}</Text>
            </View>
          ) : null}
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
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exportButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  exportContent: { gap: 12, paddingVertical: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  monthContent: { paddingVertical: 18 },
  previewBox: { borderRadius: 18, padding: 12 },
  previewText: { fontFamily: 'monospace', fontSize: 11, lineHeight: 16 },
  stat: { flexBasis: '47%' },
});
