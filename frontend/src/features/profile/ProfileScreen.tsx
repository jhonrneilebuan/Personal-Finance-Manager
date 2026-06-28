import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Snackbar, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import { useAsyncData } from '@/hooks/useAsyncData';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { useSettingsStore } from '@/store/settings.store';
import { palette } from '@/theme/theme';

type SettingRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  label: string;
  value?: string;
  right: React.ReactNode;
  onPress?: () => void;
};

function SettingRow({ icon, iconBg, label, value, right, onPress }: SettingRowProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.colors.surfaceVariant }]} onPress={onPress} activeOpacity={onPress ? 0.75 : 1} disabled={!onPress}>
      <View style={[styles.settingIcon, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={17} color="#FFFFFF" />
      </View>
      <View style={styles.settingLabel}>
        <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>{label}</Text>
        {value ? <Text style={[styles.settingValue, { color: theme.colors.onSurfaceVariant }]}>{value}</Text> : null}
      </View>
      {right}
    </TouchableOpacity>
  );
}

export function ProfileScreen() {
  const theme = useTheme();
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

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.outlineVariant,
      borderWidth: theme.dark ? 1 : 0,
    },
  ];

  return (
    <Screen refreshing={profile.isLoading} onRefresh={profile.refresh}>
      <PageHeroCard
        icon="account-circle-outline"
        title={activeUser?.fullName ?? 'PesoPilot User'}
        subtitle={activeUser?.email ?? 'No email loaded'}
        caption="My Wallet"
        color={palette.indigo}
      />

      {/* ── Update Profile ────────────────────────────── */}
      <Card style={cardStyle}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="account-edit-outline" title="Update Profile" subtitle="Keep your account details current." color={palette.indigo} />
          <TextInput
            left={<TextInput.Icon icon="account-outline" color="rgba(120,120,120,0.5)" />}
            mode="outlined"
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            theme={{ roundness: 12 }}
          />
          <TextInput
            left={<TextInput.Icon icon="email-outline" color="rgba(120,120,120,0.5)" />}
            mode="outlined"
            label="Email"
            value={activeUser?.email ?? ''}
            disabled
            theme={{ roundness: 12 }}
          />
          <Button
            icon="content-save"
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            mode="contained"
            loading={isSavingProfile}
            disabled={isSavingProfile || fullName.trim().length < 2}
            onPress={handleSaveProfile}
          >
            Save Profile
          </Button>
        </Card.Content>
      </Card>

      {/* ── Change Password ───────────────────────────── */}
      <Card style={cardStyle}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="shield-lock-outline" title="Change Password" subtitle="Use at least 8 characters for the new password." color={palette.orange} />
          <TextInput
            left={<TextInput.Icon icon="lock-outline" color="rgba(120,120,120,0.5)" />}
            mode="outlined"
            label="Current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            theme={{ roundness: 12 }}
          />
          <TextInput
            left={<TextInput.Icon icon="shield-lock-outline" color="rgba(120,120,120,0.5)" />}
            mode="outlined"
            label="New password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            theme={{ roundness: 12 }}
          />
          <Button
            icon="lock-reset"
            style={styles.passwordButton}
            contentStyle={styles.buttonContent}
            mode="contained"
            loading={isChangingPassword}
            disabled={isChangingPassword || currentPassword.length < 1 || newPassword.length < 8}
            onPress={handleChangePassword}
          >
            Update Password
          </Button>
        </Card.Content>
      </Card>

      {/* ── App Settings ──────────────────────────────── */}
      <Card style={cardStyle}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="cog-outline" title="App Settings" subtitle="Personalise theme, currency and alerts." color={palette.blue} />
          <View style={styles.settingsGroup}>
            <SettingRow
              icon="theme-light-dark"
              iconBg="#5E5CE6"
              label="Dark Mode"
              value={isDarkMode ? 'On' : 'Off'}
              right={<Switch value={isDarkMode} onValueChange={setDarkMode} trackColor={{ true: '#5E5CE6' }} />}
            />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <SettingRow
              icon="currency-php"
              iconBg="#FF9F0A"
              label="Currency"
              value={currency}
              onPress={() => setCurrency(currency === 'PHP' ? 'USD' : 'PHP')}
              right={
                <View style={styles.chevronWrap}>
                  <Text style={[styles.currencyBadge, { color: '#FF9F0A' }]}>{currency}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
                </View>
              }
            />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <SettingRow
              icon="bell-outline"
              iconBg="#34C759"
              label="Notifications"
              value={notificationsEnabled ? 'Enabled' : 'Disabled'}
              right={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: '#34C759' }} />}
            />
          </View>
        </Card.Content>
      </Card>

      {/* ── Logout ────────────────────────────────────── */}
      <TouchableOpacity style={[styles.logoutCard, { backgroundColor: 'rgba(255,69,58,0.07)', borderColor: 'rgba(255,69,58,0.18)', borderWidth: 1 }]} onPress={handleLogout} activeOpacity={0.8}>
        <View style={styles.logoutIconWrap}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF453A" />
        </View>
        <Text style={styles.logoutText}>Logout</Text>
        <MaterialCommunityIcons name="chevron-right" size={18} color="#FF453A" style={{ opacity: 0.6 }} />
      </TouchableOpacity>

      <Snackbar visible={!!notice} onDismiss={() => setNotice('')} duration={2400}>{notice}</Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Cards
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: { gap: 14, paddingVertical: 18 },

  // Buttons
  buttonContent: { height: 48 },
  saveButton: {
    backgroundColor: '#5E5CE6',
    borderRadius: 12,
    shadowColor: '#5E5CE6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 2,
  },
  passwordButton: {
    backgroundColor: '#FF9F0A',
    borderRadius: 12,
    shadowColor: '#FF9F0A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 2,
  },

  // Settings group
  settingsGroup: { borderRadius: 14, overflow: 'hidden' },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  settingIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  settingLabel: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600', letterSpacing: -0.1 },
  settingValue: { fontSize: 12, marginTop: 1, opacity: 0.6 },
  separator: { height: 1, marginLeft: 58, opacity: 0.4 },
  chevronWrap: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  currencyBadge: { fontSize: 14, fontWeight: '800' },

  // Logout
  logoutCard: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 4,
  },
  logoutIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,69,58,0.13)',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  logoutText: { color: '#FF453A', flex: 1, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
});
