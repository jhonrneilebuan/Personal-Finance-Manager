import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { Svg, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { z } from 'zod';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { palette } from '@/theme/theme';
import pesoPilotLogo from '../../assets/brand/peso-pilot-logo.png';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().min(2),
});

type AuthScreenProps = {
  mode: 'login' | 'register';
};

type AuthForm = {
  fullName: string;
  email: string;
  password: string;
};

export function AuthScreen({ mode }: AuthScreenProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const setSession = useAuthStore((state) => state.setSession);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const schema = mode === 'login' ? loginSchema : registerSchema;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthForm>({
    resolver: zodResolver(schema) as unknown as Resolver<AuthForm>,
    defaultValues: { fullName: '', email: '', password: '' },
  });

  // Entry animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -5, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [mode]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');
    try {
      const session =
        mode === 'login'
          ? await authApi.login({ email: values.email, password: values.password })
          : await authApi.register({ fullName: values.fullName, email: values.email, password: values.password });
      await setSession(session);
      router.replace('/(tabs)/dashboard');
    } catch {
      setSubmitError(
        mode === 'login'
          ? 'Invalid email or password. If you switched to Neon, create your account again first.'
          : 'Unable to create account. Try another email or check the backend server.',
      );
    }
  });

  return (
    <View style={styles.root}>
      {/* Background gradient */}
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
      <View style={styles.glowBlue} />
      <View style={styles.glowIndigo} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View
          style={[
            styles.shell,
            isWide && styles.shellWide,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Wide layout: show full logo panel on left ── */}
          {isWide && (
            <View style={styles.logoPanelWide}>
              <Animated.View style={[styles.logoFrameLarge, { transform: [{ translateY: floatAnim }] }]}>
                <Image source={pesoPilotLogo} resizeMode="contain" style={styles.logoImageLarge} />
              </Animated.View>
              <Text style={styles.brandKicker}>PisoPilot</Text>
              <Text style={styles.brandText}>Track money, plan budgets, and let AI help decide what to buy first.</Text>
              <View style={styles.chips}>
                {[
                  { icon: 'chart-line', label: 'Reports' },
                  { icon: 'robot-outline', label: 'AI Planner' },
                  { icon: 'shield-check-outline', label: 'Secure' },
                ].map((c) => (
                  <View key={c.label} style={styles.chip}>
                    <MaterialCommunityIcons name={c.icon as never} size={16} color={palette.leaf} />
                    <Text style={styles.chipText}>{c.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Form Card ── */}
          <Card style={[styles.card, isWide && styles.cardWide]}>
            <Card.Content style={styles.form}>
              {/* Compact logo row - only on mobile */}
              {!isWide && (
                <View style={styles.mobileLogoBlock}>
                  <Animated.View style={[styles.logoFrameSmall, { transform: [{ translateY: floatAnim }] }]}>
                    <Image source={pesoPilotLogo} resizeMode="contain" style={styles.logoImageSmall} />
                  </Animated.View>
                  <Text style={styles.mobileBrandName}>PisoPilot</Text>
                  <Text style={styles.mobileBrandSub}>Personal Finance AI</Text>
                </View>
              )}

              {/* Form header */}
              <View style={styles.formHeader}>
                <View style={styles.formBadge}>
                  <MaterialCommunityIcons
                    name={mode === 'login' ? 'login' : 'account-plus-outline'}
                    size={13}
                    color={palette.leaf}
                  />
                  <Text style={styles.formBadgeText}>{mode === 'login' ? 'Login' : 'New account'}</Text>
                </View>
                <Text style={styles.title}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
                <Text style={styles.caption}>
                  {mode === 'login'
                    ? 'Continue to your finance dashboard.'
                    : 'Set up your personal finance profile.'}
                </Text>
              </View>

              {/* Full Name - register only */}
              {mode === 'register' && (
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <TextInput
                        left={<TextInput.Icon icon="account-outline" color="rgba(255,255,255,0.45)" />}
                        mode="outlined"
                        label="Full name"
                        value={value}
                        onChangeText={onChange}
                        error={!!errors.fullName}
                        textColor="#FFFFFF"
                        activeOutlineColor={palette.leaf}
                        outlineColor="rgba(255,255,255,0.12)"
                        style={styles.textInput}
                        theme={{ roundness: 12, colors: { background: 'transparent' } }}
                      />
                      <HelperText type="error" visible={!!errors.fullName} style={styles.errorText}>
                        Enter at least 2 characters.
                      </HelperText>
                    </View>
                  )}
                />
              )}

              {/* Email */}
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
                      activeOutlineColor={palette.leaf}
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

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TextInput
                      left={<TextInput.Icon icon="lock-outline" color="rgba(255,255,255,0.45)" />}
                      right={
                        <TextInput.Icon
                          icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                          color="rgba(255,255,255,0.45)"
                          onPress={() => setPasswordVisible((v) => !v)}
                        />
                      }
                      secureTextEntry={!isPasswordVisible}
                      mode="outlined"
                      label="Password"
                      value={value}
                      onChangeText={onChange}
                      error={!!errors.password}
                      textColor="#FFFFFF"
                      activeOutlineColor={palette.leaf}
                      outlineColor="rgba(255,255,255,0.12)"
                      style={styles.textInput}
                      theme={{ roundness: 12, colors: { background: 'transparent' } }}
                    />
                    <HelperText type="error" visible={!!errors.password} style={styles.errorText}>
                      Password must be at least 8 characters.
                    </HelperText>
                  </View>
                )}
              />

              {/* Submit */}
              <Button
                icon={mode === 'login' ? 'login' : 'account-plus-outline'}
                mode="contained"
                style={styles.submitButton}
                contentStyle={styles.buttonContent}
                loading={isSubmitting}
                disabled={isSubmitting}
                onPress={onSubmit}
              >
                {mode === 'login' ? 'Login' : 'Create account'}
              </Button>
              {submitError ? (
                <HelperText type="error" visible style={styles.submitError}>
                  {submitError}
                </HelperText>
              ) : null}

              {/* Navigation links */}
              {mode === 'login' ? (
                <View style={styles.links}>
                  <Link href="/(auth)/forgot-password" style={styles.linkText}>Forgot password?</Link>
                  <Link href="/(auth)/register" style={styles.linkTextHighlight}>Create account</Link>
                </View>
              ) : (
                <View style={styles.centerLink}>
                  <Link href="/(auth)/login" style={styles.linkTextHighlight}>Already have an account?</Link>
                </View>
              )}
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
    backgroundColor: '#031B3A',
  },
  kav: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  glowBlue: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: palette.leaf,
    opacity: 0.12,
  },
  glowIndigo: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: palette.forest,
    opacity: 0.11,
  },

  // Shell
  shell: {
    gap: 16,
  },
  shellWide: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 24,
    maxWidth: 880,
    alignSelf: 'center',
    width: '100%',
  },

  // Wide logo panel
  logoPanelWide: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    paddingRight: 8,
  },
  logoFrameLarge: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    justifyContent: 'center',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
    width: 158,
    height: 158,
  },
  logoImageLarge: { height: '100%', width: '100%' },
  brandKicker: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 0.4,
  },
  brandText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 280,
    textAlign: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: {
    alignItems: 'center',
    backgroundColor: 'rgba(77,163,255,0.16)',
    borderColor: 'rgba(77,163,255,0.28)',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: { color: palette.leaf, fontSize: 12, fontWeight: '700' },

  // Mobile logo block - centered column, no background
  mobileLogoBlock: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  logoFrameSmall: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    marginBottom: 4,
  },
  logoImageSmall: { height: '100%', width: '100%' },
  mobileBrandName: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', letterSpacing: 0.2, textAlign: 'center' },
  mobileBrandSub: { color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: '500', textAlign: 'center' },

  // Form card
  card: {
    backgroundColor: 'rgba(8,18,34,0.78)',
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
  cardWide: { flex: 1 },
  form: {
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },

  // Form header
  formHeader: { gap: 4, marginBottom: 4 },
  formBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(77,163,255,0.16)',
    borderColor: 'rgba(77,163,255,0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  formBadgeText: { color: palette.leaf, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  caption: { color: 'rgba(255,255,255,0.48)', fontSize: 13 },

  // Inputs
  textInput: { backgroundColor: 'rgba(255,255,255,0.02)' },
  errorText: { color: '#FF453A', fontSize: 12, marginLeft: 2, marginTop: -2 },

  // Submit
  submitButton: {
    backgroundColor: palette.forest,
    borderRadius: 16,
    marginTop: 4,
    shadowColor: palette.forest,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: { height: 48 },
  submitError: { color: '#FF453A', fontSize: 12, lineHeight: 17, marginTop: -2 },

  // Links
  links: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  centerLink: { alignItems: 'center', marginTop: 4 },
  linkText: { color: 'rgba(255,255,255,0.48)', fontSize: 13, fontWeight: '600' },
  linkTextHighlight: { color: palette.leaf, fontSize: 13, fontWeight: '700' },
});
