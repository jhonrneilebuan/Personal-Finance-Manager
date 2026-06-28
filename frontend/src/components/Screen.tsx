import type { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}>;

export function Screen({ children, scroll = true, refreshing = false, onRefresh }: ScreenProps) {
  const theme = useTheme();
  const content = <View style={styles.content}>{children}</View>;

  if (!scroll) {
    return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>{content}</View>;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} /> : undefined}
    >
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 46 },
  content: { alignSelf: 'center', gap: 18, maxWidth: 820, padding: 16, paddingTop: 12, width: '100%' },
});
