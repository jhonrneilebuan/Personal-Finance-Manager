import { StyleSheet, View } from 'react-native';
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
      style={styles.row}
      title={title}
      description={subtitle}
      titleNumberOfLines={1}
      descriptionNumberOfLines={1}
      left={(props) => <List.Icon {...props} style={[props.style, styles.icon]} icon={type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'} color={color} />}
      right={() => (
        <View style={styles.amount}>
          <Text style={{ color }}>{type === 'income' ? '+' : '-'}{formatCurrency(amount)}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: 8, paddingHorizontal: 0 },
  icon: { marginLeft: 0 },
  amount: { justifyContent: 'center' },
});
