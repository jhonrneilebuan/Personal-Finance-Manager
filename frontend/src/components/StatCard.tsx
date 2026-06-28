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
    <Card mode="elevated" style={[styles.card, style]}>
      <Card.Content style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={icon ?? toneIcon[tone]} color={color} size={22} />
        </View>
        <View style={styles.copy}>
          <Text variant="labelLarge" style={styles.label}>
            {label}
          </Text>
          <Text variant="titleLarge" style={styles.value}>{formatCurrency(value)}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, flexGrow: 1, minWidth: 148 },
  content: { gap: 14, paddingVertical: 18 },
  copy: { gap: 4 },
  iconWrap: { alignItems: 'center', borderRadius: 8, height: 44, justifyContent: 'center', width: 44 },
  label: { opacity: 0.68 },
  value: { fontWeight: '800' },
});
