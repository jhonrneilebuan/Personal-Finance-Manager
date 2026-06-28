import { StyleSheet, View, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '@/utils/currency';

type StatCardProps = {
  label: string;
  value: number;
  tone?: 'primary' | 'income' | 'expense' | 'savings';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
};

const toneIcon = {
  primary: 'wallet-outline',
  income: 'arrow-down-circle-outline',
  expense: 'arrow-up-circle-outline',
  savings: 'piggy-bank-outline',
} satisfies Record<NonNullable<StatCardProps['tone']>, keyof typeof MaterialCommunityIcons.glyphMap>;

export function StatCard({ label, value, tone = 'primary', icon, style }: StatCardProps) {
  const theme = useTheme();
  const color = tone === 'expense' ? theme.colors.error : tone === 'income' ? theme.colors.secondary : tone === 'savings' ? theme.colors.tertiary : theme.colors.primary;

  return (
    <Card 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderWidth: theme.dark ? 1 : 0,
        }, 
        style
      ]}
    >
      <Card.Content style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${color}14` }]}>
            <MaterialCommunityIcons name={icon ?? toneIcon[tone]} color={color} size={20} />
          </View>
          <View style={[styles.dot, { backgroundColor: color }]} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
            {label}
          </Text>
          <Text style={[styles.value, { color: theme.colors.onSurface }]}>
            {formatCurrency(value)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { 
    borderRadius: 16, 
    flexGrow: 1, 
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: { gap: 12, padding: 14, paddingVertical: 16 },
  copy: { gap: 2 },
  dot: { borderRadius: 4, height: 6, width: 6 },
  iconWrap: { alignItems: 'center', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 },
  label: { fontSize: 13, fontWeight: '600', opacity: 0.6 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  value: { fontWeight: '900', fontSize: 19, letterSpacing: -0.3 },
});

