import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '@/utils/currency';

type TransactionRowProps = {
  title: string;
  subtitle: string;
  amount: number;
  type: 'income' | 'expense';
  badge?: string;
};

export function TransactionRow({ title, subtitle, amount, type, badge }: TransactionRowProps) {
  const theme = useTheme();
  const color = type === 'income' ? theme.colors.secondary : theme.colors.error;

  return (
    <List.Item
      style={[
        styles.row, 
        { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.outlineVariant,
          borderWidth: theme.dark ? 1 : 0,
        }
      ]}
      title={title}
      description={subtitle}
      titleNumberOfLines={1}
      descriptionNumberOfLines={1}
      titleStyle={[styles.title, { color: theme.colors.onSurface }]}
      descriptionStyle={[styles.description, { color: theme.colors.onSurfaceVariant }]}
      left={() => (
        <View style={[styles.iconWrap, { backgroundColor: `${color}12` }]}>
          <MaterialCommunityIcons name={type === 'income' ? 'arrow-down' : 'arrow-up'} color={color} size={18} />
        </View>
      )}
      right={() => (
        <View style={styles.amount}>
          {badge ? <Text style={[styles.badge, { color: theme.colors.error, backgroundColor: `${theme.colors.error}14` }]}>{badge}</Text> : null}
          <Text style={[styles.amountText, { color }]}>
            {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  amount: { alignItems: 'flex-end', gap: 4, justifyContent: 'center', minWidth: 100 },
  amountText: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  badge: { borderRadius: 999, fontSize: 10, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3 },
  description: { fontSize: 13, opacity: 0.6, fontWeight: '500' },
  iconWrap: { 
    alignItems: 'center', 
    borderRadius: 14, 
    height: 38, 
    justifyContent: 'center', 
    marginRight: 8, 
    width: 38 
  },
  row: { 
    borderRadius: 18, 
    marginVertical: 4, 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  title: { fontWeight: '700', fontSize: 15, letterSpacing: -0.1 },
});
