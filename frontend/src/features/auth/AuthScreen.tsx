import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';
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
        <Text variant="displaySmall">PesoPilot</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Manage income, expenses, budgets, and reports in one clean workspace.</Text>
      </View>
      <Card mode="contained" style={styles.card}>
        <Card.Content style={styles.form}>
          <Text variant="titleLarge">{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>
          {mode === 'register' ? (
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Full name" value={value} onChangeText={onChange} error={!!errors.fullName} />
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput autoCapitalize="none" keyboardType="email-address" label="Email" value={value} onChangeText={onChange} error={!!errors.email} />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput secureTextEntry label="Password" value={value} onChangeText={onChange} error={!!errors.password} />
            )}
          />
          <Button mode="contained" loading={isSubmitting} disabled={isSubmitting} onPress={onSubmit}>
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>
          {mode === 'login' ? (
            <View style={styles.links}>
              <Link href="/(auth)/forgot-password">Forgot password?</Link>
              <Link href="/(auth)/register">Create an account</Link>
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
  card: { borderRadius: 8 },
  form: { gap: 14 },
  hero: { gap: 8, paddingVertical: 28 },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  subtitle: { opacity: 0.7 },
});
