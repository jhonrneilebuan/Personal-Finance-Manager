import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, ProgressBar, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
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

type GoalFormValues = {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  note: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export function GoalsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.goals(), [revision]));
  const [notice, setNotice] = useState('');
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<GoalFormValues>({
    defaultValues: { name: '', targetAmount: '', currentAmount: '0', targetDate: '', note: '' },
  });

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

    if (!values.name.trim() || !Number.isFinite(targetAmount) || targetAmount <= 0 || currentAmount < 0) {
      setNotice('Enter a valid goal name and target amount');
      return;
    }

    try {
      await financeApi.createGoal({
        name: values.name.trim(),
        targetAmount,
        currentAmount,
        targetDate: values.targetDate ? new Date(values.targetDate).toISOString() : null,
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
        subtitle="Track emergency funds, school needs, gadgets, and future plans."
        value={formatCurrency(totals.saved)}
        caption={`${formatCurrency(totals.target)} total target`}
        color={palette.blue}
      />

      <Card style={cardStyle}>
        <Card.Content style={styles.snapshotContent}>
          <SectionHeader icon="chart-box-outline" title="Savings Snapshot" subtitle="Fast view of your total progress." color={palette.blue} />
          <View style={styles.statGrid}>
            <FeatureStatCard icon="piggy-bank-outline" label="Saved" value={formatCurrency(totals.saved)} helper={`${Math.round(totals.progress * 100)}% complete`} color={palette.blue} />
            <FeatureStatCard icon="flag-checkered" label="Remaining" value={formatCurrency(totals.remaining)} helper="left to target" color={palette.indigo} />
            <FeatureStatCard icon="bullseye-arrow" label="Goals" value={String(data?.length ?? 0)} helper="active targets" color={palette.green} />
            <FeatureStatCard icon="calendar-star" label="Target" value={formatCurrency(totals.target)} helper="all goals" color={palette.orange} />
          </View>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="plus-circle-outline" title="New Goal" subtitle="Set a target and update progress whenever you save." color={palette.blue} />
          {(['name', 'targetAmount', 'currentAmount', 'targetDate', 'note'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label={name === 'targetAmount' ? 'Target Amount' : name === 'currentAmount' ? 'Saved So Far' : name === 'targetDate' ? 'Target Date (YYYY-MM-DD)' : name[0].toUpperCase() + name.slice(1)}
                value={value}
                onChangeText={onChange}
                placeholder={name === 'targetDate' ? todayIso() : undefined}
                keyboardType={name.includes('Amount') ? 'numeric' : 'default'}
                left={<TextInput.Icon icon={name === 'name' ? 'flag-outline' : name.includes('Amount') ? 'cash' : name === 'targetDate' ? 'calendar-outline' : 'note-text-outline'} />}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}
          <Button icon="content-save-outline" mode="contained" style={styles.saveButton} contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={create}>
            Save Goal
          </Button>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="chart-donut" title="Goal Progress" subtitle="Quickly add common contributions." color={palette.blue} />
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
                          {goal.targetDate ? `Target: ${new Date(goal.targetDate).toLocaleDateString()}` : 'No target date'} - Remaining {formatCurrency(Math.max(target - saved, 0))}
                        </Text>
                      </View>
                      <Text style={[styles.itemAmount, { color: palette.blue }]}>{Math.round(progress * 100)}%</Text>
                    </View>
                    <ProgressBar progress={progress} color={palette.blue} style={styles.progress} />
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
  buttonContent: { height: 48 },
  card: { borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  contributionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  formContent: { gap: 14, paddingVertical: 18 },
  item: { borderRadius: 14, gap: 12, padding: 14 },
  itemAmount: { fontSize: 16, fontWeight: '900' },
  itemHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  itemSubtitle: { fontSize: 12, fontWeight: '500', opacity: 0.7 },
  itemTitle: { fontSize: 16, fontWeight: '900' },
  itemTitleGroup: { flex: 1, gap: 2 },
  list: { gap: 10 },
  listContent: { gap: 12, paddingVertical: 18 },
  progress: { borderRadius: 4, height: 8 },
  saveButton: { backgroundColor: '#0A84FF', borderRadius: 12, marginTop: 6 },
  snapshotContent: { gap: 12, paddingVertical: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
