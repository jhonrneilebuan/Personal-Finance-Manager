import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, IconButton, Text, useTheme } from 'react-native-paper';

type MonthSelectorProps = {
  title: string;
  monthLabel: string;
  caption?: string;
  color: string;
  onPrevious: () => void;
  onNext: () => void;
  onCurrent?: () => void;
};

export function MonthSelector({ title, monthLabel, caption, color, onPrevious, onNext, onCurrent }: MonthSelectorProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBadge, { backgroundColor: `${color}1F` }]}>
          <MaterialCommunityIcons name="calendar-month-outline" size={18} color={color} />
        </View>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
          {caption ? <Text style={[styles.caption, { color: theme.colors.onSurfaceVariant }]}>{caption}</Text> : null}
        </View>
        {onCurrent ? (
          <Button compact mode="contained-tonal" onPress={onCurrent} style={styles.todayButton}>
            Today
          </Button>
        ) : null}
      </View>

      <View style={styles.monthRow}>
        <IconButton
          icon="chevron-left"
          mode="contained-tonal"
          size={20}
          iconColor={color}
          style={styles.navButton}
          onPress={onPrevious}
        />
        <View style={styles.monthTextWrap}>
          <Text style={[styles.monthLabel, { color }]}>{monthLabel}</Text>
        </View>
        <IconButton
          icon="chevron-right"
          mode="contained-tonal"
          size={20}
          iconColor={color}
          style={styles.navButton}
          onPress={onNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 12, fontWeight: '600', opacity: 0.72 },
  container: { borderRadius: 16, gap: 12, padding: 12 },
  headerRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  iconBadge: { alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  monthLabel: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  monthRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  monthTextWrap: { alignItems: 'center', flex: 1, justifyContent: 'center', minHeight: 44 },
  navButton: { borderRadius: 12, height: 42, margin: 0, width: 42 },
  title: { fontSize: 14, fontWeight: '900' },
  titleGroup: { flex: 1, gap: 1 },
  todayButton: { borderRadius: 999 },
});
