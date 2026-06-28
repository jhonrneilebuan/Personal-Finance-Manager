import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';
import { palette } from '@/theme/theme';
import { formatCurrency } from '@/utils/currency';
import { StateView } from './StateView';

type BarChartCardProps = {
  title: string;
  data: Array<{ label: string; value: number }>;
};

const chartColors = [palette.blue, palette.green, palette.orange, palette.indigo, palette.pink, palette.teal];

export function BarChartCard({ title, data }: BarChartCardProps) {
  const theme = useTheme();
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name="chart-bar" color={theme.colors.primary} size={20} />
          </View>
          <Text variant="titleMedium" style={styles.title}>{title}</Text>
        </View>
        {data.length === 0 ? (
          <StateView title="No data yet" message="Add transactions to see this chart." />
        ) : (
          <View style={styles.rows}>
            {data.map((item, index) => {
              const color = chartColors[index % chartColors.length];
              return (
                <View key={item.label} style={styles.row}>
                  <View style={styles.meta}>
                    <Text numberOfLines={1} style={styles.label}>{item.label}</Text>
                    <Text style={styles.value}>{formatCurrency(item.value)}</Text>
                  </View>
                  <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
                    <View style={[styles.bar, { width: `${Math.max((item.value / max) * 100, 5)}%`, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  bar: { borderRadius: 8, height: 12 },
  card: { borderRadius: 8 },
  content: { gap: 18, paddingVertical: 20 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  headerIcon: { alignItems: 'center', borderRadius: 8, height: 38, justifyContent: 'center', width: 38 },
  label: { flex: 1, fontWeight: '700' },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  row: { gap: 8 },
  rows: { gap: 16 },
  title: { fontWeight: '800' },
  track: { borderRadius: 8, height: 12, overflow: 'hidden' },
  value: { opacity: 0.64, textAlign: 'right' },
});
