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
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}14` }]}>
        <MaterialCommunityIcons name={icon} color={iconColor} size={20} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { flex: 1, gap: 1 },
  header: { 
    alignItems: 'center', 
    flexDirection: 'row', 
    gap: 12,
    marginBottom: 4,
  },
  iconWrap: { 
    alignItems: 'center', 
    borderRadius: 14, 
    height: 42, 
    justifyContent: 'center', 
    width: 42 
  },
  subtitle: { 
    fontSize: 12, 
    fontWeight: '500', 
    opacity: 0.6,
  },
  title: { 
    fontSize: 17, 
    fontWeight: '900', 
    letterSpacing: -0.2 
  },
});
