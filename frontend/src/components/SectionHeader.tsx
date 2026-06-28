import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';

type SectionHeaderProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle?: string;
  color?: string;
};

export function SectionHeader({ icon, title, subtitle, color }: SectionHeaderProps) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.primary;

  return (
    <View style={styles.header}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}18` }]}>
        <MaterialCommunityIcons name={icon} color={iconColor} size={21} />
      </View>
      <View style={styles.copy}>
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.marker, { backgroundColor: iconColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { flex: 1, gap: 2 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  iconWrap: { alignItems: 'center', borderRadius: 8, height: 40, justifyContent: 'center', width: 40 },
  marker: { borderRadius: 8, height: 30, width: 4 },
  subtitle: { opacity: 0.62 },
  title: { fontWeight: '900' },
});
