import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, Button, Divider, List, Snackbar, Switch, TextInput } from 'react-native-paper';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { palette } from '@/theme/theme';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const { isDarkMode, setDarkMode, currency, setCurrency, notificationsEnabled, setNotificationsEnabled } = useSettingsStore();
  const profile = useAsyncData(useCallback(() => authApi.profile(), []));
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (profile.data) {
      setFullName(profile.data.fullName);
      setUser(profile.data);
    }
  }, [profile.data, setUser]);

  const activeUser = profile.data ?? user;

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({ fullName });
      await setUser(updated);
      setNotice('Profile updated');
    } catch {
      setNotice('Unable to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setNotice('Password updated');
    } catch {
      setNotice('Unable to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (profile.isLoading && !activeUser) {
    return <StateView loading message="Loading profile" />;
  }

  return (
    <Screen refreshing={profile.isLoading} onRefresh={profile.refresh}>
      <PageHeroCard
        icon="account-circle-outline"
        title={activeUser?.fullName ?? 'PesoPilot User'}
        subtitle={activeUser?.email ?? 'No email loaded'}
        caption="My Wallet"
        color={palette.indigo}
      />
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="account-edit-outline" title="Update Profile" subtitle="Keep your account details current." color={palette.indigo} />
          <TextInput left={<TextInput.Icon icon="account-outline" />} mode="outlined" label="Full name" value={fullName} onChangeText={setFullName} />
          <TextInput left={<TextInput.Icon icon="email-outline" />} mode="outlined" label="Email" value={activeUser?.email ?? ''} disabled />
          <Button contentStyle={styles.button} mode="contained" icon="content-save" loading={isSavingProfile} disabled={isSavingProfile || fullName.trim().length < 2} onPress={handleSaveProfile}>Save Profile</Button>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="shield-lock-outline" title="Change Password" subtitle="Use at least 8 characters for the new password." color={palette.orange} />
          <TextInput left={<TextInput.Icon icon="lock-outline" />} mode="outlined" label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
          <TextInput left={<TextInput.Icon icon="shield-lock-outline" />} mode="outlined" label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
          <Button contentStyle={styles.button} mode="outlined" icon="lock-reset" loading={isChangingPassword} disabled={isChangingPassword || currentPassword.length < 1 || newPassword.length < 8} onPress={handleChangePassword}>Update Password</Button>
        </Card.Content>
      </Card>
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="cog-outline" title="Settings" subtitle="Theme, currency, and notifications." color={palette.blue} />
          <List.Item title="Dark Mode" left={(props) => <List.Icon {...props} icon="theme-light-dark" />} right={() => <Switch value={isDarkMode} onValueChange={setDarkMode} />} />
          <Divider />
          <List.Item title="Currency" description={currency} left={(props) => <List.Icon {...props} icon="currency-php" />} right={() => <Button onPress={() => setCurrency(currency === 'PHP' ? 'USD' : 'PHP')}>Change</Button>} />
          <Divider />
          <List.Item title="Notifications" left={(props) => <List.Icon {...props} icon="bell-outline" />} right={() => <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />} />
          <Button contentStyle={styles.button} mode="contained-tonal" icon="logout" onPress={handleLogout}>Logout</Button>
        </Card.Content>
      </Card>
      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2400}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: { height: 46 },
  card: { borderRadius: 8 },
  content: { gap: 13, paddingVertical: 20 },
});
