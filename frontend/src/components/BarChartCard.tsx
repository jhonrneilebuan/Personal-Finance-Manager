import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '@/utils/currency';
import { StateView } from './StateView';

type BarChartCardProps = {
  title: string;
  data: Array<{ label: string; value: number }>;
};

export function BarChartCard({ title, data }: BarChartCardProps) {
  const theme = useTheme();
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card mode="contained" style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        {data.length === 0 ? (
          <StateView title="No data yet" message="Add transactions to see this chart." />
        ) : (
          <View style={styles.rows}>
            {data.map((item) => (
              <View key={item.label} style={styles.row}>
                <View style={styles.meta}>
                  <Text numberOfLines={1} style={styles.label}>{item.label}</Text>
                  <Text style={styles.value}>{formatCurrency(item.value)}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.bar, { width: `${Math.max((item.value / max) * 100, 4)}%`, backgroundColor: theme.colors.primary }]} />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: { borderRadius: 8, height: 12 },
  card: { borderRadius: 8 },
  label: { flex: 1, fontWeight: '600' },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  row: { gap: 8 },
  rows: { gap: 16 },
  title: { marginBottom: 16 },
  track: { backgroundColor: 'rgba(120,120,120,0.18)', borderRadius: 8, height: 12, overflow: 'hidden' },
  value: { opacity: 0.7, textAlign: 'right' },
});
