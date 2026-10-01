  import { router } from 'expo-router';

  import {
    ArrowLeft,
    Eye,
    EyeSlash,
    FirstAid,
    Lock,
    Phone,
    Storefront,
    User,
  } from 'phosphor-react-native';

  import AsyncStorage from '@react-native-async-storage/async-storage';

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
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from 'react-native';

  const API_BASE_URL = 'http://192.168.0.101:3000';

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ============================================================
    Animation primitives
    ============================================================ */

  const ENTRANCE_DURATION = 450;
  const ENTRANCE_STAGGER = 60;

  type EntranceProps = {
    children: ReactNode;
    delay?: number;
    distance?: number;
  };

  /**
   * Staggered fade + rise entrance wrapper.
   */
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
    Focus ring
    ============================================================ */

  /**
   * Subtle animated focus ring for inputs.
   *
   * borderColor cannot use native driver.
   */
  function useFocusRing() {
    const focus = useRef(new Animated.Value(0)).current;

    const handleFocus = useCallback(() => {
      Animated.timing(focus, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
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
        borderColor: focus.interpolate({
          inputRange: [0, 1],
          outputRange: ['#E0D8CE', '#9A4B23'],
        }),
      }),
      [focus]
    );

    return useMemo(
      () => ({
        handleFocus,
        handleBlur,
        animatedStyle,
      }),
      [handleFocus, handleBlur, animatedStyle]
    );
  }

  /* ============================================================
    Error box
    ============================================================ */

  const ErrorBox = memo(function ErrorBox({
    message,
  }: {
    message: string;
  }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      anim.setValue(0);

      const animation = Animated.timing(anim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

      animation.start();

      return () => animation.stop();
    }, [anim, message]);

    return (
      <Animated.View
        style={[
          styles.errorBox,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-6, 0],
                }),
              },
            ],
          },
        ]}
        accessibilityRole="alert"
      >
        <Text style={styles.errorText}>{message}</Text>
      </Animated.View>
    );
  });

  /* ============================================================
    Screen
    ============================================================ */

  export default function CreateAccount() {
    const scrollViewRef = useRef<ScrollView>(null);

    /* ---------- form state ---------- */

    const [name, setName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    /* ---------- password visibility ---------- */

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
      useState(false);

    /* ---------- request state ---------- */

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    /* ---------- button animation ---------- */

    const buttonScale = useRef(new Animated.Value(1)).current;

    /* ---------- input focus rings ---------- */

    const nameRing = useFocusRing();
    const storeRing = useFocusRing();
    const emailRing = useFocusRing();
    const phoneRing = useFocusRing();
    const passwordRing = useFocusRing();
    const confirmRing = useFocusRing();

    /* ============================================================
      Stable callbacks
      ============================================================ */

    const scrollToInput = useCallback((y: number) => {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y,
          animated: true,
        });
      }, 150);
    }, []);

    const goBack = useCallback(() => {
      router.back();
    }, []);

    const goToLogin = useCallback(() => {
      router.push('/pharmacy-side/login');
    }, []);

    /* ============================================================
      Input handlers
      ============================================================ */

    const handleNameChange = useCallback((text: string) => {
      setName(text);
      setErrorMessage('');
    }, []);

    const handleStoreNameChange = useCallback((text: string) => {
      setStoreName(text);
      setErrorMessage('');
    }, []);

    const handleEmailChange = useCallback((text: string) => {
      setEmail(text);
      setErrorMessage('');
    }, []);

    const handlePhoneChange = useCallback((text: string) => {
      setPhone(text.replace(/[^0-9]/g, ''));
      setErrorMessage('');
    }, []);

    const handlePasswordChange = useCallback((text: string) => {
      setPassword(text);
      setErrorMessage('');
    }, []);

    const handleConfirmPasswordChange = useCallback(
      (text: string) => {
        setConfirmPassword(text);
        setErrorMessage('');
      },
      []
    );

    /* ============================================================
      Password visibility
      ============================================================ */

    const togglePasswordVisibility = useCallback(() => {
      setShowPassword((previous) => !previous);
    }, []);

    const toggleConfirmPasswordVisibility = useCallback(() => {
      setShowConfirmPassword((previous) => !previous);
    }, []);

    /* ============================================================
      Focus handlers
      ============================================================ */

    const handleNameFocus = useCallback(() => {
      scrollToInput(80);
      nameRing.handleFocus();
    }, [scrollToInput, nameRing]);

    const handleStoreNameFocus = useCallback(() => {
      scrollToInput(150);
      storeRing.handleFocus();
    }, [scrollToInput, storeRing]);

    const handleEmailFocus = useCallback(() => {
      scrollToInput(220);
      emailRing.handleFocus();
    }, [scrollToInput, emailRing]);

    const handlePhoneFocus = useCallback(() => {
      scrollToInput(290);
      phoneRing.handleFocus();
    }, [scrollToInput, phoneRing]);

    const handlePasswordFocus = useCallback(() => {
      scrollToInput(360);
      passwordRing.handleFocus();
    }, [scrollToInput, passwordRing]);

    const handleConfirmPasswordFocus = useCallback(() => {
      scrollToInput(440);
      confirmRing.handleFocus();
    }, [scrollToInput, confirmRing]);

    /* ============================================================
      Button animation
      ============================================================ */

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

    /* ============================================================
      CREATE ACCOUNT
      ============================================================ */

    const handleCreateAccount = useCallback(async () => {
      if (loading) return;

      setErrorMessage('');

      /* ---------- validation ---------- */

      if (
        !name.trim() ||
        !storeName.trim() ||
        !email.trim() ||
        !phone.trim() ||
        !password ||
        !confirmPassword
      ) {
        setErrorMessage('Please fill in all the fields.');
        return;
      }

      if (!EMAIL_PATTERN.test(email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      if (phone.trim().length < 10) {
        setErrorMessage('Please enter a valid phone number.');
        return;
      }

      if (password.length < 6) {
        setErrorMessage(
          'Password must be at least 6 characters.'
        );
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);

        /* ---------- backend registration ---------- */

        const response = await fetch(
          `${API_BASE_URL}/api/pharmacy/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: name.trim(),
              storeName: storeName.trim(),
              email: email.trim().toLowerCase(),
              phone: phone.trim(),
              password,
            }),
          }
        );

        const data = await response.json();

        /* ---------- backend error ---------- */

        if (!response.ok || !data.success) {
          setErrorMessage(
            data.message ||
            'Unable to create your account.'
          );
          return;
        }

        /* ========================================================
          SAVE ACTUAL SIGNUP DETAILS

          These are the exact details entered by the user.

          Password is intentionally NOT stored.
          ======================================================== */

        const userData = {
          userId: data.userId,
          name: name.trim(),
          storeName: storeName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: 'pharmacy',
        };

        await AsyncStorage.setItem(
          'medbuy_user',
          JSON.stringify(userData)
        );

        /* ---------- continue to OTP ---------- */

        router.push({
          pathname: '/pharmacy-side/otp',
          params: {
            phone: phone.trim(),
          },
        });
      } catch (error) {
        console.error('Registration error:', error);

        setErrorMessage(
          'Unable to connect to the server. Please check your connection.'
        );
      } finally {
        setLoading(false);
      }
    }, [
      loading,
      name,
      storeName,
      email,
      phone,
      password,
      confirmPassword,
    ]);

    /* ============================================================
      RENDER
      ============================================================ */

    return (
      <View style={styles.screen}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F9F7F4"
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === 'ios' ? 'padding' : 'height'
          }
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* ==================================================
                HEADER
                ================================================== */}

            <MemoEntrance delay={0}>
              <View style={styles.header}>
                <Pressable
                  style={styles.backButton}
                  onPress={goBack}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  hitSlop={8}
                >
                  <ArrowLeft
                    size={24}
                    color="#1A1512"
                  />
                </Pressable>

                <View style={styles.logoContainer}>
                  <FirstAid
                    size={28}
                    color="#9A4B23"
                    weight="fill"
                  />
                </View>
              </View>
            </MemoEntrance>

            {/* ==================================================
                TITLE
                ================================================== */}

            <MemoEntrance delay={ENTRANCE_STAGGER}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>
                  Create account
                </Text>

                <Text style={styles.subtitle}>
                  Register your pharmacy on MedBuy
                </Text>
              </View>
            </MemoEntrance>

            {/* ==================================================
                ERROR
                ================================================== */}

            {errorMessage ? (
              <ErrorBox
                key={errorMessage}
                message={errorMessage}
              />
            ) : null}

            {/* ==================================================
                NAME
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 2}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Your name
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    nameRing.animatedStyle,
                  ]}
                >
                  <User
                    size={22}
                    color="#5C534C"
                  />

                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={handleNameChange}
                    placeholder="Enter your name"
                    placeholderTextColor="#9A9189"
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    selectionColor="#9A4B23"
                    returnKeyType="next"
                    onFocus={handleNameFocus}
                    onBlur={nameRing.handleBlur}
                    accessibilityLabel="Your name"
                  />
                </Animated.View>
              </View>
            </MemoEntrance>

            {/* ==================================================
                STORE NAME
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 3}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Pharmacy / Store name
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    storeRing.animatedStyle,
                  ]}
                >
                  <Storefront
                    size={22}
                    color="#5C534C"
                  />

                  <TextInput
                    style={styles.input}
                    value={storeName}
                    onChangeText={
                      handleStoreNameChange
                    }
                    placeholder="Enter store name"
                    placeholderTextColor="#9A9189"
                    autoCapitalize="words"
                    textContentType="organizationName"
                    selectionColor="#9A4B23"
                    returnKeyType="next"
                    onFocus={handleStoreNameFocus}
                    onBlur={storeRing.handleBlur}
                    accessibilityLabel="Pharmacy or store name"
                  />
                </Animated.View>
              </View>
            </MemoEntrance>

            {/* ==================================================
                EMAIL
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 4}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Email address
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    emailRing.animatedStyle,
                  ]}
                >
                  <Text style={styles.emailIcon}>
                    @
                  </Text>

                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="Enter email address"
                    placeholderTextColor="#9A9189"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    selectionColor="#9A4B23"
                    returnKeyType="next"
                    onFocus={handleEmailFocus}
                    onBlur={emailRing.handleBlur}
                    accessibilityLabel="Email address"
                  />
                </Animated.View>
              </View>
            </MemoEntrance>

            {/* ==================================================
                PHONE
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 5}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Phone number
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    phoneRing.animatedStyle,
                  ]}
                >
                  <Phone
                    size={22}
                    color="#5C534C"
                  />

                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9A9189"
                    keyboardType="phone-pad"
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

            {/* ==================================================
                PASSWORD
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 6}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Password
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    passwordRing.animatedStyle,
                  ]}
                >
                  <Lock
                    size={22}
                    color="#5C534C"
                  />

                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Create a password"
                    placeholderTextColor="#9A9189"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    selectionColor="#9A4B23"
                    returnKeyType="next"
                    onFocus={handlePasswordFocus}
                    onBlur={passwordRing.handleBlur}
                    accessibilityLabel="Password"
                  />

                  <Pressable
                    style={styles.eyeButton}
                    onPress={togglePasswordVisibility}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeSlash
                        size={22}
                        color="#5C534C"
                      />
                    ) : (
                      <Eye
                        size={22}
                        color="#5C534C"
                      />
                    )}
                  </Pressable>
                </Animated.View>
              </View>
            </MemoEntrance>

            {/* ==================================================
                CONFIRM PASSWORD
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 7}
            >
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Confirm password
                </Text>

                <Animated.View
                  style={[
                    styles.inputWrapper,
                    confirmRing.animatedStyle,
                  ]}
                >
                  <Lock
                    size={22}
                    color="#5C534C"
                  />

                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={
                      handleConfirmPasswordChange
                    }
                    placeholder="Confirm your password"
                    placeholderTextColor="#9A9189"
                    secureTextEntry={
                      !showConfirmPassword
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    selectionColor="#9A4B23"
                    returnKeyType="done"
                    onFocus={handleConfirmPasswordFocus}
                    onBlur={confirmRing.handleBlur}
                    onSubmitEditing={
                      handleCreateAccount
                    }
                    accessibilityLabel="Confirm password"
                  />

                  <Pressable
                    style={styles.eyeButton}
                    onPress={
                      toggleConfirmPasswordVisibility
                    }
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    hitSlop={8}
                  >
                    {showConfirmPassword ? (
                      <EyeSlash
                        size={22}
                        color="#5C534C"
                      />
                    ) : (
                      <Eye
                        size={22}
                        color="#5C534C"
                      />
                    )}
                  </Pressable>
                </Animated.View>
              </View>
            </MemoEntrance>

            {/* ==================================================
                CREATE ACCOUNT BUTTON
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 8}
            >
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
                  style={[
                    styles.createButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleCreateAccount}
                  onPressIn={animatePressIn}
                  onPressOut={animatePressOut}
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel="Create account"
                  accessibilityState={{
                    disabled: loading,
                    busy: loading,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Text
                      style={styles.createButtonText}
                    >
                      Create Account
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            </MemoEntrance>

            {/* ==================================================
                LOGIN
                ================================================== */}

            <MemoEntrance
              delay={ENTRANCE_STAGGER * 9}
            >
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>
                  Already have an account?
                </Text>

                <Pressable
                  onPress={goToLogin}
                  accessibilityRole="button"
                  accessibilityLabel="Sign in"
                  hitSlop={8}
                >
                  <Text style={styles.loginLink}>
                    Sign in
                  </Text>
                </Pressable>
              </View>
            </MemoEntrance>

            <View style={styles.bottomSpace} />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  /* ============================================================
    STYLES
    ============================================================ */

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

    /* HEADER */

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

    /* TITLE */

    titleSection: {
      marginTop: 30,
      marginBottom: 28,
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

    /* ERROR */

    errorBox: {
      backgroundColor: '#FDECEA',
      borderWidth: 1,
      borderColor: '#E7B7B4',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 20,
    },

    errorText: {
      color: '#A82520',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },

    /* FIELDS */

    fieldContainer: {
      marginBottom: 18,
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

    emailIcon: {
      width: 22,
      textAlign: 'center',
      fontSize: 21,
      color: '#5C534C',
      fontWeight: '500',
    },

    eyeButton: {
      width: 40,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* CREATE BUTTON */

    createButton: {
      height: 52,
      borderRadius: 10,
      backgroundColor: '#9A4B23',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },

    buttonDisabled: {
      opacity: 0.7,
    },

    createButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },

    /* LOGIN */

    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },

    loginText: {
      color: '#5C534C',
      fontSize: 14,
    },

    loginLink: {
      color: '#9A4B23',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
    },

    bottomSpace: {
      height: 80,
    },
  });