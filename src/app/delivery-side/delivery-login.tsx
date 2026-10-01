import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  FirstAid,
  Lock,
  Phone,
} from 'phosphor-react-native';
import { useCallback, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_BASE_URL = 'http://192.168.0.101:3000';
const REQUEST_TIMEOUT_MS = 15000;

/* ---------- Screen ---------- */

export default function DeliveryLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const passwordRef = useRef<TextInput>(null);

  const canLogin =
    phone.trim().length >= 10 && password.length > 0;

  /* ---------- Back ---------- */

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/role-selection');
    }
  };

  /* ---------- Login ---------- */

  const handleLogin = async () => {
    if (!canLogin || loading) return;

    Keyboard.dismiss();
    setLoading(true);

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/delivery/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phone.trim(),
            password,
          }),
          signal: controller.signal,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        Alert.alert(
          'Login failed',
          data?.message ||
          'Invalid phone number or password.'
        );

        return;
      }

      /*
       * Save the authenticated delivery agent.
       *
       * The backend should return:
       * user
       * token
       * deliveryAgentId
       * profilePhoto/profile photo data if supported
       */
      await AsyncStorage.setItem(
        'medbuy_user',
        JSON.stringify({
          ...data.user,
          token: data.token,
          role: 'delivery_agent',
        })
      );

      router.replace('/delivery-side/delivery-home');
    } catch (error: any) {
      console.error(
        'Delivery login error:',
        error
      );

      Alert.alert(
        error?.name === 'AbortError'
          ? 'Request timed out'
          : 'Connection error',
        error?.name === 'AbortError'
          ? 'The server took too long to respond. Please try again.'
          : 'Unable to reach the server. Check your connection and try again.'
      );
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  /* ---------- Forgot Password ---------- */

  const handleForgotPassword = () => {
    /*
     * Password reset backend is not connected yet.
     * Keep the UI ready for the future reset flow.
     */
    Alert.alert(
      'Forgot password',
      'Password recovery will be connected here.'
    );
  };

  /* ---------- Button Animation ---------- */

  const pressIn = useCallback(() => {
    Animated.timing(buttonScale, {
      toValue: 0.97,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const pressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      damping: 15,
      stiffness: 350,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}

          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={({ pressed }) => [
              styles.backButton,
              pressed &&
              styles.backButtonPressed,
            ]}
            disabled={loading}
          >
            <ArrowLeft
              size={24}
              color="#1A1512"
              weight="regular"
            />

            <Text style={styles.backText}>
              Back
            </Text>
          </Pressable>

          {/* Header */}

          <View style={styles.header}>
            <View style={styles.logo}>
              <FirstAid
                size={30}
                color="#9A4B23"
                weight="fill"
              />
            </View>

            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in as a Delivery Agent
            </Text>
          </View>

          {/* Form */}

          <View style={styles.form}>
            {/* Phone */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Mobile number
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  phoneFocused &&
                  styles.inputWrapperFocused,
                ]}
              >
                <Phone
                  size={23}
                  color={
                    phoneFocused
                      ? '#9A4B23'
                      : '#6B615A'
                  }
                  weight="regular"
                />

                <TextInput
                  value={phone}
                  onChangeText={(text) =>
                    setPhone(
                      text.replace(
                        /[^0-9]/g,
                        ''
                      )
                    )
                  }
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#9A9189"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={15}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    passwordRef.current?.focus()
                  }
                  style={styles.input}
                  editable={!loading}
                  selectionColor="#9A4B23"
                  onFocus={() =>
                    setPhoneFocused(true)
                  }
                  onBlur={() =>
                    setPhoneFocused(false)
                  }
                />
              </View>
            </View>

            {/* Password */}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Password
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  passwordFocused &&
                  styles.inputWrapperFocused,
                ]}
              >
                <Lock
                  size={23}
                  color={
                    passwordFocused
                      ? '#9A4B23'
                      : '#6B615A'
                  }
                  weight="regular"
                />

                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9A9189"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={
                    handleLogin
                  }
                  style={styles.input}
                  editable={!loading}
                  selectionColor="#9A4B23"
                  onFocus={() =>
                    setPasswordFocused(true)
                  }
                  onBlur={() =>
                    setPasswordFocused(false)
                  }
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  style={
                    styles.passwordButton
                  }
                  hitSlop={8}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeSlash
                      size={23}
                      color="#6B615A"
                      weight="regular"
                    />
                  ) : (
                    <Eye
                      size={23}
                      color="#6B615A"
                      weight="regular"
                    />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Forgot Password */}

            <Pressable
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              disabled={loading}
              hitSlop={6}
            >
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </Pressable>

            {/* Login Button */}

            <Animated.View
              style={{
                transform: [
                  {
                    scale: buttonScale,
                  },
                ],
              }}
            >
              <Pressable
                disabled={!canLogin || loading}
                onPress={handleLogin}
                onPressIn={pressIn}
                onPressOut={pressOut}
                style={[
                  styles.loginButton,
                  (!canLogin || loading) &&
                  styles.loginButtonDisabled,
                ]}
              >
                {loading ? (
                  <View
                    style={styles.loadingRow}
                  >
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.loadingText
                      }
                    >
                      Signing in...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.loginButtonText,
                      !canLogin &&
                      styles.loginButtonTextDisabled,
                    ]}
                  >
                    Sign in
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </View>

          {/* Create Account */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              New to MedBuy?
            </Text>

            <Pressable
              onPress={() =>
                router.push(
                  '/delivery-side/delivery-create-account'
                )
              }
              disabled={loading}
              hitSlop={8}
            >
              <Text style={styles.createAccount}>
                Create delivery account
              </Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop:
      Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 32,
  },

  bottomSpacer: {
    height: 40,
  },

  /* Back */

  backButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },

  backButtonPressed: {
    opacity: 0.7,
  },

  backText: {
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: '#1A1512',
  },

  /* Header */

  header: {
    alignItems: 'center',
    marginTop: 32,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#F6E6DC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: '#1A1512',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    maxWidth: 320,
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: '#5C534C',
    textAlign: 'center',
  },

  /* Form */

  form: {
    marginTop: 40,
  },

  fieldContainer: {
    marginBottom: 20,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: '#1A1512',
  },

  inputWrapper: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#E0D8CE',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  inputWrapperFocused: {
    borderColor: '#9A4B23',
    borderWidth: 1.5,
  },

  input: {
    flex: 1,
    minHeight: 50,
    marginLeft: 12,
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: '#1A1512',
  },

  passwordButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  /* Forgot */

  forgotButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: -4,
    marginBottom: 16,
  },

  forgotText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: '#9A4B23',
  },

  /* Login */

  loginButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#9A4B23',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  loginButtonDisabled: {
    backgroundColor: '#F6E6DC',
    opacity: 0.75,
  },

  loginButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: '#FFFFFF',
  },

  loginButtonTextDisabled: {
    color: '#9A4B23',
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: '#FFFFFF',
  },

  /* Footer */

  footer: {
    marginTop: 'auto',
    paddingTop: 48,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: '#5C534C',
  },

  createAccount: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: '#9A4B23',
  },
});