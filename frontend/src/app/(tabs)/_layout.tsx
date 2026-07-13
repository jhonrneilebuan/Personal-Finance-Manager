import { router, Tabs, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AppDrawer } from '@/components/AppDrawer';
import { useUiStore } from '@/store/ui.store';
import { palette } from '@/theme/theme';

// ─── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  { name: 'dashboard', label: 'Home',     icon: 'view-dashboard',          iconOutline: 'view-dashboard-outline'         },
  { name: 'expenses',  label: 'Expenses', icon: 'credit-card-minus',       iconOutline: 'credit-card-minus-outline'      },
  { name: 'income',    label: 'Income',   icon: 'cash-plus',               iconOutline: 'cash-plus'                      },
  { name: 'budgets',   label: 'Budgets',  icon: 'target-variant',          iconOutline: 'target-variant'                 },
  { name: 'reports',   label: 'Reports',  icon: 'chart-areaspline',        iconOutline: 'chart-areaspline'               },
  { name: 'profile',   label: 'Profile',  icon: 'account-circle',          iconOutline: 'account-circle-outline'         },
] as const;

// Accent colors per tab for the active state
const TAB_ACCENTS: Record<string, string> = {
  dashboard: palette.forest,
  expenses:  palette.red,
  income:    palette.green,
  budgets:   palette.leaf,
  reports:   palette.forest,
  profile:   palette.orange,
};

// ─── Custom Tab Bar ──────────────────────────────────────────────────────────
function CustomTabBar() {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: Platform.OS === 'ios' ? 24 : 10 }]}>
      <View style={[styles.tabBar, {
        backgroundColor: theme.dark ? 'rgba(22,30,25,0.96)' : 'rgba(255,255,255,0.98)',
        borderColor: theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(27,67,50,0.10)',
        shadowColor: theme.dark ? '#000' : '#000',
      }]}>
        {TABS.map((tab) => {
          const active = pathname.includes(`/${tab.name}`);
          const accent = TAB_ACCENTS[tab.name] ?? theme.colors.primary;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabItem}
              onPress={() => {
                router.push(`/(tabs)/${tab.name}`);
              }}
              activeOpacity={0.7}
            >
              {/* Active background pill */}
              {active && (
                <View style={[styles.activePill, { backgroundColor: accent + '18' }]} />
              )}

              {/* Icon badge */}
              <View style={[
                styles.iconWrap,
                active && { backgroundColor: accent + '15' }
              ]}>
                <MaterialCommunityIcons
                  name={active ? tab.icon : tab.iconOutline}
                  size={22}
                  color={active ? accent : (theme.dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)')}
                />
                {/* Active dot indicator */}
                {active && (
                  <View style={[styles.activeDot, { backgroundColor: accent }]} />
                )}
              </View>

              <Text style={[
                styles.tabLabel,
                { color: active ? accent : (theme.dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.35)') },
                active && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Header Title ────────────────────────────────────────────────────────────
const HEADER_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: 'view-dashboard-outline',
  Expenses:  'credit-card-minus-outline',
  Income:    'cash-plus',
  Budgets:   'target-variant',
  Reports:   'chart-areaspline',
  Profile:   'account-circle-outline',
  Goals:     'bullseye-arrow',
  Bills:     'calendar-clock',
  Debts:     'credit-card-clock-outline',
  Baon:      'school-outline',
};

function HeaderTitle({ title }: { title: string }) {
  const openDrawer = useUiStore((state) => state.openDrawer);
  const theme = useTheme();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const screenIcon = HEADER_ICONS[title];

  return (
    <View style={styles.headerTitle}>
      {/* Menu button */}
      <TouchableOpacity
        style={[styles.menuButton, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={openDrawer}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.75}
      >
        <MaterialCommunityIcons name="menu" size={20} color={theme.colors.primary} />
      </TouchableOpacity>

      {/* Screen icon + title */}
      <View style={styles.headerCenter}>
        {screenIcon && (
          <MaterialCommunityIcons name={screenIcon} size={18} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.6 }} />
        )}
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      </View>

      {/* Date badge */}
      <View style={[styles.dateBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name="calendar-outline" size={12} color={theme.colors.onSurfaceVariant} />
        <Text style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>{dateStr}</Text>
      </View>
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  const theme = useTheme();

  return (
    <>
      <Tabs
        tabBar={() => <CustomTabBar />}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerShadowVisible: false,
          headerTitleAlign: 'left',
          headerTintColor: theme.colors.onSurface,
          // Add a subtle bottom border to the header
          headerStatusBarHeight: undefined,
        }}
      >
        <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', headerTitle: () => <HeaderTitle title="Dashboard" /> }} />
        <Tabs.Screen name="expenses"  options={{ title: 'Expenses',  headerTitle: () => <HeaderTitle title="Expenses" /> }} />
        <Tabs.Screen name="income"    options={{ title: 'Income',    headerTitle: () => <HeaderTitle title="Income" /> }} />
        <Tabs.Screen name="budgets"   options={{ title: 'Budgets',   headerTitle: () => <HeaderTitle title="Budgets" /> }} />
        <Tabs.Screen name="reports"   options={{ title: 'Reports',   headerTitle: () => <HeaderTitle title="Reports" /> }} />
        <Tabs.Screen name="profile"   options={{ title: 'Profile',   headerTitle: () => <HeaderTitle title="Profile" /> }} />
        <Tabs.Screen name="goals"     options={{ title: 'Goals',     headerTitle: () => <HeaderTitle title="Goals" /> }} />
        <Tabs.Screen name="bills"     options={{ title: 'Bills',     headerTitle: () => <HeaderTitle title="Bills" /> }} />
        <Tabs.Screen name="debts"     options={{ title: 'Debts',     headerTitle: () => <HeaderTitle title="Debts" /> }} />
        <Tabs.Screen name="allowance" options={{ title: 'Baon',      headerTitle: () => <HeaderTitle title="Baon" /> }} />
      </Tabs>
      <AppDrawer />
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Header
  headerTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  title: { fontWeight: '900', letterSpacing: -0.3 },
  dateBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  dateText: { fontSize: 11, fontWeight: '600' },

  // ── Tab bar container
  tabBarWrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBar: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },

  // ── Individual tab item
  tabItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activePill: {
    borderRadius: 16,
    bottom: 0,
    left: 4,
    position: 'absolute',
    right: 4,
    top: 0,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 10,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    width: 32,
  },
  activeDot: {
    borderRadius: 3,
    bottom: -5,
    height: 3,
    position: 'absolute',
    width: 14,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
