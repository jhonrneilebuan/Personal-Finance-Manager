import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, View, Animated } from 'react-native';
import { Button, Card, Text, TextInput, HelperText } from 'react-native-paper';
import { Svg, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { z } from 'zod';
import { authApi } from '@/services/auth.service';

const schema = z.object({ email: z.string().email() });

export default function ForgotPassword() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, []);

  const onSubmit = handleSubmit(async ({ email }) => {
    await authApi.forgotPassword(email);
    router.replace('/(auth)/login');
  });

  return (
    <View style={styles.root}>
      {/* Background */}
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#080B11" />
            <Stop offset="50%" stopColor="#111625" />
            <Stop offset="100%" stopColor="#05080E" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bgGrad)" />
      </Svg>
      <View style={styles.glowBlue} />
      <View style={styles.glowIndigo} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[styles.shell, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {/* Icon badge */}
          <View style={styles.iconWrap}>
            <View style={styles.iconBadge}>
              <MaterialCommunityIcons name="lock-reset" size={26} color="#0A84FF" />
            </View>
            <Text style={styles.iconTitle}>Forgot Password</Text>
            <Text style={styles.iconSub}>We'll send a reset link to your email.</Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.form}>
              <View style={styles.formHeader}>
                <View style={styles.formBadge}>
                  <MaterialCommunityIcons name="lock-reset" size={13} color="#0A84FF" />
                  <Text style={styles.formBadgeText}>Reset Password</Text>
                </View>
                <Text style={styles.title}>Reset password</Text>
                <Text style={styles.caption}>Enter your email to receive a reset link.</Text>
              </View>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TextInput
                      left={<TextInput.Icon icon="email-outline" color="rgba(255,255,255,0.45)" />}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      mode="outlined"
                      label="Email"
                      value={value}
                      onChangeText={onChange}
                      error={!!errors.email}
                      textColor="#FFFFFF"
                      activeOutlineColor="#0A84FF"
                      outlineColor="rgba(255,255,255,0.12)"
                      style={styles.textInput}
                      theme={{ roundness: 12, colors: { background: 'transparent' } }}
                    />
                    <HelperText type="error" visible={!!errors.email} style={styles.errorText}>
                      Enter a valid email address.
                    </HelperText>
                  </View>
                )}
              />

              <Button
                mode="contained"
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                loading={isSubmitting}
                disabled={isSubmitting}
                onPress={onSubmit}
              >
                Send reset link
              </Button>

              <View style={styles.centerLink}>
                <Link href="/(auth)/login" style={styles.linkTextHighlight}>← Back to login</Link>
              </View>
            </Card.Content>
          </Card>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080B11',
  },
  kav: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  glowBlue: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#0A84FF',
    opacity: 0.12,
  },
  glowIndigo: {
    position: 'absolute',
    bottom: -90,
    left: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#5E5CE6',
    opacity: 0.11,
  },
  shell: { gap: 20, maxWidth: 440, alignSelf: 'center', width: '100%' },

  // Icon section
  iconWrap: { alignItems: 'center', gap: 6 },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderColor: 'rgba(10,132,255,0.25)',
    borderRadius: 20,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    width: 64,
    marginBottom: 4,
  },
  iconTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  iconSub: { color: 'rgba(255,255,255,0.48)', fontSize: 13, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: 'rgba(21,28,45,0.72)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.32,
    shadowRadius: 22,
    elevation: 8,
    overflow: 'hidden',
  },
  form: { gap: 10, paddingHorizontal: 20, paddingVertical: 22 },

  formHeader: { gap: 4, marginBottom: 4 },
  formBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderColor: 'rgba(10,132,255,0.22)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  formBadgeText: { color: '#0A84FF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  caption: { color: 'rgba(255,255,255,0.48)', fontSize: 13 },

  textInput: { backgroundColor: 'rgba(255,255,255,0.02)' },
  errorText: { color: '#FF453A', fontSize: 12, marginLeft: 2, marginTop: -2 },

  submitButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: { height: 48 },
  centerLink: { alignItems: 'center', marginTop: 4 },
  linkTextHighlight: { color: '#0A84FF', fontSize: 13, fontWeight: '700' },
});
