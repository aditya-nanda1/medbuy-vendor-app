import { router } from 'expo-router';
import {
  ArrowLeft,
  Eye,
  EyeSlash,
  FirstAid,
  Lock,
  Phone,
} from 'phosphor-react-native';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_BASE_URL = 'http://192.168.0.101:3000';

/* ============================================================
   Animation primitives (all use the native driver where possible)
   ============================================================ */

const ENTRANCE_DURATION = 450;
const ENTRANCE_STAGGER = 60;

type EntranceProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
};

/** Staggered fade + rise entrance wrapper. */
function Entrance({ children, delay = 0, distance = 18 }: EntranceProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: ENTRANCE_DURATION,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [distance, 0],
            }),
          },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

const MemoEntrance = memo(Entrance);

/** Subtle animated focus ring for inputs (border color only). */
function useFocusRing() {
  const focus = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    Animated.timing(focus, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // borderColor can't use the native driver
    }).start();
  }, [focus]);

  const handleBlur = useCallback(() => {
    Animated.timing(focus, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [focus]);

  const animatedStyle = useMemo(
    () => ({
      // NOTE: intentionally not annotated as ViewStyle —
      // AnimatedInterpolation isn't assignable to ViewStyle['borderColor'],
      // but Animated.View's style prop accepts it.
      borderColor: focus.interpolate({
        inputRange: [0, 1],
        outputRange: ['#E0D8CE', '#9A4B23'],
      }),
    }),
    [focus]
  );

  return useMemo(
    () => ({ handleFocus, handleBlur, animatedStyle }),
    [handleFocus, handleBlur, animatedStyle]
  );
}

/* ============================================================
   Error modal (memoized, spring-in card)
   ============================================================ */

type ErrorModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

const ErrorModal = memo(function ErrorModal({
  visible,
  message,
  onClose,
}: ErrorModalProps) {
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    if (!visible) return;
    scale.setValue(0.94);
    const spring = Animated.spring(scale, {
      toValue: 1,
      damping: 20,
      stiffness: 300,
      useNativeDriver: true,
    });
    spring.start();
    return () => spring.stop();
  }, [visible, scale]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[styles.modalCard, { transform: [{ scale }] }]}
          accessibilityRole="alert"
        >
          {/* Error Icon */}
          <View style={styles.modalIcon}>
            <Text style={styles.modalIconText}>!</Text>
          </View>

          {/* Title */}
          <Text style={styles.modalTitle}>Sign in failed</Text>

          {/* Message */}
          <Text style={styles.modalMessage}>{message}</Text>

          {/* OK Button */}
          <Pressable
            style={({ pressed }) => [
              styles.modalButton,
              pressed && styles.modalButtonPressed,
            ]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
          >
            <Text style={styles.modalButtonText}>OK</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
});

/* ============================================================
   Screen
   ============================================================ */

export default function PharmacyLogin() {
  const scrollViewRef = useRef<ScrollView>(null);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error modal
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Button press animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Input focus rings
  const phoneRing = useFocusRing();
  const passwordRing = useFocusRing();

  /* ---------- stable callbacks ---------- */

  const scrollToInput = useCallback((y: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y, animated: true });
    }, 150);
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  }, []);

  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
  }, []);

  const goBack = useCallback(() => {
    router.back();
  }, []);

  const goToCreateAccount = useCallback(() => {
    router.push('/pharmacy-side/create-account');
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text.replace(/[^0-9]/g, ''));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((previous) => !previous);
  }, []);

  const handlePhoneFocus = useCallback(() => {
    scrollToInput(100);
    phoneRing.handleFocus();
  }, [scrollToInput, phoneRing]);

  const handlePasswordFocus = useCallback(() => {
    scrollToInput(220);
    passwordRing.handleFocus();
  }, [scrollToInput, passwordRing]);

  const animatePressIn = useCallback(() => {
    Animated.timing(buttonScale, {
      toValue: 0.97,
      duration: 100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const animatePressOut = useCallback(() => {
    Animated.spring(buttonScale, {
      toValue: 1,
      damping: 15,
      stiffness: 350,
      useNativeDriver: true,
    }).start();
  }, [buttonScale]);

  const handleLogin = useCallback(async () => {
    if (loading) return;

    if (!phone.trim() || !password) {
      showError('Please enter your phone number and password.');
      return;
    }

    if (phone.trim().length < 10) {
      showError('Please enter a valid phone number.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/pharmacy/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      /*
       * Backend checks:
       * 1. Phone number exists
       * 2. Account is a pharmacy
       * 3. Password matches
       *
       * If anything fails, show modal.
       */
      if (!response.ok || !data.success) {
        showError(data.message || 'Invalid phone number or password.');
        return;
      }

      /*
       * SIGN IN SUCCESS
       *
       * No OTP here.
       * Go directly to Home.
       */
      router.replace('/pharmacy-side/home');
    } catch (error) {
      console.error('Login error:', error);

      showError(
        'Unable to connect to the server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [loading, phone, password, showError]);

  /* ---------- render ---------- */

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9F7F4" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <MemoEntrance delay={0}>
            <View style={styles.header}>
              <Pressable
                style={styles.backButton}
                onPress={goBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={8}
              >
                <ArrowLeft size={24} color="#1A1512" weight="regular" />
              </Pressable>

              <View style={styles.logoContainer}>
                <FirstAid size={28} color="#9A4B23" weight="fill" />
              </View>
            </View>
          </MemoEntrance>

          {/* Title */}
          <MemoEntrance delay={ENTRANCE_STAGGER}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>Welcome back</Text>

              <Text style={styles.subtitle}>
                Sign in to manage your pharmacy orders
              </Text>
            </View>
          </MemoEntrance>

          {/* Phone Number */}
          <MemoEntrance delay={ENTRANCE_STAGGER * 2}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone number</Text>

              <Animated.View
                style={[styles.inputWrapper, phoneRing.animatedStyle]}
              >
                <Phone size={22} color="#5C534C" weight="regular" />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter phone number"
                  placeholderTextColor="#9A9189"
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  selectionColor="#9A4B23"
                  maxLength={15}
                  returnKeyType="next"
                  onFocus={handlePhoneFocus}
                  onBlur={phoneRing.handleBlur}
                  accessibilityLabel="Phone number"
                />
              </Animated.View>
            </View>
          </MemoEntrance>

          {/* Password */}
          <MemoEntrance delay={ENTRANCE_STAGGER * 3}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>

              <Animated.View
                style={[styles.inputWrapper, passwordRing.animatedStyle]}
              >
                <Lock size={22} color="#5C534C" weight="regular" />

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#9A9189"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  selectionColor="#9A4B23"
                  returnKeyType="done"
                  onFocus={handlePasswordFocus}
                  onBlur={passwordRing.handleBlur}
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password"
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={togglePasswordVisibility}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeSlash size={22} color="#5C534C" weight="regular" />
                  ) : (
                    <Eye size={22} color="#5C534C" weight="regular" />
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </MemoEntrance>

          {/* Sign In Button */}
          <MemoEntrance delay={ENTRANCE_STAGGER * 4}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Pressable
                style={[
                  styles.signInButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                onPressIn={animatePressIn}
                onPressOut={animatePressOut}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                accessibilityState={{ disabled: loading, busy: loading }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInText}>Sign In</Text>
                )}
              </Pressable>
            </Animated.View>
          </MemoEntrance>

          {/* Create Account */}
          <MemoEntrance delay={ENTRANCE_STAGGER * 5}>
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>

              <Pressable
                onPress={goToCreateAccount}
                accessibilityRole="button"
                accessibilityLabel="Create account"
                hitSlop={8}
              >
                <Text style={styles.signupLink}>Create account</Text>
              </Pressable>
            </View>
          </MemoEntrance>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================
          ERROR MODAL
          ========================= */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={closeErrorModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 40,
  },

  /* Header */

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F6E6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Title */

  titleSection: {
    marginTop: 36,
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '600',
    color: '#1A1512',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    color: '#5C534C',
  },

  /* Inputs */

  fieldContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#1A1512',
    marginBottom: 8,
  },

  inputWrapper: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0D8CE',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1A1512',
    height: 50,
  },

  eyeButton: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Sign In */

  signInButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#9A4B23',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  signInText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Sign Up */

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  signupText: {
    color: '#5C534C',
    fontSize: 14,
  },

  signupLink: {
    color: '#9A4B23',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },

  bottomSpace: {
    height: 120,
  },

  /* =========================
     ERROR MODAL
     ========================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 21, 18, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',

    // Android elevation
    elevation: 8,

    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },

  modalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  modalIconText: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '700',
    color: '#A82520',
  },

  modalTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#1A1512',
    textAlign: 'center',
  },

  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5C534C',
    textAlign: 'center',
    marginTop: 8,
  },

  modalButton: {
    width: '100%',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#9A4B23',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  modalButtonPressed: {
    backgroundColor: '#7B3A19',
    transform: [{ scale: 0.98 }],
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
