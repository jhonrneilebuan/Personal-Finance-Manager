import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Text } from 'react-native-paper';
import { Svg, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { palette } from '@/theme/theme';

type PageHeroCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  value?: string;
  caption?: string;
  color: string;
};

const getGradientColors = (baseColor: string): [string, string] => {
  const normalized = baseColor.toLowerCase();
  if (normalized === palette.blue.toLowerCase()) return ['#0A84FF', '#0052B3'];
  if (normalized === palette.indigo.toLowerCase()) return ['#5E5CE6', '#3C3B99'];
  if (normalized === palette.green.toLowerCase() || normalized === '#30d158' || normalized === '#30d158') return ['#34C759', '#1E7835'];
  if (normalized === palette.red.toLowerCase()) return ['#FF453A', '#B8221B'];
  return [baseColor, baseColor];
};

export function PageHeroCard({ icon, title, subtitle, value, caption, color }: PageHeroCardProps) {
  const gradientColors = getGradientColors(color);

  return (
    <Card style={styles.card}>
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#heroGrad)" />
        </Svg>
      </View>
      
      <Card.Content style={styles.content}>
        <View style={styles.accent} />
        <View style={styles.top}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={icon} color="#FFFFFF" size={26} />
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
  accent: { 
    backgroundColor: 'rgba(255,255,255,0.09)', 
    borderRadius: 50, 
    height: 100, 
    position: 'absolute', 
    right: -25, 
    top: -25, 
    width: 100 
  },
  caption: { 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    borderRadius: 10, 
    color: '#FFFFFF', 
    fontWeight: '800', 
    overflow: 'hidden', 
    paddingHorizontal: 12, 
    paddingVertical: 6,
    fontSize: 12,
  },
  card: { 
    borderRadius: 20, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 0,
  },
  content: { gap: 16, padding: 20, zIndex: 1 },
  copy: { gap: 4 },
  iconWrap: { 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.18)', 
    borderRadius: 12, 
    height: 48, 
    justifyContent: 'center', 
    width: 48 
  },
  subtitle: { color: 'rgba(255,255,255,0.82)', fontSize: 13, lineHeight: 18 },
  title: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0.5 },
  top: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  value: { color: '#FFFFFF', fontWeight: '900', letterSpacing: -0.5, marginTop: 4 },
});

