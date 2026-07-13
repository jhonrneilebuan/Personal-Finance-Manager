import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Portal, Text, useTheme } from 'react-native-paper';
import { TarsiMascot } from '@/components/TarsiMascot';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { palette } from '@/theme/theme';

type TabHref =
  | '/(tabs)/dashboard'
  | '/(tabs)/expenses'
  | '/(tabs)/income'
  | '/(tabs)/budgets'
  | '/(tabs)/reports'
  | '/(tabs)/profile'
  | '/(tabs)/goals'
  | '/(tabs)/bills'
  | '/(tabs)/debts'
  | '/(tabs)/allowance';

const navItems: Array<{ title: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; href: TabHref; match: string; accent: string }> = [
  { title: 'Dashboard',  icon: 'view-dashboard-outline',    href: '/(tabs)/dashboard', match: '/dashboard', accent: palette.forest },
  { title: 'Expenses',   icon: 'credit-card-minus-outline', href: '/(tabs)/expenses',  match: '/expenses',  accent: palette.red },
  { title: 'Income',     icon: 'cash-plus',                 href: '/(tabs)/income',    match: '/income',    accent: palette.green },
  { title: 'Budgets',    icon: 'target-variant',            href: '/(tabs)/budgets',   match: '/budgets',   accent: palette.forest },
  { title: 'Baon Plan',  icon: 'school-outline',            href: '/(tabs)/allowance', match: '/allowance', accent: palette.leaf },
  { title: 'Goals',      icon: 'bullseye-arrow',            href: '/(tabs)/goals',     match: '/goals',     accent: palette.forest },
  { title: 'Bills',      icon: 'calendar-clock',            href: '/(tabs)/bills',     match: '/bills',     accent: palette.orange },
  { title: 'Debts',      icon: 'credit-card-clock-outline', href: '/(tabs)/debts',     match: '/debts',     accent: '#FF453A' },
  { title: 'Reports',    icon: 'chart-areaspline',          href: '/(tabs)/reports',   match: '/reports',   accent: palette.forest },
  { title: 'Profile',    icon: 'account-circle-outline',    href: '/(tabs)/profile',   match: '/profile',   accent: palette.orange },
];

const quickActions: Array<{ label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; href: TabHref; color: string; bg: string }> = [
  { label: 'AI Planner', icon: 'robot-outline',         href: '/(tabs)/dashboard', color: '#FFFFFF', bg: palette.forest },
  { label: 'Expense',    icon: 'plus-circle-outline',   href: '/(tabs)/expenses',  color: '#FFFFFF', bg: palette.red },
  { label: 'Income',     icon: 'cash-plus',             href: '/(tabs)/income',    color: '#FFFFFF', bg: palette.green },
  { label: 'Baon',       icon: 'school-outline',        href: '/(tabs)/allowance', color: '#FFFFFF', bg: palette.leaf },
];

export function AppDrawer() {
  const theme = useTheme();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isDrawerOpen = useUiStore((state) => state.isDrawerOpen);
  const closeDrawer = useUiStore((state) => state.closeDrawer);

  const goTo = (href: TabHref) => {
    closeDrawer();
    router.push(href);
  };

  const handleLogout = async () => {
    closeDrawer();
    await logout();
    router.replace('/(auth)/login');
  };

  const initials = (user?.fullName ?? 'P').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Portal>
      <Modal
        visible={isDrawerOpen}
        onDismiss={closeDrawer}
        contentContainerStyle={[styles.drawer, { backgroundColor: theme.colors.background }]}
      >
        {/* ── Gradient Header ─────────────────────────────── */}
        <View style={styles.headerWrap}>
          <Svg style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#0A84FF" />
                <Stop offset="100%" stopColor="#003566" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#dg)" />
          </Svg>

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={closeDrawer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.drawerMascot}>
              <TarsiMascot size={46} />
            </View>
          </View>

          <Text style={styles.userName} numberOfLines={1}>{user?.fullName ?? 'PesoPilot User'}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user?.email ?? ''}</Text>

          {/* App badge */}
          <View style={styles.appBadge}>
            <MaterialCommunityIcons name="leaf" size={11} color="rgba(255,255,255,0.7)" />
            <Text style={styles.appBadgeText}>Tarsi Wallet</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Quick Actions ────────────────────────────── */}
          <View style={styles.sectionRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={13} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>QUICK ACTIONS</Text>
          </View>
          <View style={styles.quickGrid}>
            {quickActions.map((a) => (
              <TouchableOpacity key={a.label} style={[styles.quickPill, { backgroundColor: a.bg }]} onPress={() => goTo(a.href)} activeOpacity={0.82}>
                <MaterialCommunityIcons name={a.icon} size={20} color={a.color} />
                <Text style={[styles.quickLabel, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          {/* ── Navigation ───────────────────────────────── */}
          <View style={styles.sectionRow}>
            <MaterialCommunityIcons name="compass-outline" size={13} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>NAVIGATE</Text>
          </View>
          <View style={styles.navList}>
            {navItems.map((item) => {
              const active = pathname.includes(item.match);
              return (
                <TouchableOpacity
                  key={item.href}
                  style={[
                    styles.navRow,
                    active
                      ? { backgroundColor: item.accent + '18' }
                      : { backgroundColor: theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' },
                  ]}
                  onPress={() => goTo(item.href)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.navIconBadge, { backgroundColor: active ? item.accent : item.accent + '22' }]}>
                    <MaterialCommunityIcons name={item.icon} size={18} color={active ? '#FFFFFF' : item.accent} />
                  </View>
                  <Text style={[styles.navTitle, { color: active ? item.accent : theme.colors.onSurface, fontWeight: active ? '800' : '500' }]}>
                    {item.title}
                  </Text>
                  {active ? (
                    <View style={[styles.activeIndicator, { backgroundColor: item.accent }]} />
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.4 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          {/* ── Logout ───────────────────────────────────── */}
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout} activeOpacity={0.8}>
            <View style={styles.logoutIconBadge}>
              <MaterialCommunityIcons name="logout" size={18} color="#FF453A" />
            </View>
            <Text style={styles.logoutText}>Logout</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#FF453A" style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  // ── Drawer shell
  drawer: {
    borderRadius: 0,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 24,
    height: '100%',
    justifyContent: 'flex-start',
    margin: 0,
    maxWidth: 320,
    overflow: 'hidden',
    width: '83%',
  },

  // ── Header
  headerWrap: {
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 52,
    gap: 4,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 6,
  },
  avatarRing: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 36,
    marginBottom: 10,
    padding: 3,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 32,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  avatarText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  drawerMascot: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.88)', borderRadius: 18, height: 54, justifyContent: 'center', width: 54 },
  profileRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  userName: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: -0.3, marginTop: 2 },
  userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  appBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  appBadgeText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // ── Scroll body
  scrollContent: { gap: 12, paddingHorizontal: 16, paddingVertical: 18, paddingBottom: 40 },

  // ── Section labels
  sectionRow: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },

  // ── Quick action grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickPill: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    flexBasis: '43%',
    gap: 6,
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  quickLabel: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },

  // ── Nav rows
  navList: { gap: 6 },
  navRow: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  navIconBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  navTitle: { flex: 1, fontSize: 15, letterSpacing: -0.1 },
  activeIndicator: {
    borderRadius: 4,
    height: 6,
    width: 6,
  },

  // ── Divider
  divider: { height: 1, opacity: 0.35 },

  // ── Logout
  logoutRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,69,58,0.08)',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  logoutIconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,69,58,0.15)',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  logoutText: { color: '#FF453A', flex: 1, fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
});
