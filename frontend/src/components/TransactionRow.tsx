import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List, Text, useTheme } from 'react-native-paper';
import { formatCurrency } from '@/utils/currency';

type TransactionRowProps = {
  title: string;
  subtitle: string;
  amount: number;
  type: 'income' | 'expense';
};

export function TransactionRow({ title, subtitle, amount, type }: TransactionRowProps) {
  const theme = useTheme();
  const color = type === 'income' ? theme.colors.secondary : theme.colors.error;

  return (
    <List.Item
      style={[styles.row, { backgroundColor: theme.colors.surface }]}
      title={title}
      description={subtitle}
      titleNumberOfLines={1}
      descriptionNumberOfLines={1}
      titleStyle={styles.title}
      descriptionStyle={styles.description}
      left={() => (
        <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={type === 'income' ? 'arrow-down' : 'arrow-up'} color={color} size={20} />
        </View>
      )}
      right={() => (
        <View style={styles.amount}>
          <Text variant="titleSmall" style={{ color }}>{type === 'income' ? '+' : '-'}{formatCurrency(amount)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  amount: { justifyContent: 'center' },
  description: { opacity: 0.58 },
  iconWrap: { alignItems: 'center', borderRadius: 8, height: 42, justifyContent: 'center', marginRight: 12, width: 42 },
  row: { borderRadius: 8, marginVertical: 4, paddingHorizontal: 8, paddingVertical: 6 },
  title: { fontWeight: '700' },
});
