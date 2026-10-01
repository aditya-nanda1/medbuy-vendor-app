import { StatusBar } from 'expo-status-bar';
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
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import {
  ArrowLeft,
  FirstAid,
  ShieldCheck,
} from 'phosphor-react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

const RESEND_COOLDOWN_SECONDS = 30;

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

/* ============================================================
   OTP box (memoized, pops subtly when a digit lands)
   ============================================================ */

type OtpBoxProps = {
  digit: string;
  index: number;
  hasError: boolean;
  onChangeText: (value: string, index: number) => void;
  onFocus: () => void;
  onKeyPress: (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => void;
  registerRef: (index: number, ref: TextInput | null) => void;
};

const OtpBox = memo(function OtpBox({
  digit,
  index,
  hasError,
  onChangeText,
  onFocus,
  onKeyPress,
  registerRef,
}: OtpBoxProps) {
  const pop = useRef(new Animated.Value(1)).current;
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (digit && !prevDigit.current) {
      pop.setValue(0.9);
      Animated.spring(pop, {
        toValue: 1,
        damping: 14,
        stiffness: 320,
        useNativeDriver: true,
      }).start();
    }
    prevDigit.current = digit;
  }, [digit, pop]);

  return (
    <Animated.View style={{ transform: [{ scale: pop }] }}>
      <TextInput
        ref={(ref) => {
          registerRef(index, ref);
        }}
        value={digit}
        onChangeText={(value) => onChangeText(value, index)}
        onFocus={onFocus}
        onKeyPress={(event) => onKeyPress(event, index)}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        importantForAutofill="yes"
        selectTextOnFocus
        selectionColor="#9A4B23"
        accessibilityLabel={`OTP digit ${index + 1}`}
        style={[
          styles.otpInput,
          digit && styles.otpInputFilled,
          hasError && styles.otpInputError,
        ]}
      />
    </Animated.View>
  );
});

/* ============================================================
   Screen
   ============================================================ */

export default function PharmacyOTP() {
  const { phone } = useLocalSearchParams<{
    phone?: string;
  }>();

  const scrollViewRef = useRef<ScrollView>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const [error, setError] = useState('');

  const [cooldown, setCooldown] = useState(0);

  const otpValue = useMemo(() => otp.join(''), [otp]);

  // Shake the OTP row when an error appears
  const shakeX = useRef(new Animated.Value(0)).current;

  // Verify button press animation
  const buttonScale = useRef(new Animated.Value(1)).current;

  /* ---------- effects ---------- */

  useEffect(() => {
    if (!error) return;
    shakeX.setValue(0);
    const shake = Animated.sequence(
      [-10, 10, -7, 7, -4, 4, 0].map((x) =>
        Animated.timing(shakeX, {
          toValue: x,
          duration: 55,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    );
    shake.start();
    return () => shake.stop();
  }, [error, shakeX]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(
      () => setCooldown((current) => current - 1),
      1000
    );
    return () => clearTimeout(timer);
  }, [cooldown]);

  /* ---------- stable callbacks ---------- */

  /*
   * Move the OTP section above the Android keyboard.
   */
  const scrollToOtp = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 280,
        animated: true,
      });
    }, 150);
  }, []);

  const registerRef = useCallback(
    (index: number, ref: TextInput | null) => {
      inputRefs.current[index] = ref;
    },
    []
  );

  /*
   * Handle OTP entry.
   *
   * Also supports pasting a complete OTP such
   * as 111111 into one of the boxes.
   */
  const handleOtpChange = useCallback(
    (value: string, index: number) => {
      const digits = value.replace(/[^0-9]/g, '');

      if (!digits) {
        const updated = [...otp];
        updated[index] = '';
        setOtp(updated);
        setError('');
        return;
      }

      /*
       * If Android/iOS inserts multiple digits
       * (for example SMS autofill/paste), distribute
       * them across the remaining boxes.
       */
      if (digits.length > 1) {
        const updated = [...otp];
        const availableDigits = digits.slice(0, 6 - index);

        availableDigits.split('').forEach((digit, offset) => {
          updated[index + offset] = digit;
        });

        setOtp(updated);
        setError('');

        const nextIndex = Math.min(index + availableDigits.length, 5);
        inputRefs.current[nextIndex]?.focus();
        return;
      }

      const updated = [...otp];
      updated[index] = digits;
      setOtp(updated);
      setError('');

      /*
       * Automatically move to the next box.
       */
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  /*
   * Handle backspace.
   */
  const handleKeyPress = useCallback(
    (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number
    ) => {
      if (
        event.nativeEvent.key === 'Backspace' &&
        !otp[index] &&
        index > 0
      ) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  /*
   * Verify temporary OTP.
   *
   * Later this will be replaced with Twilio.
   */
  const handleVerify = useCallback(() => {
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    if (otpValue !== '111111') {
      setError('Incorrect OTP. Try 111111.');
      return;
    }

    setError('');

    /*
     * Temporary navigation.
     * Later we will perform real authentication
     * and save the JWT before navigating.
     */
    router.replace('/pharmacy-side/home');
  }, [otpValue]);

  /*
   * Reset OTP.
   */
  const handleResend = useCallback(() => {
    if (cooldown > 0) return;

    setOtp(['', '', '', '', '', '']);
    setError('');
    setCooldown(RESEND_COOLDOWN_SECONDS);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
      scrollToOtp();
    }, 150);
  }, [cooldown, scrollToOtp]);

  const goBack = useCallback(() => {
    router.back();
  }, []);

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

  const displayPhone = useMemo(
    () => (typeof phone === 'string' ? phone : ''),
    [phone]
  );

  const isComplete = otpValue.length === 6;

  /* ---------- render ---------- */

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <MemoEntrance delay={0}>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={goBack}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color="#1A1512" weight="regular" />

              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </MemoEntrance>

          {/* Header */}
          <MemoEntrance delay={ENTRANCE_STAGGER}>
            <View style={styles.header}>
              <View style={styles.logo}>
                <FirstAid size={30} color="#9A4B23" weight="regular" />
              </View>

              <Text style={styles.title}>Verify your number</Text>

              <Text style={styles.subtitle}>
                Enter the 6-digit OTP sent to
              </Text>

              <Text style={styles.phone}>+91 {displayPhone}</Text>
            </View>
          </MemoEntrance>

          {/* OTP Card */}
          <MemoEntrance delay={ENTRANCE_STAGGER * 2}>
            <View style={styles.otpSection}>
              <View style={styles.otpIcon}>
                <ShieldCheck size={26} color="#9A4B23" weight="regular" />
              </View>

              <Text style={styles.otpLabel}>One-time password</Text>

              <Text style={styles.otpDescription}>
                Enter the verification code to continue
              </Text>

              {/* OTP boxes */}
              <Animated.View
                style={[
                  styles.otpContainer,
                  { transform: [{ translateX: shakeX }] },
                ]}
              >
                {otp.map((digit, index) => (
                  <OtpBox
                    key={index}
                    digit={digit}
                    index={index}
                    hasError={error.length > 0}
                    onChangeText={handleOtpChange}
                    onFocus={scrollToOtp}
                    onKeyPress={handleKeyPress}
                    registerRef={registerRef}
                  />
                ))}
              </Animated.View>

              {/* Error */}
              {error.length > 0 && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Development OTP */}
              <View style={styles.devHint}>
                <Text style={styles.devHintTitle}>Development OTP</Text>

                <Text style={styles.devHintText}>Use 111111 for now</Text>
              </View>

              {/* Verify */}
              <Animated.View
                style={{ transform: [{ scale: buttonScale }] }}
              >
                <Pressable
                  disabled={!isComplete}
                  onPress={handleVerify}
                  onPressIn={animatePressIn}
                  onPressOut={animatePressOut}
                  accessibilityRole="button"
                  accessibilityLabel="Verify OTP"
                  accessibilityState={{ disabled: !isComplete }}
                  style={({ pressed }) => [
                    styles.verifyButton,
                    !isComplete && styles.verifyButtonDisabled,
                    pressed && isComplete && styles.verifyButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.verifyButtonText,
                      !isComplete && styles.verifyButtonTextDisabled,
                    ]}
                  >
                    Verify OTP
                  </Text>
                </Pressable>
              </Animated.View>

              {/* Resend */}
              <Pressable
                style={styles.resendButton}
                onPress={handleResend}
                disabled={cooldown > 0}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Resend OTP"
              >
                <Text
                  style={[
                    styles.resendText,
                    cooldown > 0 && styles.resendTextDisabled,
                  ]}
                >
                  {cooldown > 0
                    ? `Resend OTP in ${cooldown}s`
                    : 'Resend OTP'}
                </Text>
              </Pressable>
            </View>
          </MemoEntrance>

          {/* Bottom helper */}
          <MemoEntrance delay={ENTRANCE_STAGGER * 3}>
            <View style={styles.bottomHelper}>
              <ShieldCheck size={18} color="#6B615A" weight="regular" />

              <Text style={styles.bottomHelperText}>
                Your verification code is only used to secure your account.
              </Text>
            </View>
          </MemoEntrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },

  /* BACK */

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
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#1A1512',
  },

  /* HEADER */

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
    fontSize: 24,
    lineHeight: 30,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#1A1512',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'IBMPlexSans_400Regular',
    color: '#5C534C',
    textAlign: 'center',
  },

  phone: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#1A1512',
    textAlign: 'center',
  },

  /* OTP CARD */

  otpSection: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0D8CE',
  },

  otpIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F6E6DC',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  otpLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#1A1512',
    textAlign: 'center',
  },

  otpDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'IBMPlexSans_400Regular',
    color: '#6B615A',
    textAlign: 'center',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },

  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0D8CE',
    borderRadius: 10,
    backgroundColor: '#F9F7F4',
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#1A1512',
  },

  otpInputFilled: {
    borderColor: '#9A4B23',
    backgroundColor: '#FFFFFF',
  },

  otpInputError: {
    borderColor: '#A82520',
  },

  /* ERROR */

  errorText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#A82520',
    textAlign: 'center',
  },

  /* DEVELOPMENT */

  devHint: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F6E6DC',
    alignItems: 'center',
  },

  devHintTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#9A4B23',
  },

  devHintText: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: '#1A1512',
  },

  /* VERIFY */

  verifyButton: {
    minHeight: 48,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#9A4B23',
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifyButtonPressed: {
    backgroundColor: '#7B3A19',
    transform: [{ scale: 0.98 }],
  },

  verifyButtonDisabled: {
    backgroundColor: '#F6E6DC',
    opacity: 0.7,
  },

  verifyButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#FFFFFF',
  },

  verifyButtonTextDisabled: {
    color: '#9A4B23',
  },

  /* RESEND */

  resendButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  resendText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_500Medium',
    color: '#9A4B23',
  },

  resendTextDisabled: {
    color: '#9A9189',
  },

  /* FOOTER */

  bottomHelper: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomHelperText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_400Regular',
    color: '#6B615A',
  },
});
