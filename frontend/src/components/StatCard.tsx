import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '@/utils/currency';

type StatCardProps = {
  label: string;
  value: number;
  tone?: 'primary' | 'income' | 'expense' | 'savings';
  style?: ViewStyle;
};

export function StatCard({ label, value, tone = 'primary', style }: StatCardProps) {
  const theme = useTheme();
  const color = tone === 'expense' ? theme.colors.error : tone === 'income' ? theme.colors.secondary : theme.colors.primary;

  return (
    <Card mode="contained" style={[styles.card, style]}>
      <Card.Content>
        <View style={[styles.marker, { backgroundColor: color }]} />
        <Text variant="labelMedium" style={styles.label}>
          {label}
        </Text>
        <Text variant="titleLarge">{formatCurrency(value)}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, flexGrow: 1, minWidth: 148 },
  label: { marginBottom: 6, opacity: 0.75 },
  marker: { borderRadius: 8, height: 4, marginBottom: 12, width: 44 },
});
