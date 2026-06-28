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
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Cashflow Graph</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>Monthly income, expenses, and savings</Text>
          </View>
        </View>

        <View style={styles.graph}>
          {data.map((item) => {
            const height = Math.max((Math.abs(item.value) / max) * 142, 16);
            return (
              <View key={item.label} style={styles.column}>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>{formatCurrency(item.value)}</Text>
                <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={[styles.bar, { height, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: { 
    borderTopLeftRadius: 6, 
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    width: 32 
  },
  barTrack: { 
    alignItems: 'center', 
    borderRadius: 8, 
    height: 150, 
    justifyContent: 'flex-end', 
    overflow: 'hidden', 
    width: 44 
  },
  card: { 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  column: { alignItems: 'center', flex: 1, gap: 8 },
  content: { gap: 16, paddingVertical: 18 },
  graph: { alignItems: 'flex-end', flexDirection: 'row', gap: 12, minHeight: 200, marginTop: 4 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  headerIcon: { alignItems: 'center', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  label: { fontSize: 13, fontWeight: '600', opacity: 0.6 },
  subtitle: { fontSize: 12, opacity: 0.6, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  value: { fontSize: 13, fontWeight: '700', textAlign: 'center', letterSpacing: -0.2 },
});

