import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button, Card, HelperText, ProgressBar, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { FeatureStatCard } from '@/components/FeatureStatCard';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { financeApi } from '@/services/finance.service';
import { useFinanceStore } from '@/store/finance.store';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';
import { formatLocalDateKey, parseLocalDate } from '@/utils/date';

type GoalFormValues = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  note: string;
};

const targetDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const todayIso = () => formatLocalDateKey(new Date());

const isValidDateKey = (value: string) => {
  if (!value.trim()) return true;
  if (!targetDatePattern.test(value.trim())) return false;
  const parsed = parseLocalDate(value.trim());
  return Number.isFinite(parsed.getTime()) && formatLocalDateKey(parsed) === value.trim();
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, date.getDate());

const formatTargetLabel = (value?: string | null) => {
  if (!value) return 'No target date';
  const parsed = parseLocalDate(value);
  if (!Number.isFinite(parsed.getTime())) return 'No target date';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getTargetDateInfo = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      isValid: true,
      label: 'No target date set',
      helper: 'Optional, but adding one makes the goal easier to track.',
    };
  }

  if (!isValidDateKey(trimmed)) {
    return {
      isValid: false,
      label: 'Invalid target date',
      helper: 'Use YYYY-MM-DD, for example 2026-12-31.',
    };
  }

  const target = parseLocalDate(trimmed);
  const today = parseLocalDate(todayIso());
  const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  const pace = daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} overdue`;

  return {
    isValid: true,
    label: formatTargetLabel(trimmed),
    helper: pace,
  };
};

export function GoalsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.goals(), [revision]));
  const [notice, setNotice] = useState('');
  const { control, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm<GoalFormValues>({
    defaultValues: { name: '', targetAmount: '', currentAmount: '0', targetDate: '', note: '' },
  });
  const targetDateValue = useWatch({ control, name: 'targetDate' }) ?? '';
  const targetDateInfo = useMemo(() => getTargetDateInfo(targetDateValue), [targetDateValue]);

  const totals = useMemo(() => {
    const target = data?.reduce((sum, goal) => sum + Number(goal.targetAmount), 0) ?? 0;
    const saved = data?.reduce((sum, goal) => sum + Number(goal.currentAmount), 0) ?? 0;
    const remaining = Math.max(target - saved, 0);
    const progress = target > 0 ? Math.min(saved / target, 1) : 0;
    return { target, saved, remaining, progress };
  }, [data]);

  const create = handleSubmit(async (values) => {
    const targetAmount = Number(values.targetAmount);
    const currentAmount = Number(values.currentAmount || 0);
    const targetDate = values.targetDate.trim();

    if (!values.name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0 || currentAmount < 0) {
      setNotice('Enter a valid goal name and target amount');
      return;
    }

    if (targetDate && !isValidDateKey(targetDate)) {
      setNotice('Enter target date as YYYY-MM-DD');
      return;
    }

    try {
      await financeApi.createGoal({
        name: values.name.trim(),
        targetAmount,
        currentAmount,
        targetDate: targetDate ? parseLocalDate(targetDate).toISOString() : null,
        note: values.note.trim() || null,
      });
      reset({ name: '', targetAmount: '', currentAmount: '0', targetDate: '', note: '' });
      await refresh();
      markChanged();
      setNotice('Savings goal saved');
    } catch {
      setNotice('Unable to save savings goal');
    }
  });

  const setPresetTargetDate = useCallback((months: number) => {
    setValue('targetDate', formatLocalDateKey(addMonths(new Date(), months)), { shouldDirty: true });
  }, [setValue]);

  const contribute = useCallback(async (id: string, amount: number) => {
    try {
      await financeApi.contributeGoal(id, amount);
      await refresh();
      markChanged();
      setNotice(`Added ${formatCurrency(amount)} to goal`);
    } catch {
      setNotice('Unable to add contribution');
    }
  }, [markChanged, refresh]);

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    },
  ];

  return (
    <Screen refreshing={isLoading} onRefresh={refresh}>
      <PageHeroCard
        icon="bullseye-arrow"
        title="Savings Goals"
        subtitle="Let PisoPilot AI help you turn small savings into clear targets."
        value={formatCurrency(totals.saved)}
        caption={`${formatCurrency(totals.target)} total target`}
        color={palette.forest}
        mascot
      />

      <Card style={cardStyle}>
        <Card.Content style={styles.snapshotContent}>
          <SectionHeader icon="chart-box-outline" title="Savings Snapshot" subtitle="Fast view of your total progress." color={palette.forest} />
          <View style={styles.statGrid}>
            <FeatureStatCard icon="piggy-bank-outline" label="Saved" value={formatCurrency(totals.saved)} helper={`${Math.round(totals.progress * 100)}% complete`} color={palette.forest} />
            <FeatureStatCard icon="flag-checkered" label="Remaining" value={formatCurrency(totals.remaining)} helper="left to target" color={palette.leaf} />
            <FeatureStatCard icon="bullseye-arrow" label="Goals" value={String(data?.length ?? 0)} helper="active targets" color={palette.green} />
            <FeatureStatCard icon="calendar-star" label="Target" value={formatCurrency(totals.target)} helper="all goals" color={palette.orange} />
          </View>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="plus-circle-outline" title="New Goal" subtitle="Set a target and update progress whenever you save." color={palette.forest} />
          <Controller control={control} name="name" render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Goal Name"
              value={value}
              onChangeText={onChange}
              placeholder="Emergency fund, laptop, tuition..."
              left={<TextInput.Icon icon="flag-outline" />}
              theme={{ roundness: 12 }}
            />
          )} />
          <View style={styles.amountGrid}>
            <Controller control={control} name="targetAmount" render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label="Target Amount"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                left={<TextInput.Icon icon="bullseye-arrow" />}
                style={styles.amountInput}
                theme={{ roundness: 12 }}
              />
            )} />
            <Controller control={control} name="currentAmount" render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label="Saved So Far"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                left={<TextInput.Icon icon="piggy-bank-outline" />}
                style={styles.amountInput}
                theme={{ roundness: 12 }}
              />
            )} />
          </View>
          <View style={[styles.targetDatePanel, { backgroundColor: theme.colors.surfaceVariant, borderColor: targetDateInfo.isValid ? theme.colors.outlineVariant : theme.colors.error }]}>
            <View style={styles.targetDateHeader}>
              <View style={[styles.targetDateIcon, { backgroundColor: `${palette.forest}16` }]}>
                <Text style={[styles.targetDateIconText, { color: palette.forest }]}>31</Text>
              </View>
              <View style={styles.targetDateCopy}>
                <Text style={[styles.targetDateTitle, { color: theme.colors.onSurface }]}>Target Date</Text>
                <Text style={[styles.targetDateSubtitle, { color: theme.colors.onSurfaceVariant }]}>Set when you want this goal completed.</Text>
              </View>
            </View>
            <Controller control={control} name="targetDate" render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                placeholder={todayIso()}
                keyboardType="numbers-and-punctuation"
                left={<TextInput.Icon icon="calendar-outline" />}
                error={!targetDateInfo.isValid}
                theme={{ roundness: 12 }}
              />
            )} />
            <HelperText type={targetDateInfo.isValid ? 'info' : 'error'} visible style={styles.dateHelper}>
              {targetDateInfo.helper}
            </HelperText>
            <View style={styles.presetRow}>
              {[
                { label: '+1 month', months: 1 },
                { label: '+3 months', months: 3 },
                { label: '+6 months', months: 6 },
                { label: '+1 year', months: 12 },
              ].map((preset) => (
                <Button key={preset.label} mode="contained-tonal" compact onPress={() => setPresetTargetDate(preset.months)}>
                  {preset.label}
                </Button>
              ))}
            </View>
            <View style={[styles.datePreview, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.datePreviewLabel, { color: theme.colors.onSurfaceVariant }]}>Selected target</Text>
              <Text style={[styles.datePreviewValue, { color: targetDateInfo.isValid ? theme.colors.onSurface : theme.colors.error }]}>
                {targetDateInfo.label}
              </Text>
            </View>
          </View>
          <Controller control={control} name="note" render={({ field: { value, onChange } }) => (
            <TextInput
              mode="outlined"
              label="Note"
              value={value}
              onChangeText={onChange}
              placeholder="Optional reminder or purpose"
              left={<TextInput.Icon icon="note-text-outline" />}
              theme={{ roundness: 12 }}
            />
          )} />
          <Button icon="content-save-outline" mode="contained" style={styles.saveButton} contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={create}>
            Save Goal
          </Button>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="chart-donut" title="Goal Progress" subtitle="Quickly add common contributions." color={palette.forest} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load goals" message={error} /> : data?.length ? (
            <View style={styles.list}>
              {data.map((goal) => {
                const target = Number(goal.targetAmount);
                const saved = Number(goal.currentAmount);
                const progress = target > 0 ? Math.min(saved / target, 1) : 0;
                return (
                  <View key={goal.id} style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemTitleGroup}>
                        <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{goal.name}</Text>
                        <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                          {goal.targetDate ? `Target: ${formatTargetLabel(goal.targetDate)}` : 'No target date'} - Remaining {formatCurrency(Math.max(target - saved, 0))}
                        </Text>
                      </View>
                      <Text style={[styles.itemAmount, { color: palette.forest }]}>{Math.round(progress * 100)}%</Text>
                    </View>
                    <ProgressBar progress={progress} color={palette.leaf} style={styles.progress} />
                    <View style={styles.contributionRow}>
                      {[50, 100, 500].map((amount) => (
                        <Button key={amount} mode="contained-tonal" compact onPress={() => contribute(goal.id, amount)}>
                          +{formatCurrency(amount)}
                        </Button>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : <StateView title="No savings goals" message="Goals you add will appear here." />}
        </Card.Content>
      </Card>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2600}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountInput: { flexBasis: '47%', flexGrow: 1, minWidth: 150 },
  buttonContent: { height: 48 },
  card: { borderRadius: 22, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  contributionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateHelper: { marginHorizontal: 0, marginVertical: -4 },
  datePreview: { borderRadius: 14, gap: 2, padding: 12 },
  datePreviewLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  datePreviewValue: { fontSize: 16, fontWeight: '900' },
  formContent: { gap: 14, paddingVertical: 18 },
  item: { borderRadius: 18, gap: 12, padding: 14 },
  itemAmount: { fontSize: 16, fontWeight: '900' },
  itemHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  itemSubtitle: { fontSize: 12, fontWeight: '500', opacity: 0.7 },
  itemTitle: { fontSize: 16, fontWeight: '900' },
  itemTitleGroup: { flex: 1, gap: 2 },
  list: { gap: 10 },
  listContent: { gap: 12, paddingVertical: 18 },
  progress: { borderRadius: 4, height: 8 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  saveButton: { backgroundColor: palette.forest, borderRadius: 16, marginTop: 6 },
  snapshotContent: { gap: 12, paddingVertical: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  targetDateCopy: { flex: 1, gap: 2 },
  targetDateHeader: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  targetDateIcon: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  targetDateIconText: { fontSize: 15, fontWeight: '900' },
  targetDatePanel: { borderRadius: 18, borderWidth: 1, gap: 10, padding: 12 },
  targetDateSubtitle: { fontSize: 12, fontWeight: '600', opacity: 0.75 },
  targetDateTitle: { fontSize: 16, fontWeight: '900' },
});
