import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button, Card, Chip, SegmentedButtons, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
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

type BillFormValues = {
  name: string;
  amount: string;
  category: string;
  dueDate: string;
  note: string;
};

type RecurringFormValues = {
  title: string;
  amount: string;
  category: string;
  type: 'income' | 'expense';
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextRunDate: string;
  note: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const getBillStatus = (dueDate: string, isPaid: boolean) => {
  if (isPaid) {
    return { label: 'PAID', backgroundColor: '#D8F3DC', color: palette.forest };
  }

  const due = new Date(dueDate);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.ceil((startDue.getTime() - startToday.getTime()) / 86400000);

  if (days < 0) return { label: 'OVERDUE', backgroundColor: '#FFE2E0', color: palette.red };
  if (days === 0) return { label: 'DUE TODAY', backgroundColor: '#FFF3D8', color: palette.orange };
  return { label: `${days} DAYS LEFT`, backgroundColor: '#E6F4EA', color: palette.forest };
};

export function BillsScreen() {
  const theme = useTheme();
  const revision = useFinanceStore((state) => state.revision);
  const markChanged = useFinanceStore((state) => state.markChanged);
  const bills = useAsyncData(useCallback(() => financeApi.bills(), [revision]));
  const recurring = useAsyncData(useCallback(() => financeApi.recurring(), [revision]));
  const [notice, setNotice] = useState('');

  const billForm = useForm<BillFormValues>({
    defaultValues: { name: '', amount: '', category: 'Bills', dueDate: todayIso(), note: '' },
  });
  const recurringForm = useForm<RecurringFormValues>({
    defaultValues: { title: '', amount: '', category: 'Food', type: 'expense', frequency: 'monthly', nextRunDate: todayIso(), note: '' },
  });
  const recurringType = useWatch({ control: recurringForm.control, name: 'type' });
  const recurringFrequency = useWatch({ control: recurringForm.control, name: 'frequency' });

  const totals = useMemo(() => {
    const unpaid = bills.data?.filter((bill) => !bill.isPaid).reduce((sum, bill) => sum + Number(bill.amount), 0) ?? 0;
    const activeRecurring = recurring.data?.filter((item) => item.isActive).length ?? 0;
    const today = new Date();
    const overdue = bills.data?.filter((bill) => !bill.isPaid && new Date(bill.dueDate) < today).length ?? 0;
    const nextBill = bills.data?.filter((bill) => !bill.isPaid).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    return { unpaid, activeRecurring, overdue, nextBill };
  }, [bills.data, recurring.data]);

  const refreshAll = useCallback(async () => {
    await Promise.all([bills.refresh(), recurring.refresh()]);
  }, [bills, recurring]);

  const createBill = billForm.handleSubmit(async (values) => {
    const amount = Number(values.amount);
    if (!values.name.trim() || !Number.isFinite(amount) || amount <= 0 || !values.dueDate.trim()) {
      setNotice('Enter a valid bill name, amount, and due date');
      return;
    }

    try {
      await financeApi.createBill({
        name: values.name.trim(),
        amount,
        category: values.category.trim() || 'Bills',
        dueDate: new Date(values.dueDate).toISOString(),
        isPaid: false,
        note: values.note.trim() || null,
      });
      billForm.reset({ name: '', amount: '', category: 'Bills', dueDate: todayIso(), note: '' });
      await refreshAll();
      markChanged();
      setNotice('Bill reminder saved');
    } catch {
      setNotice('Unable to save bill reminder');
    }
  });

  const createRecurring = recurringForm.handleSubmit(async (values) => {
    const amount = Number(values.amount);
    if (!values.title.trim() || !Number.isFinite(amount) || amount <= 0 || !values.nextRunDate.trim()) {
      setNotice('Enter a valid recurring title, amount, and next date');
      return;
    }

    try {
      await financeApi.createRecurring({
        title: values.title.trim(),
        amount,
        type: values.type,
        category: values.category.trim() || null,
        frequency: values.frequency,
        nextRunDate: new Date(values.nextRunDate).toISOString(),
        isActive: true,
        note: values.note.trim() || null,
      });
      recurringForm.reset({ title: '', amount: '', category: 'Food', type: 'expense', frequency: 'monthly', nextRunDate: todayIso(), note: '' });
      await refreshAll();
      markChanged();
      setNotice('Recurring transaction saved');
    } catch {
      setNotice('Unable to save recurring transaction');
    }
  });

  const toggleBill = useCallback(async (id: string, isPaid: boolean) => {
    try {
      await financeApi.markBillPaid(id, !isPaid);
      await refreshAll();
      markChanged();
      setNotice(!isPaid ? 'Bill marked as paid' : 'Bill reopened');
    } catch {
      setNotice('Unable to update bill');
    }
  }, [markChanged, refreshAll]);

  const toggleRecurring = useCallback(async (id: string, isActive: boolean) => {
    try {
      await financeApi.toggleRecurring(id, !isActive);
      await refreshAll();
      markChanged();
      setNotice(!isActive ? 'Recurring item activated' : 'Recurring item paused');
    } catch {
      setNotice('Unable to update recurring item');
    }
  }, [markChanged, refreshAll]);

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    },
  ];

  return (
    <Screen refreshing={bills.isLoading || recurring.isLoading} onRefresh={refreshAll}>
      <PageHeroCard
        icon="calendar-clock"
        title="Bills & Recurring"
        subtitle="Tarsi keeps due dates, subscriptions, and repeated money moves visible."
        value={formatCurrency(totals.unpaid)}
        caption={`${totals.activeRecurring} active recurring`}
        color={palette.forest}
        mascot
      />

      <Card style={cardStyle}>
        <Card.Content style={styles.snapshotContent}>
          <SectionHeader icon="calendar-alert" title="Schedule Snapshot" subtitle="Bills and recurring money at a glance." color={palette.forest} />
          <View style={styles.statGrid}>
            <FeatureStatCard icon="receipt-clock-outline" label="Unpaid" value={formatCurrency(totals.unpaid)} helper="open bills" color={palette.orange} />
            <FeatureStatCard icon="alert-circle-outline" label="Overdue" value={String(totals.overdue)} helper="needs attention" color={palette.red} />
            <FeatureStatCard icon="repeat-variant" label="Recurring" value={String(totals.activeRecurring)} helper="active schedules" color={palette.forest} />
            <FeatureStatCard
              icon="calendar-arrow-right"
              label="Next Due"
              value={totals.nextBill ? new Date(totals.nextBill.dueDate).toLocaleDateString() : 'None'}
              helper={totals.nextBill?.name ?? 'no unpaid bill'}
              color={palette.green}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="bell-plus-outline" title="New Bill Reminder" subtitle="Track due dates and mark bills paid." color={palette.forest} />
          {(['name', 'amount', 'category', 'dueDate', 'note'] as const).map((name) => (
            <Controller key={name} control={billForm.control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label={name === 'dueDate' ? 'Due Date (YYYY-MM-DD)' : name[0].toUpperCase() + name.slice(1)}
                value={value}
                onChangeText={onChange}
                keyboardType={name === 'amount' ? 'numeric' : 'default'}
                left={<TextInput.Icon icon={name === 'amount' ? 'cash-clock' : name === 'dueDate' ? 'calendar-outline' : name === 'category' ? 'shape-outline' : name === 'note' ? 'note-text-outline' : 'receipt-text-outline'} />}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}
          <Button icon="bell-plus-outline" mode="contained" style={styles.billButton} contentStyle={styles.buttonContent} loading={billForm.formState.isSubmitting} onPress={createBill}>
            Save Bill
          </Button>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.formContent}>
          <SectionHeader icon="repeat-variant" title="Recurring Money" subtitle="Create repeating income or expense schedules." color={palette.forest} />
          <SegmentedButtons
            value={recurringType}
            onValueChange={(value) => recurringForm.setValue('type', value as RecurringFormValues['type'])}
            buttons={[{ value: 'expense', label: 'Expense', icon: 'cash-minus' }, { value: 'income', label: 'Income', icon: 'cash-plus' }]}
          />
          <SegmentedButtons
            value={recurringFrequency}
            onValueChange={(value) => recurringForm.setValue('frequency', value as RecurringFormValues['frequency'])}
            buttons={[{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }]}
          />
          {(['title', 'amount', 'category', 'nextRunDate', 'note'] as const).map((name) => (
            <Controller key={name} control={recurringForm.control} name={name} render={({ field: { value, onChange } }) => (
              <TextInput
                mode="outlined"
                label={name === 'nextRunDate' ? 'Next Date (YYYY-MM-DD)' : name[0].toUpperCase() + name.slice(1)}
                value={value}
                onChangeText={onChange}
                keyboardType={name === 'amount' ? 'numeric' : 'default'}
                left={<TextInput.Icon icon={name === 'amount' ? 'cash' : name === 'nextRunDate' ? 'calendar-sync-outline' : name === 'category' ? 'shape-outline' : name === 'note' ? 'note-text-outline' : 'repeat-variant'} />}
                theme={{ roundness: 12 }}
              />
            )} />
          ))}
          <Button icon="repeat-variant" mode="contained" style={styles.recurringButton} contentStyle={styles.buttonContent} loading={recurringForm.formState.isSubmitting} onPress={createRecurring}>
            Save Recurring
          </Button>
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="calendar-check-outline" title="Upcoming Bills" subtitle="Tap to mark paid or reopen." color={palette.forest} />
          {bills.isLoading ? <StateView loading /> : bills.error ? <StateView title="Unable to load bills" message={bills.error} /> : bills.data?.length ? (
            <View style={styles.list}>
              {bills.data.map((bill) => {
                const status = getBillStatus(bill.dueDate, bill.isPaid);
                return (
                <View key={bill.id} style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleGroup}>
                      <View style={styles.itemTitleRow}>
                        <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{bill.name}</Text>
                        <Text style={[styles.statusBadge, { backgroundColor: status.backgroundColor, color: status.color }]}>{status.label}</Text>
                      </View>
                      <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>{bill.category} - Due {new Date(bill.dueDate).toLocaleDateString()}</Text>
                    </View>
                    <Text style={[styles.itemAmount, { color: bill.isPaid ? palette.green : palette.orange }]}>{formatCurrency(Number(bill.amount))}</Text>
                  </View>
                  <Chip icon={bill.isPaid ? 'check-circle-outline' : 'clock-outline'} selected={bill.isPaid} onPress={() => toggleBill(bill.id, bill.isPaid)}>
                    {bill.isPaid ? 'Paid' : 'Mark paid'}
                  </Chip>
                </View>
                );
              })}
            </View>
          ) : <StateView title="No bill reminders" message="Bills you add will appear here." />}
        </Card.Content>
      </Card>

      <Card style={cardStyle}>
        <Card.Content style={styles.listContent}>
          <SectionHeader icon="repeat" title="Recurring List" subtitle="Pause or reactivate scheduled money." color={palette.forest} />
          {recurring.isLoading ? <StateView loading /> : recurring.error ? <StateView title="Unable to load recurring items" message={recurring.error} /> : recurring.data?.length ? (
            <View style={styles.list}>
              {recurring.data.map((item) => (
                <View key={item.id} style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={styles.itemHeader}>
                    <View style={styles.itemTitleGroup}>
                      <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
                      <Text style={[styles.itemSubtitle, { color: theme.colors.onSurfaceVariant }]}>
                        {item.frequency} {item.type} - Next {new Date(item.nextRunDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.itemAmount, { color: item.type === 'income' ? palette.green : palette.red }]}>{formatCurrency(Number(item.amount))}</Text>
                  </View>
                  <Chip icon={item.isActive ? 'pause-circle-outline' : 'play-circle-outline'} selected={item.isActive} onPress={() => toggleRecurring(item.id, item.isActive)}>
                    {item.isActive ? 'Active' : 'Paused'}
                  </Chip>
                </View>
              ))}
            </View>
          ) : <StateView title="No recurring money" message="Recurring records you add will appear here." />}
        </Card.Content>
      </Card>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2600}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  billButton: { backgroundColor: palette.forest, borderRadius: 16, marginTop: 6 },
  buttonContent: { height: 48 },
  card: { borderRadius: 22, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8 },
  formContent: { gap: 14, paddingVertical: 18 },
  item: { borderRadius: 18, gap: 10, padding: 14 },
  itemAmount: { fontSize: 15, fontWeight: '900' },
  itemHeader: { alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  itemSubtitle: { fontSize: 12, fontWeight: '500', opacity: 0.72 },
  itemTitle: { fontSize: 16, fontWeight: '900' },
  itemTitleRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemTitleGroup: { flex: 1, gap: 2 },
  list: { gap: 10 },
  listContent: { gap: 12, paddingVertical: 18 },
  recurringButton: { backgroundColor: palette.forest, borderRadius: 16, marginTop: 6 },
  snapshotContent: { gap: 12, paddingVertical: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusBadge: { borderRadius: 999, fontSize: 10, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 },
});
