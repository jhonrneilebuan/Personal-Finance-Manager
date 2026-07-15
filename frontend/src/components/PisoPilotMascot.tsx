import { StyleSheet, View } from 'react-native';
import { Svg, Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { palette } from '@/theme/theme';

type PisoPilotMascotProps = {
  size?: number;
  mood?: 'happy' | 'thinking';
};

export function PisoPilotMascot({ size = 82, mood = 'happy' }: PisoPilotMascotProps) {
  return (
    <View style={[styles.shell, { height: size, width: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} viewBox="0 0 96 96">
        <Circle cx="48" cy="48" r="44" fill="#DCEBFF" />
        <Circle cx="48" cy="52" r="31" fill="#8B5E3C" />
        <Ellipse cx="32" cy="43" rx="16" ry="19" fill="#F6E7D8" />
        <Ellipse cx="64" cy="43" rx="16" ry="19" fill="#F6E7D8" />
        <Circle cx="32" cy="43" r="8" fill="#171717" />
        <Circle cx="64" cy="43" r="8" fill="#171717" />
        <Circle cx="29" cy="39" r="3" fill="#FFFFFF" />
        <Circle cx="61" cy="39" r="3" fill="#FFFFFF" />
        <Ellipse cx="48" cy="56" rx="14" ry="12" fill="#F6E7D8" />
        <Path d="M44 54 Q48 58 52 54" stroke="#003566" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path
          d={mood === 'thinking' ? 'M38 66 Q48 61 58 66' : 'M38 64 Q48 73 58 64'}
          stroke="#003566"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M24 29 Q48 6 72 29 L68 20 Q48 11 28 20 Z" fill={palette.forest} />
        <Rect x="26" y="23" width="44" height="10" rx="5" fill={palette.leaf} />
        <Path d="M22 75 Q48 86 74 75 Q68 92 48 92 Q28 92 22 75Z" fill={palette.forest} />
        <Circle cx="75" cy="58" r="6" fill={palette.leaf} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
