import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Button, Card, HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { palette } from '@/theme/theme';

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
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
  const setSession = useAuthStore((state) => state.setSession);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const schema = mode === 'login' ? loginSchema : registerSchema;
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthForm>({
    resolver: zodResolver(schema) as unknown as Resolver<AuthForm>,
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const session = mode === 'login'
      ? await authApi.login({ email: values.email, password: values.password })
      : await authApi.register({ fullName: values.fullName, email: values.email, password: values.password });
    await setSession(session);
    router.replace('/(tabs)/dashboard');
  });

  return (
    <Screen>
      <View style={[styles.shell, isWide ? styles.shellWide : undefined]}>
        <View style={[styles.brandPanel, isWide ? styles.brandPanelWide : undefined, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.brandTop}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="wallet-bifold-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.brandBadge}>{mode === 'login' ? 'Welcome back' : 'Start tracking'}</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text variant="displaySmall" style={styles.brand}>PesoPilot</Text>
            <Text variant="bodyLarge" style={styles.subtitle}>A clean wallet workspace for spending, budgets, and AI planning.</Text>
          </View>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={22} color="#FFFFFF" />
              <Text style={styles.metricText}>Insights</Text>
            </View>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="robot-outline" size={22} color="#FFFFFF" />
              <Text style={styles.metricText}>AI Planner</Text>
            </View>
            <View style={styles.metric}>
              <MaterialCommunityIcons name="shield-check-outline" size={22} color="#FFFFFF" />
              <Text style={styles.metricText}>Private</Text>
            </View>
          </View>
        </View>

        <Card mode="elevated" style={styles.card}>
          <Card.Content style={styles.form}>
            <View style={styles.formHeader}>
              <Text variant="headlineSmall" style={styles.title}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
              <Text style={styles.caption}>{mode === 'login' ? 'Continue to your finance dashboard.' : 'Set up your personal finance profile.'}</Text>
            </View>
            {mode === 'register' ? (
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <TextInput left={<TextInput.Icon icon="account-outline" />} mode="outlined" label="Full name" value={value} onChangeText={onChange} error={!!errors.fullName} />
                    <HelperText type="error" visible={!!errors.fullName}>Enter at least 2 characters.</HelperText>
                  </View>
                )}
              />
            ) : null}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput left={<TextInput.Icon icon="email-outline" />} autoCapitalize="none" keyboardType="email-address" mode="outlined" label="Email" value={value} onChangeText={onChange} error={!!errors.email} />
                  <HelperText type="error" visible={!!errors.email}>Enter a valid email address.</HelperText>
                </View>
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput
                    left={<TextInput.Icon icon="lock-outline" />}
                    right={<TextInput.Icon icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} onPress={() => setPasswordVisible((visible) => !visible)} />}
                    secureTextEntry={!isPasswordVisible}
                    mode="outlined"
                    label="Password"
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.password}
                  />
                  <HelperText type="error" visible={!!errors.password}>Password must be at least 8 characters.</HelperText>
                </View>
              )}
            />
            <Button icon={mode === 'login' ? 'login' : 'account-plus-outline'} mode="contained" contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={onSubmit}>
              {mode === 'login' ? 'Login' : 'Create account'}
            </Button>
            {mode === 'login' ? (
              <View style={styles.links}>
                <Link href="/(auth)/forgot-password">Forgot password?</Link>
                <Link href="/(auth)/register">Create account</Link>
              </View>
            ) : (
              <View style={styles.centerLink}>
                <Link href="/(auth)/login">Already have an account?</Link>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { color: '#FFFFFF', fontWeight: '900', letterSpacing: 0 },
  brandBadge: { backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8, color: '#FFFFFF', fontWeight: '900', overflow: 'hidden', paddingHorizontal: 11, paddingVertical: 7 },
  brandPanel: { borderRadius: 8, gap: 26, justifyContent: 'space-between', minHeight: 300, overflow: 'hidden', padding: 22 },
  brandPanelWide: { flex: 0.9 },
  brandTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  buttonContent: { height: 52 },
  caption: { color: palette.slate },
  card: { borderRadius: 8, flex: 1 },
  centerLink: { alignItems: 'center' },
  form: { gap: 10, padding: 22 },
  formHeader: { gap: 5, marginBottom: 6 },
  heroCopy: { gap: 9 },
  links: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  logo: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 8, height: 62, justifyContent: 'center', width: 62 },
  metric: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, flex: 1, gap: 7, minWidth: 92, padding: 12 },
  metricText: { color: '#FFFFFF', fontWeight: '800' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shell: { gap: 16, paddingTop: 18 },
  shellWide: { alignItems: 'stretch', flexDirection: 'row' },
  subtitle: { color: 'rgba(255,255,255,0.78)', maxWidth: 460 },
  title: { fontWeight: '800' },
});
