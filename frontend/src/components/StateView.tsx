import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';

type StateViewProps = {
  title?: string;
  message?: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({ title, message, loading, actionLabel, onAction }: StateViewProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator /> : null}
      {title ? <Text variant="titleMedium">{title}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? <Button mode="contained" onPress={onAction}>{actionLabel}</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 10, justifyContent: 'center', minHeight: 180, padding: 24 },
  message: { opacity: 0.7, textAlign: 'center' },
});

