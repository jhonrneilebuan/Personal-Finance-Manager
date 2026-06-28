import { StyleSheet, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Button, Divider, IconButton, List, Modal, Portal, Text, useTheme } from 'react-native-paper';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';

type TabHref = '/(tabs)/dashboard' | '/(tabs)/expenses' | '/(tabs)/income' | '/(tabs)/budgets' | '/(tabs)/reports' | '/(tabs)/profile';

const menuItems: Array<{ title: string; icon: string; href: TabHref; match: string }> = [
  { title: 'Dashboard', icon: 'view-dashboard-outline', href: '/(tabs)/dashboard', match: '/dashboard' },
  { title: 'Expenses', icon: 'credit-card-minus-outline', href: '/(tabs)/expenses', match: '/expenses' },
  { title: 'Income', icon: 'cash-plus', href: '/(tabs)/income', match: '/income' },
  { title: 'Budgets', icon: 'target-variant', href: '/(tabs)/budgets', match: '/budgets' },
  { title: 'Reports', icon: 'chart-areaspline', href: '/(tabs)/reports', match: '/reports' },
  { title: 'Profile', icon: 'account-circle-outline', href: '/(tabs)/profile', match: '/profile' },
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

  return (
    <Portal>
      <Modal visible={isDrawerOpen} onDismiss={closeDrawer} contentContainerStyle={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.avatar}>
            <Text variant="titleLarge" style={styles.avatarText}>{(user?.fullName ?? 'P').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.userCopy}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.name}>{user?.fullName ?? 'PesoPilot User'}</Text>
            <Text numberOfLines={1} style={styles.email}>{user?.email ?? 'My Wallet'}</Text>
          </View>
          <IconButton icon="close" iconColor="#FFFFFF" onPress={closeDrawer} />
        </View>

        <View style={styles.content}>
          <Text variant="labelLarge" style={styles.section}>Create</Text>
          <View style={styles.actions}>
            <Button icon="plus-circle-outline" mode="contained" onPress={() => goTo('/(tabs)/expenses')}>Expense</Button>
            <Button icon="cash-plus" mode="contained-tonal" onPress={() => goTo('/(tabs)/income')}>Income</Button>
            <Button icon="target-variant" mode="outlined" onPress={() => goTo('/(tabs)/budgets')}>Budget</Button>
          </View>

          <Divider />
          <Text variant="labelLarge" style={styles.section}>Menu</Text>
          {menuItems.map((item) => {
            const active = pathname.includes(item.match);
            return (
              <List.Item
                key={item.href}
                title={item.title}
                titleStyle={active ? { color: theme.colors.primary, fontWeight: '800' } : undefined}
                style={[styles.item, active ? { backgroundColor: theme.colors.primaryContainer } : undefined]}
                left={(props) => <List.Icon {...props} icon={item.icon} color={active ? theme.colors.primary : props.color} />}
                onPress={() => goTo(item.href)}
              />
            );
          })}
          <Divider />
          <List.Item title="Logout" style={styles.item} left={(props) => <List.Icon {...props} icon="logout" />} onPress={handleLogout} />
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  actions: { gap: 10 },
  avatar: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, height: 54, justifyContent: 'center', width: 54 },
  avatarText: { color: '#FFFFFF', fontWeight: '900' },
  content: { gap: 8, padding: 16 },
  drawer: { borderRadius: 0, elevation: 8, height: '100%', justifyContent: 'flex-start', margin: 0, maxWidth: 340, width: '84%' },
  email: { color: 'rgba(255,255,255,0.76)' },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12, padding: 18, paddingTop: 28 },
  item: { borderRadius: 8 },
  name: { color: '#FFFFFF', fontWeight: '900' },
  section: { opacity: 0.62, paddingHorizontal: 8, paddingTop: 6 },
  userCopy: { flex: 1 },
});

