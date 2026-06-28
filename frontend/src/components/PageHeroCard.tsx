import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text } from 'react-native-paper';

type PageHeroCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  value?: string;
  caption?: string;
  color: string;
};

export function PageHeroCard({ icon, title, subtitle, value, caption, color }: PageHeroCardProps) {
  return (
    <Card mode="elevated" style={[styles.card, { backgroundColor: color }]}>
      <Card.Content style={styles.content}>
        <View style={styles.accent} />
        <View style={styles.top}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={icon} color="#FFFFFF" size={28} />
          </View>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
        <View style={styles.copy}>
          <Text variant="headlineSmall" style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {value ? <Text variant="displaySmall" style={styles.value}>{value}</Text> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  accent: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, height: 76, position: 'absolute', right: -22, top: -18, width: 76 },
  caption: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8, color: '#FFFFFF', fontWeight: '800', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 7 },
  card: { borderRadius: 8, overflow: 'hidden' },
  content: { gap: 18, padding: 22 },
  copy: { gap: 5 },
  iconWrap: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, height: 52, justifyContent: 'center', width: 52 },
  subtitle: { color: 'rgba(255,255,255,0.78)' },
  title: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0 },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  value: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0 },
});
