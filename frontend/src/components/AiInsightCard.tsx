import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import type { AiFinanceInsight } from '@/types/ai';
import { TarsiMascot } from './TarsiMascot';

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
    <Card 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          borderWidth: theme.dark ? 1 : 0,
        }
      ]}
    >
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <TarsiMascot size={58} mood={insight ? 'happy' : 'thinking'} />
          <View style={[styles.iconBox, { backgroundColor: `${accent}12` }]}>
            <MaterialCommunityIcons name={icon} size={19} color={accent} />
          </View>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
              <Text style={[styles.badge, { color: accent, backgroundColor: `${accent}14` }]}>
                {insight?.source === 'ai' ? 'AI' : 'Coach'}
              </Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text>
          </View>
        </View>

        {insight ? (
          <View style={styles.result}>
            <Text style={[styles.insightTitle, { color: theme.colors.onSurface }]}>{insight.title}</Text>
            <Text style={[styles.summary, { color: theme.colors.onSurfaceVariant }]}>{insight.summary}</Text>
            <View style={styles.columns}>
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: theme.colors.onSurface }]}>Highlights</Text>
                {insight.highlights.map((item) => (
                  <Text key={item} style={[styles.item, { color: theme.colors.onSurfaceVariant }]}>• {item}</Text>
                ))}
              </View>
              <View style={styles.column}>
                <Text style={[styles.columnTitle, { color: theme.colors.onSurface }]}>Next Actions</Text>
                {insight.actionItems.map((item) => (
                  <Text key={item} style={[styles.item, { color: theme.colors.onSurfaceVariant }]}>• {item}</Text>
                ))}
              </View>
            </View>
          </View>
        ) : null}

        <Button 
          icon="auto-fix" 
          mode="contained-tonal" 
          textColor={accent}
          style={styles.actionButton}
          contentStyle={styles.buttonContent}
          loading={loading} 
          disabled={loading} 
          onPress={onGenerate}
        >
          {buttonLabel}
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: { 
    fontSize: 11, 
    fontWeight: '900', 
    letterSpacing: 0.5, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6,
    overflow: 'hidden',
  },
  card: { 
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  column: { flex: 1, gap: 6, minWidth: 170 },
  columnTitle: { fontWeight: '800', fontSize: 13, letterSpacing: -0.1 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  content: { gap: 14, paddingVertical: 20 },
  copy: { flex: 1, gap: 2 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  iconBox: { alignItems: 'center', borderRadius: 14, height: 40, justifyContent: 'center', width: 40 },
  insightTitle: { fontWeight: '800', fontSize: 15, letterSpacing: -0.2, marginTop: 4 },
  item: { lineHeight: 18, opacity: 0.85, fontSize: 13, paddingLeft: 4 },
  result: { gap: 10, paddingVertical: 4 },
  subtitle: { opacity: 0.6, fontSize: 12, fontWeight: '500' },
  summary: { lineHeight: 18, opacity: 0.8, fontSize: 13 },
  title: { flex: 1, fontWeight: '800', fontSize: 15, letterSpacing: -0.2 },
  titleRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  actionButton: { borderRadius: 10, marginTop: 4 },
  buttonContent: { height: 42 },
});
