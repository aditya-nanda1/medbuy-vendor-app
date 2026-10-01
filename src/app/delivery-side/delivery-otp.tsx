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
  ActivityIndicator,
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
  Bicycle,
  CheckCircle,
  ShieldCheck,
} from 'phosphor-react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

const RESEND_COOLDOWN_SECONDS = 30;
const DEV_OTP = '111111';

const COLORS = {
  primary: '#9A4B23',
  pressed: '#7B3A19',
  subtle: '#F6E6DC',
  surface: '#FFFFFF',
  background: '#F9F7F4',
  border: '#E0D8CE',
  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  neutral: '#6B615A',
  danger: '#A82520',
  success: '#1F6B45',
};

/* ============================================================
   Entrance animation
   ============================================================ */

const ENTRANCE_DURATION = 450;
const ENTRANCE_STAGGER = 60;

type EntranceProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
};

function Entrance({
  children,
  delay = 0,
  distance = 18,
}: EntranceProps) {
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
   OTP Box
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
  const previousDigit = useRef(digit);

  useEffect(() => {
    if (digit && !previousDigit.current) {
      pop.setValue(0.9);

      Animated.spring(pop, {
        toValue: 1,
        damping: 14,
        stiffness: 320,
        useNativeDriver: true,
      }).start();
    }

    previousDigit.current = digit;
  }, [digit, pop]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pop }],
      }}
    >
      <TextInput
        ref={(ref) => {
          registerRef(index, ref);
        }}
        value={digit}
        onChangeText={(value) =>
          onChangeText(value, index)
        }
        onFocus={onFocus}
        onKeyPress={(event) =>
          onKeyPress(event, index)
        }
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        importantForAutofill="yes"
        selectTextOnFocus
        selectionColor={COLORS.primary}
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
   Delivery OTP Screen
   ============================================================ */

export default function DeliveryOTP() {
  const { phone } = useLocalSearchParams<{
    phone?: string;
  }>();

  const scrollViewRef = useRef<ScrollView>(null);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [error, setError] = useState('');

  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const otpValue = useMemo(
    () => otp.join(''),
    [otp]
  );

  /* ==========================================================
     Animations
     ========================================================== */

  const shakeX = useRef(
    new Animated.Value(0)
  ).current;

  const buttonScale = useRef(
    new Animated.Value(1)
  ).current;

  const successScale = useRef(
    new Animated.Value(0.75)
  ).current;

  const successOpacity = useRef(
    new Animated.Value(0)
  ).current;

  /* ==========================================================
     Error shake
     ========================================================== */

  useEffect(() => {
    if (!error) return;

    shakeX.setValue(0);

    const shake = Animated.sequence(
      [-10, 10, -7, 7, -4, 4, 0].map(
        (x) =>
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

  /* ==========================================================
     Resend countdown
     ========================================================== */

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown(
        (current) => current - 1
      );
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  /* ==========================================================
     Keyboard scroll
     ========================================================== */

  const scrollToOtp = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 260,
        animated: true,
      });
    }, 150);
  }, []);

  /* ==========================================================
     Register input refs
     ========================================================== */

  const registerRef = useCallback(
    (
      index: number,
      ref: TextInput | null
    ) => {
      inputRefs.current[index] = ref;
    },
    []
  );

  /* ==========================================================
     OTP input
     ========================================================== */

  const handleOtpChange = useCallback(
    (
      value: string,
      index: number
    ) => {
      const digits = value.replace(
        /[^0-9]/g,
        ''
      );

      if (!digits) {
        const updated = [...otp];

        updated[index] = '';

        setOtp(updated);
        setError('');

        return;
      }

      /*
       * Handles paste/autofill.
       * Example: 111111
       */

      if (digits.length > 1) {
        const updated = [...otp];

        const availableDigits =
          digits.slice(
            0,
            6 - index
          );

        availableDigits
          .split('')
          .forEach(
            (digit, offset) => {
              updated[
                index + offset
              ] = digit;
            }
          );

        setOtp(updated);
        setError('');

        const nextIndex = Math.min(
          index +
          availableDigits.length,
          5
        );

        inputRefs.current[
          nextIndex
        ]?.focus();

        return;
      }

      const updated = [...otp];

      updated[index] = digits;

      setOtp(updated);
      setError('');

      if (index < 5) {
        inputRefs.current[
          index + 1
        ]?.focus();
      }
    },
    [otp]
  );

  /* ==========================================================
     Backspace
     ========================================================== */

  const handleKeyPress = useCallback(
    (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>,
      index: number
    ) => {
      if (
        event.nativeEvent.key ===
        'Backspace' &&
        !otp[index] &&
        index > 0
      ) {
        inputRefs.current[
          index - 1
        ]?.focus();
      }
    },
    [otp]
  );

  /* ==========================================================
     Success animation
     ========================================================== */

  const playSuccessAnimation =
    useCallback(() => {
      setShowSuccess(true);

      successScale.setValue(0.65);
      successOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(
          successOpacity,
          {
            toValue: 1,
            duration: 220,
            easing:
              Easing.out(
                Easing.cubic
              ),
            useNativeDriver: true,
          }
        ),

        Animated.spring(
          successScale,
          {
            toValue: 1,
            damping: 12,
            stiffness: 180,
            useNativeDriver: true,
          }
        ),
      ]).start();

      setTimeout(() => {
        router.replace(
          '/delivery-side/delivery-home'
        );
      }, 1100);
    }, [
      successOpacity,
      successScale,
    ]);

  /* ==========================================================
     Verify
     ========================================================== */

  const handleVerify = useCallback(() => {
    if (loading) return;

    if (otpValue.length !== 6) {
      setError(
        'Please enter the 6-digit OTP.'
      );
      return;
    }

    if (otpValue !== DEV_OTP) {
      setError(
        'Incorrect OTP. Try 111111.'
      );
      return;
    }

    setError('');
    setLoading(true);

    /*
     * Simulate successful verification.
     * Later this can be replaced with
     * real backend/Twilio verification.
     */

    setTimeout(() => {
      setLoading(false);
      playSuccessAnimation();
    }, 350);
  }, [
    loading,
    otpValue,
    playSuccessAnimation,
  ]);

  /* ==========================================================
     Resend
     ========================================================== */

  const handleResend = useCallback(() => {
    if (cooldown > 0) return;

    setOtp([
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    setError('');

    setCooldown(
      RESEND_COOLDOWN_SECONDS
    );

    setTimeout(() => {
      inputRefs.current[0]?.focus();
      scrollToOtp();
    }, 150);
  }, [
    cooldown,
    scrollToOtp,
  ]);

  /* ==========================================================
     Button animation
     ========================================================== */

  const animatePressIn =
    useCallback(() => {
      Animated.timing(
        buttonScale,
        {
          toValue: 0.97,
          duration: 100,
          easing:
            Easing.out(
              Easing.quad
            ),
          useNativeDriver: true,
        }
      ).start();
    }, [buttonScale]);

  const animatePressOut =
    useCallback(() => {
      Animated.spring(
        buttonScale,
        {
          toValue: 1,
          damping: 15,
          stiffness: 350,
          useNativeDriver: true,
        }
      ).start();
    }, [buttonScale]);

  const displayPhone =
    typeof phone === 'string'
      ? phone
      : '';

  const isComplete =
    otpValue.length === 6;

  /* ==========================================================
     Render
     ========================================================== */

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
        keyboardVerticalOffset={
          Platform.OS === 'ios'
            ? 20
            : 0
        }
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* Back */}
          <MemoEntrance>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                styles.backButtonPressed,
              ]}
              onPress={() =>
                router.back()
              }
              hitSlop={8}
            >
              <ArrowLeft
                size={24}
                color={
                  COLORS.textPrimary
                }
                weight="regular"
              />

              <Text
                style={styles.backText}
              >
                Back
              </Text>
            </Pressable>
          </MemoEntrance>

          {/* Header */}
          <MemoEntrance
            delay={ENTRANCE_STAGGER}
          >
            <View
              style={styles.header}
            >
              {/* Delivery branding */}
              <View
                style={styles.logo}
              >
                <Bicycle
                  size={32}
                  color={
                    COLORS.primary
                  }
                  weight="regular"
                />
              </View>

              <View
                style={
                  styles.deliveryBadge
                }
              >
                <Bicycle
                  size={14}
                  color={
                    COLORS.primary
                  }
                  weight="bold"
                />

                <Text
                  style={
                    styles.deliveryBadgeText
                  }
                >
                  DELIVERY PARTNER
                </Text>
              </View>

              <Text
                style={styles.title}
              >
                Verify your number
              </Text>

              <Text
                style={styles.subtitle}
              >
                Enter the 6-digit OTP sent
                to
              </Text>

              {displayPhone ? (
                <Text
                  style={styles.phone}
                >
                  +91 {displayPhone}
                </Text>
              ) : null}
            </View>
          </MemoEntrance>

          {/* OTP Card */}
          <MemoEntrance
            delay={
              ENTRANCE_STAGGER * 2
            }
          >
            <View
              style={styles.otpSection}
            >
              <View
                style={styles.otpIcon}
              >
                <ShieldCheck
                  size={26}
                  color={
                    COLORS.primary
                  }
                  weight="regular"
                />
              </View>

              <Text
                style={styles.otpLabel}
              >
                One-time password
              </Text>

              <Text
                style={
                  styles.otpDescription
                }
              >
                Enter the verification code
                to continue
              </Text>

              {/* OTP boxes */}
              <Animated.View
                style={[
                  styles.otpContainer,
                  {
                    transform: [
                      {
                        translateX:
                          shakeX,
                      },
                    ],
                  },
                ]}
              >
                {otp.map(
                  (
                    digit,
                    index
                  ) => (
                    <OtpBox
                      key={index}
                      digit={digit}
                      index={index}
                      hasError={
                        error.length >
                        0
                      }
                      onChangeText={
                        handleOtpChange
                      }
                      onFocus={
                        scrollToOtp
                      }
                      onKeyPress={
                        handleKeyPress
                      }
                      registerRef={
                        registerRef
                      }
                    />
                  )
                )}
              </Animated.View>

              {/* Error */}
              {error ? (
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {error}
                </Text>
              ) : null}

              {/* Development OTP */}
              <View
                style={styles.devHint}
              >
                <Text
                  style={
                    styles.devHintTitle
                  }
                >
                  Development OTP
                </Text>

                <Text
                  style={
                    styles.devHintText
                  }
                >
                  Use {DEV_OTP} for now
                </Text>
              </View>

              {/* Verify */}
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
                  disabled={
                    !isComplete ||
                    loading
                  }
                  onPress={
                    handleVerify
                  }
                  onPressIn={
                    animatePressIn
                  }
                  onPressOut={
                    animatePressOut
                  }
                  style={({ pressed }) => [
                    styles.verifyButton,

                    !isComplete &&
                    styles.verifyButtonDisabled,

                    pressed &&
                    isComplete &&
                    !loading &&
                    styles.verifyButtonPressed,
                  ]}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color={
                          COLORS.surface
                        }
                      />

                      <Text
                        style={
                          styles.verifyButtonText
                        }
                      >
                        Verifying...
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.verifyButtonText,
                        !isComplete &&
                        styles.verifyButtonTextDisabled,
                      ]}
                    >
                      Verify OTP
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              {/* Resend */}
              <Pressable
                style={
                  styles.resendButton
                }
                onPress={
                  handleResend
                }
                disabled={
                  cooldown > 0
                }
                hitSlop={8}
              >
                <Text
                  style={[
                    styles.resendText,
                    cooldown > 0 &&
                    styles.resendTextDisabled,
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
          <MemoEntrance
            delay={
              ENTRANCE_STAGGER * 3
            }
          >
            <View
              style={
                styles.bottomHelper
              }
            >
              <Bicycle
                size={18}
                color={
                  COLORS.neutral
                }
                weight="regular"
              />

              <Text
                style={
                  styles.bottomHelperText
                }
              >
                Your delivery partner account
                is protected with phone
                verification.
              </Text>
            </View>
          </MemoEntrance>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ======================================================
          SUCCESS OVERLAY
          ====================================================== */}

      {showSuccess && (
        <View
          style={
            styles.successOverlay
          }
        >
          <Animated.View
            style={[
              styles.successCard,
              {
                opacity:
                  successOpacity,
                transform: [
                  {
                    scale:
                      successScale,
                  },
                ],
              },
            ]}
          >
            <View
              style={
                styles.successIcon
              }
            >
              <CheckCircle
                size={64}
                color={
                  COLORS.success
                }
                weight="fill"
              />
            </View>

            <Text
              style={
                styles.successTitle
              }
            >
              Account verified
            </Text>

            <Text
              style={
                styles.successSubtitle
              }
            >
              Welcome to MedBuy Delivery
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

/* ============================================================
   Styles
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
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
    color: COLORS.textPrimary,
  },

  /* Header */

  header: {
    alignItems: 'center',
    marginTop: 30,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor:
      COLORS.subtle,
    marginBottom: 16,
  },

  deliveryBadgeText: {
    marginLeft: 5,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.primary,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  phone: {
    marginTop: 2,
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  /* OTP card */

  otpSection: {
    marginTop: 32,
    backgroundColor:
      COLORS.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  otpIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  otpLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  otpDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: COLORS.neutral,
    textAlign: 'center',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginTop: 24,
  },

  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor:
      COLORS.background,
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  otpInputFilled: {
    borderColor:
      COLORS.primary,
    backgroundColor:
      COLORS.surface,
  },

  otpInputError: {
    borderColor:
      COLORS.danger,
  },

  /* Error */

  errorText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.danger,
    textAlign: 'center',
  },

  /* Development */

  devHint: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
  },

  devHintTitle: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.primary,
  },

  devHintText: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  /* Verify */

  verifyButton: {
    minHeight: 48,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor:
      COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  verifyButtonPressed: {
    backgroundColor:
      COLORS.pressed,
  },

  verifyButtonDisabled: {
    backgroundColor:
      COLORS.subtle,
    opacity: 0.7,
  },

  verifyButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.surface,
  },

  verifyButtonTextDisabled: {
    color: COLORS.primary,
  },

  /* Resend */

  resendButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  resendText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.primary,
  },

  resendTextDisabled: {
    color: '#9A9189',
  },

  /* Footer */

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
    fontFamily:
      'IBMPlexSans_400Regular',
    color: COLORS.neutral,
  },

  /* Success */

  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      'rgba(249,247,244,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },

  successCard: {
    width: '82%',
    maxWidth: 340,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  successIcon: {
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  successSubtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});