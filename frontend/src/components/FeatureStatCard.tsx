import { StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, useTheme } from 'react-native-paper';

type FeatureStatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  helper?: string;
  color: string;
};

export function FeatureStatCard({ icon, label, value, helper, color }: FeatureStatCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.iconBadge, { backgroundColor: `${color}1F` }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]} numberOfLines={1}>{value}</Text>
        {helper ? <Text style={[styles.helper, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>{helper}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, flexBasis: '47%', flexGrow: 1, gap: 10, minWidth: 138, padding: 14 },
  copy: { gap: 2 },
  helper: { fontSize: 11, fontWeight: '600', opacity: 0.65 },
  iconBadge: { alignItems: 'center', borderRadius: 12, height: 38, justifyContent: 'center', width: 38 },
  label: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  value: { fontSize: 18, fontWeight: '900' },
});
