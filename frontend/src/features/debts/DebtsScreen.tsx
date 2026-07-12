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

type DebtFormValues = {
  lender: string;
  totalAmount: string;
  paidAmount: string;
  minimumPayment: string;
  interestRate: string;
  dueDate: string;
  note: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export function DebtsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const { data, isLoading, error, refresh } = useAsyncData(useCallback(() => financeApi.debts(), [revision]));
  const [notice, setNotice] = useState('');
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<DebtFormValues>({
    defaultValues: { lender: '', totalAmount: '', paidAmount: '0', minimumPayment: '', interestRate: '', dueDate: '', note: '' },
  });

  const totals = useMemo(() => {
    const total = data?.reduce((sum, debt) => sum + Number(debt.totalAmount), 0) ?? 0;
    const paid = data?.reduce((sum, debt) => sum + Number(debt.paidAmount), 0) ?? 0;
    const remaining = Math.max(total - paid, 0);
    const progress = total > 0 ? Math.min(paid / total, 1) : 0;
    const nextDue = data?.filter((debt) => debt.dueDate).sort((a, b) => new Date(a.dueDate ?? '').getTime() - new Date(b.dueDate ?? '').getTime())[0];
    return { total, paid, remaining, progress, nextDue };
  }, [data]);

  const create = handleSubmit(async (values) => {
    const totalAmount = Number(values.totalAmount);
    const paidAmount = Number(values.paidAmount || 0);
    const minimumPayment = values.minimumPayment ? Number(values.minimumPayment) : null;
    const interestRate = values.interestRate ? Number(values.interestRate) : null;

    if (!values.lender.trim() || !Number.isFinite(totalAmount) || totalAmount <= 0 || paidAmount < 0) {
      setNotice('Enter a valid lender and debt amount');
      return;
    }

    try {
      await financeApi.createDebt({
        lender: values.lender.trim(),
        totalAmount,
        paidAmount,
        minimumPayment,
        interestRate,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        note: values.note.trim() || null,
      });
      reset({ lender: '', totalAmount: '', paidAmount: '0', minimumPayment: '', interestRate: '', dueDate: '', note: '' });
      await refresh();
      markChanged();
      setNotice('Debt saved');
    } catch {
      setNotice('Unable to save debt');
    }
  });

  const payMinimum = useCallback(async (id: string, amount?: number | null) => {
    const payment = Number(amount ?? 0);
    if (!Number.isFinite(payment) || payment <= 0) {
      setNotice('Set a minimum payment first');
      return;
    }

    try {
      await financeApi.payDebt(id, payment);
      await refresh();
      markChanged();
      setNotice(`Paid ${formatCurrency(payment)}`);
    } catch {
      setNotice('Unable to record debt payment');
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
        icon="credit-card-clock-outline"
        title="Debt Tracker"
        subtitle="Monitor balances, minimum payments, and payoff progress."
        value={formatCurrency(totals.remaining)}
        caption={`${formatCurrency(totals.paid)} paid`}
        color={palette.red}
      />

      <Card style={cardStyle}>
        <Card.Content style={styles.snapshotContent}>
          <SectionHeader icon="finance" title="Debt Snapshot" subtitle="See total pressure and payoff progress fast." color={palette.red} />
          <View style={styles.statGrid}>
            <FeatureStatCard icon="credit-card-clock-outline" label="Remaining" value={formatCurrency(totals.remaining)} helper="balance left" color={palette.red} />
            <FeatureStatCard icon="cash-check" label="Paid" value={formatCurrency(totals.paid)} helper={`${Math.round(totals.progress * 100)}% complete`} color={palette.green} />
            <FeatureStatCard icon="scale-balance" label="Total" value={formatCurrency(totals.total)} helper="all debts" color={palette.indigo} />
            <FeatureStatCard
              icon="calendar-alert"
              label="Next Due"
              value={totals.nextDue?.dueDate ? new Date(totals.nextDue.dueDate).toLocaleDateString() : 'None'}
              helper={totals.nextDue?.lender ?? 'no due date'}
              color={palette.orange}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="plus-circle-outline" title="New Debt" subtitle="Add loans, borrowed money, or installment balances." color={palette.red} />
          {(['lender', 'totalAmount', 'paidAmount', 'minimumPayment', 'interestRate', 'dueDate', 'note'] as const).map((name) => (
            <Controller key={name} control={control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label={name === 'totalAmount' ? 'Total Amount' : name === 'paidAmount' ? 'Paid So Far' : name === 'minimumPayment' ? 'Minimum Payment' : name === 'interestRate' ? 'Interest Rate %' : name === 'dueDate' ? 'Due Date (YYYY-MM-DD)' : name[0].toUpperCase() + name.slice(1)}
                value={value}
                onChangeText={onChange}
                placeholder={name === 'dueDate' ? todayIso() : undefined}
                keyboardType={['totalAmount', 'paidAmount', 'minimumPayment', 'interestRate'].includes(name) ? 'numeric' : 'default'}
                left={<TextInput.Icon icon={name.includes('Amount') || name.includes('Payment') ? 'cash' : name === 'dueDate' ? 'calendar-outline' : name === 'note' ? 'note-text-outline' : 'account-cash-outline'} />}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}
          <Button icon="content-save-outline" mode="contained" style={styles.saveButton} contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={create}>
            Save Debt
          </Button>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="chart-donut" title="Payoff Progress" subtitle="Record minimum payments from each debt card." color={palette.red} />
          {isLoading ? <StateView loading /> : error ? <StateView title="Unable to load debts" message={error} /> : data?.length ? (
            <View style={styles.list}>
              {data.map((debt) => {
                const total = Number(debt.totalAmount);
                const paid = Number(debt.paidAmount);
                const progress = total > 0 ? Math.min(paid / total, 1) : 0;
                const remaining = Math.max(total - paid, 0);
                return (
                  <View key={debt.id} style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemTitleGroup}>
                        <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{debt.lender}</Text>
                        <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                          Remaining {formatCurrency(remaining)}{debt.dueDate ? ` - Due ${new Date(debt.dueDate).toLocaleDateString()}` : ''}
                        </Text>
                      </View>
                      <Text style={[styles.itemAmount, { color: theme.colors.onSurface }]}>{Math.round(progress * 100)}%</Text>
                    </View>
                    <ProgressBar progress={progress} color={palette.red} style={styles.progress} />
                    <Button mode="contained-tonal" icon="cash-check" onPress={() => payMinimum(debt.id, debt.minimumPayment)}>
                      Pay minimum {debt.minimumPayment ? formatCurrency(Number(debt.minimumPayment)) : ''}
                    </Button>
                  </View>
                );
              })}
            </View>
          ) : <StateView title="No debts" message="Debt balances you add will appear here." />}
        </Card.Content>
      </Card>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2600}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttonContent: { height: 48 },
  card: { borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  formContent: { gap: 14, paddingVertical: 18 },
  item: { borderRadius: 14, gap: 12, padding: 14 },
  itemAmount: { fontSize: 16, fontWeight: '900' },
  itemHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  itemSubtitle: { fontSize: 12, fontWeight: '500', opacity: 0.72 },
  itemTitle: { fontSize: 16, fontWeight: '900' },
  itemTitleGroup: { flex: 1, gap: 2 },
  list: { gap: 10 },
  listContent: { gap: 12, paddingVertical: 18 },
  progress: { borderRadius: 4, height: 8 },
  saveButton: { backgroundColor: '#FF453A', borderRadius: 12, marginTop: 6 },
  snapshotContent: { gap: 12, paddingVertical: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
