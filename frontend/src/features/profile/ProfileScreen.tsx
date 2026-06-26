import { router } from 'expo-router';
import { Card, Button, Divider, List, Switch, Text, TextInput } from 'react-native-paper';
import { Screen } from '@/components/Screen';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';

export function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const { isDarkMode, setDarkMode, currency, setCurrency, notificationsEnabled, setNotificationsEnabled } = useSettingsStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <Screen>
      <Card mode="contained">
        <Card.Content style={{ gap: 12 }}>
          <Text variant="titleMedium">Update Profile</Text>
          <TextInput label="Full name" value="PesoPilot User" />
          <TextInput label="Email" value="demo@pesopilot.app" disabled />
          <Button mode="contained" icon="content-save">Save Profile</Button>
        </Card.Content>
      </Card>
      <Card mode="contained">
        <Card.Content style={{ gap: 12 }}>
          <Text variant="titleMedium">Change Password</Text>
          <TextInput label="Current password" secureTextEntry />
          <TextInput label="New password" secureTextEntry />
          <Button mode="outlined" icon="lock-reset">Update Password</Button>
        </Card.Content>
      </Card>
      <Card mode="contained">
        <Card.Content>
          <Text variant="titleMedium">Settings</Text>
          <List.Item title="Dark Mode" right={() => <Switch value={isDarkMode} onValueChange={setDarkMode} />} />
          <Divider />
          <List.Item title="Currency" description={currency} right={() => <Button onPress={() => setCurrency(currency === 'PHP' ? 'USD' : 'PHP')}>Change</Button>} />
          <Divider />
          <List.Item title="Notifications" right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />} />
          <Button mode="contained-tonal" icon="logout" onPress={handleLogout}>Logout</Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}

