import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ColorValue } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { AppDrawer } from '@/components/AppDrawer';
import { useUiStore } from '@/store/ui.store';

const tabIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <MaterialCommunityIcons name={name} color={String(color)} size={size} />;
  };

function HeaderTitle({ title }: { title: string }) {
  const openDrawer = useUiStore((state) => state.openDrawer);
  const theme = useTheme();

  return (
    <View style={styles.headerTitle}>
      <IconButton icon="menu" mode="contained-tonal" size={22} iconColor={theme.colors.primary} style={styles.menuButton} onPress={openDrawer} />
      <Text variant="titleLarge" style={styles.title}>{title}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerShadowVisible: false,
          headerTitleAlign: 'left',
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', headerTitle: () => <HeaderTitle title="Dashboard" />, tabBarIcon: tabIcon('view-dashboard-outline') }} />
        <Tabs.Screen name="expenses" options={{ title: 'Expenses', headerTitle: () => <HeaderTitle title="Expenses" />, tabBarIcon: tabIcon('credit-card-minus-outline') }} />
        <Tabs.Screen name="income" options={{ title: 'Income', headerTitle: () => <HeaderTitle title="Income" />, tabBarIcon: tabIcon('cash-plus') }} />
        <Tabs.Screen name="budgets" options={{ title: 'Budgets', headerTitle: () => <HeaderTitle title="Budgets" />, tabBarIcon: tabIcon('target-variant') }} />
        <Tabs.Screen name="reports" options={{ title: 'Reports', headerTitle: () => <HeaderTitle title="Reports" />, tabBarIcon: tabIcon('chart-areaspline') }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', headerTitle: () => <HeaderTitle title="Profile" />, tabBarIcon: tabIcon('account-circle-outline') }} />
      </Tabs>
      <AppDrawer />
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  menuButton: { borderRadius: 8, margin: 0 },
  title: { fontWeight: '900', letterSpacing: 0 },
});
