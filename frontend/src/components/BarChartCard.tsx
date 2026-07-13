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

const chartColors = [palette.forest, palette.leaf, palette.green, palette.teal, palette.orange, palette.pink];

export function BarChartCard({ title, data }: BarChartCardProps) {
  const theme = useTheme();
  const max = Math.max(...data.map((item) => item.value), 1);

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
            <MaterialCommunityIcons name="chart-bar" color={theme.colors.primary} size={18} />
          </View>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
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
                    <Text numberOfLines={1} style={[styles.label, { color: theme.colors.onSurface }]}>{item.label}</Text>
                    <Text style={[styles.value, { color: theme.colors.onSurfaceVariant }]}>{formatCurrency(item.value)}</Text>
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
  bar: { borderRadius: 4, height: 6 },
  card: { 
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: { gap: 16, paddingVertical: 20 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  headerIcon: { alignItems: 'center', borderRadius: 14, height: 42, justifyContent: 'center', width: 42 },
  label: { flex: 1, fontWeight: '700', fontSize: 14, letterSpacing: -0.1 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  row: { gap: 6 },
  rows: { gap: 14 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  track: { borderRadius: 999, height: 8, overflow: 'hidden' },
  value: { opacity: 0.8, textAlign: 'right', fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
});
