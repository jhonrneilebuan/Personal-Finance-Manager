import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '@/utils/currency';

type GraphItem = {
  label: string;
  value: number;
  color: string;
};

type CashflowGraphCardProps = {
  income: number;
  expenses: number;
  savings: number;
};

export function CashflowGraphCard({ income, expenses, savings }: CashflowGraphCardProps) {
  const theme = useTheme();
  const data: GraphItem[] = [
    { label: 'Income', value: income, color: theme.colors.secondary },
    { label: 'Expenses', value: expenses, color: theme.colors.error },
    { label: savings >= 0 ? 'Savings' : 'Deficit', value: savings, color: savings >= 0 ? theme.colors.tertiary : theme.colors.error },
  ];
  const max = Math.max(...data.map((item) => Math.abs(item.value)), 1);

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={21} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="titleMedium" style={styles.title}>Cashflow Graph</Text>
            <Text style={styles.subtitle}>Monthly income, expenses, and savings</Text>
          </View>
        </View>

        <View style={styles.graph}>
          {data.map((item) => {
            const height = Math.max((Math.abs(item.value) / max) * 142, 16);
            return (
              <View key={item.label} style={styles.column}>
                <Text variant="labelMedium" style={styles.value}>{formatCurrency(item.value)}</Text>
                <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={[styles.bar, { height, backgroundColor: item.color }]} />
                </View>
                <Text variant="labelMedium" style={styles.label}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: { borderRadius: 8, width: 34 },
  barTrack: { alignItems: 'center', borderRadius: 8, height: 150, justifyContent: 'flex-end', overflow: 'hidden', paddingBottom: 6, width: 46 },
  card: { borderRadius: 8 },
  column: { alignItems: 'center', flex: 1, gap: 8 },
  content: { gap: 18, paddingVertical: 20 },
  graph: { alignItems: 'flex-end', flexDirection: 'row', gap: 12, minHeight: 210 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  headerIcon: { alignItems: 'center', borderRadius: 8, height: 40, justifyContent: 'center', width: 40 },
  label: { opacity: 0.7 },
  subtitle: { opacity: 0.62 },
  title: { fontWeight: '800' },
  value: { fontWeight: '700', textAlign: 'center' },
});
