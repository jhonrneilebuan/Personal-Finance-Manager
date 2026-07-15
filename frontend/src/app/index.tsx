import { Redirect } from 'expo-router';
import { StateView } from '@/components/StateView';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { accessToken, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return <StateView loading message="Preparing PisoPilot" />;
  }

  return <Redirect href={accessToken ? '/(tabs)/dashboard' : '/(auth)/login'} />;
}
