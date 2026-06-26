import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Button, Card, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { authApi } from '@/services/auth.service';

const schema = z.object({ email: z.string().email() });

export default function ForgotPassword() {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async ({ email }) => {
    await authApi.forgotPassword(email);
    router.replace('/(auth)/login');
  });

  return (
    <Screen>
      <Card mode="contained">
        <Card.Content style={{ gap: 16 }}>
          <Text variant="titleLarge">Reset password</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput autoCapitalize="none" keyboardType="email-address" label="Email" value={value} onChangeText={onChange} />
            )}
          />
          <Button mode="contained" loading={isSubmitting} onPress={onSubmit}>Send reset link</Button>
        </Card.Content>
      </Card>
    </Screen>
  );
}

