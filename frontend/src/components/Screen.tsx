import type { PropsWithChildren } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  contentStyle,
}: ScreenProps) {
  const theme = useTheme();
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  if (!scroll) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
        {content}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }, style]}
      contentContainerStyle={[styles.scroll, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} /> : undefined}
    >
      {content}
    </ScrollView>
  );
}

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 110 : 90;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: TAB_BAR_HEIGHT },
  content: { alignSelf: 'center', gap: 18, maxWidth: 820, padding: 16, paddingTop: 12, width: '100%' },
});

