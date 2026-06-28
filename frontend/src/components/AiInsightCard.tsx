import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import type { AiFinanceInsight } from '@/types/ai';

type AiInsightCardProps = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  insight?: AiFinanceInsight | null;
  loading?: boolean;
  onGenerate: () => void;
};

export function AiInsightCard({
  title,
  subtitle,
  buttonLabel,
  icon = 'robot-outline',
  color,
  insight,
  loading,
  onGenerate,
}: AiInsightCardProps) {
  const theme = useTheme();
  const accent = color ?? theme.colors.primary;

  return (
    <Card mode="elevated" style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons name={icon} size={24} color={accent} />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text variant="titleMedium" style={styles.title}>{title}</Text>
              <Text style={[styles.badge, { color: accent }]}>{insight?.source === 'ai' ? 'AI' : 'Coach'}</Text>
            </View>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        {insight ? (
          <View style={styles.result}>
            <Text variant="titleSmall" style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.summary}>{insight.summary}</Text>
            <View style={styles.columns}>
              <View style={styles.column}>
                <Text variant="labelLarge" style={styles.columnTitle}>Highlights</Text>
                {insight.highlights.map((item) => <Text key={item} style={styles.item}>- {item}</Text>)}
              </View>
              <View style={styles.column}>
                <Text variant="labelLarge" style={styles.columnTitle}>Next Actions</Text>
                {insight.actionItems.map((item) => <Text key={item} style={styles.item}>- {item}</Text>)}
              </View>
            </View>
          </View>
        ) : null}

        <Button icon="auto-fix" mode="contained-tonal" loading={loading} disabled={loading} onPress={onGenerate}>
          {buttonLabel}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: { fontWeight: '900' },
  card: { borderRadius: 8 },
  column: { flex: 1, gap: 5, minWidth: 180 },
  columnTitle: { fontWeight: '900' },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  content: { gap: 14, paddingVertical: 18 },
  copy: { flex: 1, gap: 3 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconBox: { alignItems: 'center', borderRadius: 8, height: 46, justifyContent: 'center', width: 46 },
  insightTitle: { fontWeight: '900' },
  item: { lineHeight: 20, opacity: 0.78 },
  result: { gap: 10 },
  subtitle: { opacity: 0.68 },
  summary: { lineHeight: 21, opacity: 0.82 },
  title: { flex: 1, fontWeight: '900' },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
});
