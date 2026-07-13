import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Chip, ProgressBar, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { MonthSelector } from '@/components/MonthSelector';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';

type AllowanceFormValues = {
  name: string;
  dailyAmount: string;
  spendingLimit: string;
  note: string;
};

const defaultWeekdays = [1, 2, 3, 4, 5];
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthStart = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const shiftMonth = (date: Date, delta: number) => new Date(date.getFullYear(), date.getMonth() + delta, 1);
const monthKey = (date: Date) => date.toISOString().slice(0, 7);
const formatMonth = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
const formatWeekdays = (weekdays: number[]) => weekdays.map((day) => weekdayLabels[day]).join(', ');

export function AllowanceScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const [selectedMonth, setSelectedMonth] = useState(() => monthStart());
  const [weekdays, setWeekdays] = useState(defaultWeekdays);
  const [notice, setNotice] = useState('');
  const summary = useAsyncData(useCallback(() => financeApi.allowanceSummary(monthKey(selectedMonth)), [revision, selectedMonth]));
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<AllowanceFormValues>({
    defaultValues: { name: 'School baon', dailyAmount: '', spendingLimit: '', note: '' },
  });

  const firstWeekday = useMemo(() => summary.data?.calendar[0] ? new Date(summary.data.calendar[0].date).getDay() : 0, [summary.data]);
  const savingsProgress = useMemo(() => {
    const target = summary.data?.projectedSavings ?? 0;
    return target > 0 ? Math.max(0, Math.min((summary.data?.actualSavingsToDate ?? 0) / target, 1)) : 0;
  }, [summary.data]);

  const toggleWeekday = (day: number) => {
    setWeekdays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort());
  };

  const create = handleSubmit(async (values) => {
    const dailyAmount = Number(values.dailyAmount);
    const spendingLimit = Number(values.spendingLimit || 0);

    if (!values.name.trim() || !Number.isFinite(dailyAmount) || dailyAmount <= 0 || spendingLimit < 0 || weekdays.length === 0) {
      setNotice('Enter baon amount and choose at least one weekday');
      return;
    }

    try {
      await financeApi.createAllowancePlan({
        name: values.name.trim(),
        month: selectedMonth.toISOString(),
        dailyAmount,
        spendingLimit,
        weekdays,
        note: values.note.trim() || null,
      });
      reset({ name: 'School baon', dailyAmount: '', spendingLimit: '', note: '' });
      setWeekdays(defaultWeekdays);
      await summary.refresh();
      markChanged();
      setNotice('Baon plan saved');
    } catch {
      setNotice('Unable to save baon plan');
    }
  });

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    },
  ];

  return (
    <Screen refreshing={summary.isLoading} onRefresh={summary.refresh}>
      <PageHeroCard
        icon="school-outline"
        title="Baon Planner"
        subtitle="Plan weekday allowance and let Tarsi estimate your monthly ipon."
        value={formatCurrency(summary.data?.projectedSavings ?? 0)}
        caption={`${summary.data?.allowanceDays ?? 0} baon days in ${formatMonth(selectedMonth)}`}
        color={palette.forest}
        mascot
      />

      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="calendar-month-outline" title="Monthly Baon Setup" subtitle="Set daily baon, spending cap, and active weekdays." color={palette.forest} />
          <MonthSelector
            title="Baon Month"
            monthLabel={formatMonth(selectedMonth)}
            caption={`${summary.data?.plans.length ?? 0} active plan${summary.data?.plans.length === 1 ? '' : 's'}`}
            color={palette.forest}
            onPrevious={() => setSelectedMonth((value) => shiftMonth(value, -1))}
            onNext={() => setSelectedMonth((value) => shiftMonth(value, 1))}
            onCurrent={() => setSelectedMonth(monthStart())}
          />

          {(['name', 'dailyAmount', 'spendingLimit', 'note'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label={name === 'dailyAmount' ? 'Daily Baon' : name === 'spendingLimit' ? 'Daily Spending Cap' : name[0].toUpperCase() + name.slice(1)}
                value={value}
                onChangeText={onChange}
                keyboardType={name === 'dailyAmount' || name === 'spendingLimit' ? 'numeric' : 'default'}
                left={<TextInput.Icon icon={name === 'dailyAmount' ? 'cash-plus' : name === 'spendingLimit' ? 'wallet-outline' : name === 'note' ? 'note-text-outline' : 'school-outline'} />}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}

          <View style={styles.weekdayWrap}>
            {weekdayLabels.map((label, index) => (
              <Chip key={label} selected={weekdays.includes(index)} onPress={() => toggleWeekday(index)} style={styles.weekdayChip}>
                {label}
              </Chip>
            ))}
          </View>

          <Button icon="content-save-outline" mode="contained" style={styles.saveButton} contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={create}>
            Save Baon Plan
          </Button>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="chart-line" title="Baon Projection" subtitle="Compares planned savings against current month progress." color={palette.forest} />
          {summary.isLoading ? <StateView loading /> : summary.error ? <StateView title="Unable to load baon planner" message={summary.error} /> : summary.data ? (
            <>
              <View style={styles.metricGrid}>
                <Metric label="Total baon" value={formatCurrency(summary.data.totalAllowance)} />
                <Metric label="Projected ipon" value={formatCurrency(summary.data.projectedSavings)} />
                <Metric label="Earned so far" value={formatCurrency(summary.data.earnedToDate)} />
                <Metric label="Actual left" value={formatCurrency(summary.data.actualSavingsToDate)} />
              </View>
              <View style={styles.progressBlock}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressTitle, { color: theme.colors.onSurface }]}>Savings pace</Text>
                  <Text style={[styles.progressTitle, { color: palette.forest }]}>{Math.round(savingsProgress * 100)}%</Text>
                </View>
                <ProgressBar progress={savingsProgress} color={palette.leaf} style={styles.progress} />
                <Text style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>
                  Planned saved to date: {formatCurrency(summary.data.plannedSavedToDate)}. Expenses recorded this month are subtracted from actual left.
                </Text>
              </View>
            </>
          ) : <StateView title="No baon summary" message="Create a baon plan to see projections." />}
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="clipboard-list-outline" title="Active Baon Plans" subtitle="Saved schedules for the selected month." color={palette.forest} />
          {summary.isLoading ? <StateView loading /> : summary.data?.plans.length ? (
            <View style={styles.planList}>
              {summary.data.plans.map((plan) => {
                const dailySavings = Math.max(Number(plan.dailyAmount) - Number(plan.spendingLimit), 0);
                return (
                  <View key={plan.id} style={[styles.planItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.planHeader}>
                      <View style={styles.planTitleGroup}>
                        <Text style={[styles.planTitle, { color: theme.colors.onSurface }]}>{plan.name}</Text>
                        <Text style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}>{formatWeekdays(plan.weekdays)}</Text>
                      </View>
                      <Text style={[styles.planAmount, { color: palette.forest }]}>{formatCurrency(Number(plan.dailyAmount))}</Text>
                    </View>
                    <View style={styles.planMetrics}>
                      <Chip icon="wallet-outline">Cap {formatCurrency(Number(plan.spendingLimit))}</Chip>
                      <Chip icon="piggy-bank-outline">Save {formatCurrency(dailySavings)}</Chip>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : <StateView title="No baon plans" message="Plans saved for this month will appear here." />}
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="calendar" title="Baon Calendar" subtitle="Green days have planned allowance." color={palette.forest} />
          <View style={styles.weekHeader}>
            {weekdayLabels.map((label) => <Text key={label} style={[styles.weekLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>)}
          </View>
          <View style={styles.calendarGrid}>
            {Array.from({ length: firstWeekday }).map((_, index) => <View key={`blank-${index}`} style={styles.dayCell} />)}
            {summary.data?.calendar.map((day) => {
              const date = new Date(day.date);
              return (
                <View
                  key={day.date}
                  style={[
                    styles.dayCell,
                    {
                      backgroundColor: day.hasAllowance ? `${palette.leaf}24` : theme.colors.surfaceVariant,
                      borderColor: day.isToday ? palette.forest : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.dayNumber, { color: theme.colors.onSurface }]}>{date.getDate()}</Text>
                  {day.hasAllowance ? <Text style={[styles.dayAmount, { color: palette.forest }]}>{formatCurrency(day.plannedSavings)}</Text> : null}
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2600}>{notice}</Snackbar>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.metric, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.metricLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContent: { height: 48 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  card: { borderRadius: 22, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  dayAmount: { fontSize: 9, fontWeight: '800' },
  dayCell: { alignItems: 'center', aspectRatio: 0.88, borderRadius: 12, borderWidth: 1.5, justifyContent: 'center', width: '13.45%' },
  dayNumber: { fontSize: 12, fontWeight: '900' },
  formContent: { gap: 14, paddingVertical: 18 },
  helperText: { fontSize: 12, lineHeight: 17, opacity: 0.75 },
  listContent: { gap: 12, paddingVertical: 18 },
  metric: { borderRadius: 18, flexBasis: '47%', flexGrow: 1, gap: 4, padding: 14 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  metricValue: { fontSize: 16, fontWeight: '900' },
  planAmount: { fontSize: 16, fontWeight: '900' },
  planHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  planItem: { borderRadius: 18, gap: 12, padding: 14 },
  planList: { gap: 10 },
  planMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  planTitle: { fontSize: 16, fontWeight: '900' },
  planTitleGroup: { flex: 1, gap: 2 },
  progress: { borderRadius: 4, height: 8 },
  progressBlock: { gap: 8 },
  progressHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  progressTitle: { fontSize: 14, fontWeight: '900' },
  saveButton: { backgroundColor: palette.forest, borderRadius: 16, marginTop: 6 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  weekLabel: { fontSize: 11, fontWeight: '900', textAlign: 'center', width: '13.45%' },
  weekdayChip: { flexGrow: 1 },
  weekdayWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
