import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Button, Card, Snackbar, Switch, Text, TextInput, useTheme } from 'react-native-paper';
import { PageHeroCard } from '@/components/PageHeroCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { StateView } from '@/components/StateView';
import {
  disablePisoPilotNotifications,
  enablePisoPilotNotifications,
  type NotificationPermissionState,
} from '@/features/notifications/notifications';
import { apiBaseUrl } from '@/services/api';
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

const getInitials = (name?: string) =>
  (name ?? 'PisoPilot User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'PP';

const resolveMediaUrl = (value?: string | null) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;
  return `${apiBaseUrl.replace(/\/api$/, '')}${value.startsWith('/') ? value : `/${value}`}`;
};

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
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>('unknown');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (profile.data) {
      setFullName(profile.data.fullName);
      setUser(profile.data);
      setNotificationsEnabled(Boolean(profile.data.notificationsEnabled));
      setNotificationPermission(profile.data.notificationPermission ?? 'unknown');
    }
  }, [profile.data, setNotificationsEnabled, setUser]);

  const activeUser = profile.data ?? user;
  const avatarUri = resolveMediaUrl(activeUser?.avatar);

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

  const handleUploadAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setNotice('Allow photo access to update your avatar');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        mediaTypes: ['images'],
        quality: 0.82,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);

      setIsUploadingAvatar(true);
      const updated = await authApi.uploadAvatar(formData);
      await setUser(updated);
      await profile.refresh();
      setNotice('Profile photo updated');
    } catch {
      setNotice('Unable to update profile photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    setIsUpdatingNotifications(true);
    try {
      const permission = enabled ? await enablePisoPilotNotifications() : await disablePisoPilotNotifications();
      const shouldEnable = enabled && permission === 'granted';
      const updated = await authApi.updateSettings({
        notificationsEnabled: shouldEnable,
        notificationPermission: permission,
      });

      setNotificationPermission(permission);
      setNotificationsEnabled(Boolean(updated.notificationsEnabled));
      await setUser(updated);
      setNotice(shouldEnable ? 'Notifications enabled' : permission === 'denied' ? 'Notifications blocked in phone settings' : 'Notifications disabled');
    } catch {
      setNotificationsEnabled(!enabled);
      setNotice('Unable to update notifications');
    } finally {
      setIsUpdatingNotifications(false);
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
        title={activeUser?.fullName ?? 'PisoPilot User'}
        subtitle={activeUser?.email ?? 'No email loaded'}
        caption="My Wallet"
        color={palette.forest}
        mascot
      />

      <Card style={cardStyle}>
        <Card.Content style={styles.avatarContent}>
          <TouchableOpacity style={styles.avatarWrap} onPress={handleUploadAvatar} activeOpacity={0.85} disabled={isUploadingAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{getInitials(activeUser?.fullName)}</Text>
              </View>
            )}
            <View style={styles.avatarEdit}>
              {isUploadingAvatar ? (
                <ActivityIndicator size={16} color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="camera-outline" size={16} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.avatarCopy}>
            <Text style={[styles.avatarTitle, { color: theme.colors.onSurface }]}>{activeUser?.fullName ?? 'PisoPilot User'}</Text>
            <Text style={[styles.avatarSubtitle, { color: theme.colors.onSurfaceVariant }]}>{activeUser?.email ?? 'No email loaded'}</Text>
            <Button
              icon="image-edit-outline"
              mode="contained-tonal"
              compact
              textColor={palette.forest}
              disabled={isUploadingAvatar}
              loading={isUploadingAvatar}
              style={styles.avatarButton}
              onPress={handleUploadAvatar}
            >
              Update Photo
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* ── Update Profile ────────────────────────────── */}
      <Card style={cardStyle}>
        <Card.Content style={styles.content}>
          <SectionHeader icon="account-edit-outline" title="Update Profile" subtitle="Keep your account details current." color={palette.forest} />
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
          <SectionHeader icon="shield-lock-outline" title="Change Password" subtitle="Use at least 8 characters for the new password." color={palette.forest} />
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
          <SectionHeader icon="cog-outline" title="App Settings" subtitle="Personalise theme, currency and alerts." color={palette.forest} />
          <View style={styles.settingsGroup}>
            <SettingRow
              icon="theme-light-dark"
              iconBg={palette.forest}
              label="Dark Mode"
              value={isDarkMode ? 'On' : 'Off'}
              right={<Switch value={isDarkMode} onValueChange={setDarkMode} trackColor={{ true: palette.forest }} />}
            />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <SettingRow
              icon="currency-php"
              iconBg={palette.orange}
              label="Currency"
              value={currency}
              onPress={() => setCurrency(currency === 'PHP' ? 'USD' : 'PHP')}
              right={
                <View style={styles.chevronWrap}>
                  <Text style={[styles.currencyBadge, { color: palette.orange }]}>{currency}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={theme.colors.onSurfaceVariant} style={{ opacity: 0.5 }} />
                </View>
              }
            />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <SettingRow
              icon="bell-outline"
              iconBg={palette.leaf}
              label="Notifications"
              value={notificationsEnabled ? 'Enabled' : notificationPermission === 'denied' ? 'Blocked by phone settings' : 'Disabled'}
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsToggle}
                  disabled={isUpdatingNotifications}
                  trackColor={{ true: palette.leaf }}
                />
              }
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
  card: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  content: { gap: 14, paddingVertical: 18 },

  avatarButton: { alignSelf: 'flex-start', borderRadius: 12, marginTop: 4 },
  avatarContent: { alignItems: 'center', flexDirection: 'row', gap: 16, paddingVertical: 18 },
  avatarCopy: { flex: 1, gap: 3 },
  avatarEdit: {
    alignItems: 'center',
    backgroundColor: palette.forest,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    bottom: 0,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 30,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#DCEBFF',
    borderRadius: 38,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  avatarImage: {
    borderRadius: 38,
    height: 76,
    width: 76,
  },
  avatarInitials: { color: palette.forest, fontSize: 23, fontWeight: '900', letterSpacing: 0.2 },
  avatarSubtitle: { fontSize: 13, fontWeight: '600', opacity: 0.65 },
  avatarTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  avatarWrap: { borderRadius: 38, height: 76, position: 'relative', width: 76 },

  buttonContent: { height: 48 },
  saveButton: {
    backgroundColor: palette.forest,
    borderRadius: 16,
    shadowColor: palette.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 2,
  },
  passwordButton: {
    backgroundColor: palette.forest,
    borderRadius: 16,
    shadowColor: palette.forest,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 2,
  },

  settingsGroup: { borderRadius: 18, overflow: 'hidden' },
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
