import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { useTheme } from 'react-native-paper';

const icon = (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialCommunityIcons name={name} color={String(color)} size={size} />;
  };

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.onSurface },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: icon('view-dashboard-outline') }} />
      <Tabs.Screen name="expenses" options={{ title: 'Expenses', tabBarIcon: icon('credit-card-outline') }} />
      <Tabs.Screen name="income" options={{ title: 'Income', tabBarIcon: icon('cash-plus') }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budgets', tabBarIcon: icon('target') }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: icon('chart-bar') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('account-circle-outline') }} />
    </Tabs>
  );
}
