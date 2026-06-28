import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

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
  const setSession = useAuthStore((state) => state.setSession);
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
      <View style={styles.hero}>
        <View style={[styles.logo, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="wallet-bifold-outline" size={34} color={theme.colors.primary} />
        </View>
        <View style={styles.heroCopy}>
          <Text variant="displaySmall" style={styles.brand}>PesoPilot</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Track cashflow, budgets, and savings with a clean mobile-first workspace.</Text>
        </View>
      </View>

      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.form}>
          <View style={styles.formHeader}>
            <Text variant="headlineSmall" style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
            <Text style={styles.caption}>{mode === 'login' ? 'Sign in to continue your budget plan.' : 'Start with a secure finance profile.'}</Text>
          </View>
          {mode === 'register' ? (
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput left={<TextInput.Icon icon="account-outline" />} mode="outlined" label="Full name" value={value} onChangeText={onChange} error={!!errors.fullName} />
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput left={<TextInput.Icon icon="email-outline" />} autoCapitalize="none" keyboardType="email-address" mode="outlined" label="Email" value={value} onChangeText={onChange} error={!!errors.email} />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput left={<TextInput.Icon icon="lock-outline" />} secureTextEntry mode="outlined" label="Password" value={value} onChangeText={onChange} error={!!errors.password} />
            )}
          />
          <Button icon={mode === 'login' ? 'login' : 'account-plus-outline'} mode="contained" contentStyle={styles.buttonContent} loading={isSubmitting} disabled={isSubmitting} onPress={onSubmit}>
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>
          {mode === 'login' ? (
            <View style={styles.links}>
              <Link href="/(auth)/forgot-password">Forgot password?</Link>
              <Link href="/(auth)/register">Create account</Link>
            </View>
          ) : (
            <Link href="/(auth)/login">Already have an account?</Link>
          )}
        </Card.Content>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { fontWeight: '900', letterSpacing: 0 },
  buttonContent: { height: 50 },
  caption: { opacity: 0.62 },
  card: { borderRadius: 8 },
  form: { gap: 14, padding: 20 },
  formHeader: { gap: 4, marginBottom: 4 },
  hero: { alignItems: 'center', gap: 16, paddingTop: 28, paddingBottom: 8 },
  heroCopy: { alignItems: 'center', gap: 8 },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  logo: { alignItems: 'center', borderRadius: 8, height: 72, justifyContent: 'center', width: 72 },
  subtitle: { maxWidth: 460, opacity: 0.68, textAlign: 'center' },
  title: { fontWeight: '800' },
});
