import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { Svg, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { authApi } from '@/services/auth.service';
import { palette } from '@/theme/theme';

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset token is missing. Open the latest reset link from your email.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authApi.resetPassword({ token, password });
      setMessage(response.message);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => router.replace('/(auth)/login'), 1000);
    } catch {
      setError('Reset link is invalid or expired. Request a new reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#031B3A" />
            <Stop offset="52%" stopColor="#062B5F" />
            <Stop offset="100%" stopColor="#020812" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      </Svg>

      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Card style={styles.card}>
          <Card.Content style={styles.form}>
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name="shield-lock-outline" size={28} color={palette.leaf} />
            </View>
            <Text style={styles.title}>Create new password</Text>
            <Text style={styles.caption}>Enter a new password for your PisoPilot account.</Text>
            <TextInput
              mode="outlined"
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textColor="#FFFFFF"
              activeOutlineColor={palette.leaf}
              outlineColor="rgba(255,255,255,0.12)"
              style={styles.textInput}
              left={<TextInput.Icon icon="lock-outline" color="rgba(255,255,255,0.45)" />}
              theme={{ roundness: 12, colors: { background: 'transparent' } }}
            />
            <TextInput
              mode="outlined"
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textColor="#FFFFFF"
              activeOutlineColor={palette.leaf}
              outlineColor="rgba(255,255,255,0.12)"
              style={styles.textInput}
              left={<TextInput.Icon icon="lock-check-outline" color="rgba(255,255,255,0.45)" />}
              theme={{ roundness: 12, colors: { background: 'transparent' } }}
            />
            <Button mode="contained" style={styles.submitButton} contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={submit}>
              Reset Password
            </Button>
            {message ? <HelperText type="info" visible style={styles.successText}>{message}</HelperText> : null}
            {error ? <HelperText type="error" visible style={styles.errorText}>{error}</HelperText> : null}
            <View style={styles.centerLink}>
              <Link href="/(auth)/login" style={styles.linkTextHighlight}>Back to login</Link>
            </View>
          </Card.Content>
        </Card>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#031B3A', flex: 1 },
  kav: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  card: {
    alignSelf: 'center',
    backgroundColor: 'rgba(8,18,34,0.78)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 440,
    width: '100%',
  },
  form: { gap: 12, paddingHorizontal: 20, paddingVertical: 24 },
  iconBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(77,163,255,0.16)',
    borderColor: 'rgba(77,163,255,0.28)',
    borderRadius: 20,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  caption: { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  textInput: { backgroundColor: 'rgba(255,255,255,0.02)' },
  submitButton: { backgroundColor: palette.forest, borderRadius: 16, marginTop: 4 },
  buttonContent: { height: 48 },
  successText: { color: palette.leaf, fontSize: 12, lineHeight: 17 },
  errorText: { color: '#FF453A', fontSize: 12, lineHeight: 17 },
  centerLink: { alignItems: 'center', marginTop: 4 },
  linkTextHighlight: { color: palette.leaf, fontSize: 13, fontWeight: '700' },
});
