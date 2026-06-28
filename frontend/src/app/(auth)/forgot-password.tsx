import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View, Animated } from 'react-native';
import { Button, Card, Text, TextInput, HelperText } from 'react-native-paper';
import { Svg, Rect, LinearGradient, Stop, Defs } from 'react-native-svg';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { authApi } from '@/services/auth.service';

const schema = z.object({ email: z.string().email() });

export default function ForgotPassword() {
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({ 
    resolver: zodResolver(schema), 
    defaultValues: { email: '' } 
  });

  // Entry animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(25)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSubmit = handleSubmit(async ({ email }) => {
    await authApi.forgotPassword(email);
    router.replace('/(auth)/login');
  });

  return (
    <Screen style={styles.screenBg} contentStyle={styles.screenContent} contentContainerStyle={styles.screenScroll}>
      {/* Background Mesh Gradient and Blobs */}
      <View style={StyleSheet.absoluteFill}>
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
      </View>

      <Animated.View style={[
        styles.shell,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <Card style={styles.card}>
          <Card.Content style={styles.form}>
            <View style={styles.formHeader}>
              <View style={styles.formBadge}>
                <MaterialCommunityIcons name="lock-reset" size={14} color="#0A84FF" />
                <Text style={styles.formBadgeText}>Reset Password</Text>
              </View>
              <Text variant="headlineSmall" style={styles.title}>Reset password</Text>
              <Text style={styles.caption}>Enter your email to receive a password reset link.</Text>
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    left={<TextInput.Icon icon="email-outline" color="rgba(255, 255, 255, 0.5)" />}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    mode="outlined"
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    error={!!errors.email}
                    textColor="#FFFFFF"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    activeOutlineColor="#0A84FF"
                    outlineColor="rgba(255, 255, 255, 0.12)"
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
              <Link href="/(auth)/login" style={styles.linkTextHighlight}>Back to login</Link>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenBg: {
    backgroundColor: '#080B11',
  },
  screenContent: {
    maxWidth: 440,
    padding: 16,
    paddingTop: 80,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  screenScroll: {
    paddingBottom: 24,
  },
  glowBlue: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0A84FF',
    opacity: 0.12,
  },
  glowIndigo: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: '#5E5CE6',
    opacity: 0.11,
  },
  shell: {
    gap: 24,
  },
  card: {
    backgroundColor: 'rgba(21, 28, 45, 0.65)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  form: {
    gap: 16,
    padding: 24,
  },
  formBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.22)',
  },
  formBadgeText: {
    color: '#0A84FF',
    fontWeight: '800',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  formHeader: {
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  caption: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  inputContainer: {
    gap: 2,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  errorText: {
    color: '#FF453A',
    marginTop: -2,
    marginLeft: 2,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonContent: {
    height: 50,
  },
  centerLink: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkTextHighlight: {
    color: '#0A84FF',
    fontSize: 14,
    fontWeight: '700',
  },
});


