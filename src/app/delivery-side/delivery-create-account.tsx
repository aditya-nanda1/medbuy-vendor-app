import { router } from 'expo-router';

import {
  ArrowLeft,
  Bicycle,
  Camera,
  Check,
  Eye,
  EyeSlash,
  Image as ImageIcon,
  Lock,
  Phone,
  Trash,
  User,
  WarningCircle,
} from 'phosphor-react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';

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
  Image,
  Keyboard,
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
  URI -> Blob
  ============================================================ */

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.onload = () => {
      if (xhr.response) {
        resolve(xhr.response);
      } else {
        reject(
          new Error(
            'Unable to read the selected profile photo.'
          )
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          'Unable to read the selected profile photo.'
        )
      );
    };

    xhr.ontimeout = () => {
      reject(
        new Error(
          'Timed out while reading the selected profile photo.'
        )
      );
    };

    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/* ============================================================
  Modal
  ============================================================ */

type ModalVariant = 'error' | 'options' | 'confirm';

type ModalButton = {
  label: string;
  kind?: 'primary' | 'ghost' | 'danger';
  icon?: ReactNode;
  onPress?: () => void;
};

type ModalConfig = {
  variant: ModalVariant;
  title: string;
  message?: string;
  buttons: ModalButton[];
};

/* ============================================================
  Screen
  ============================================================ */

export default function DeliveryCreateAccount() {
  const scrollViewRef = useRef<ScrollView>(null);

  /* ---------- form state ---------- */

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profilePhoto, setProfilePhoto] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  /* ---------- password visibility ---------- */

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  /* ---------- request state ---------- */

  const [loading, setLoading] = useState(false);

  /* ---------- photo modal ---------- */

  const [modalConfig, setModalConfig] =
    useState<ModalConfig | null>(null);

  /* ---------- success tick ---------- */

  const [showSuccess, setShowSuccess] = useState(false);

  /* ---------- button animation ---------- */

  const buttonScale = useRef(new Animated.Value(1)).current;

  /* ---------- modal animation ---------- */

  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.92)).current;

  /* ---------- success animation ---------- */

  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.86)).current;
  const successCircleScale = useRef(new Animated.Value(0)).current;
  const successTickScale = useRef(new Animated.Value(0)).current;

  /* ---------- input focus rings ---------- */

  const nameRing = useFocusRing();
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
    router.replace('/delivery-side/delivery-login');
  }, []);

  /* ============================================================
    Modal
    ============================================================ */

  const showModal = useCallback(
    (config: ModalConfig) => {
      Keyboard.dismiss();

      setModalConfig(config);

      modalOpacity.setValue(0);
      modalScale.setValue(0.92);

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),

          Animated.spring(modalScale, {
            toValue: 1,
            damping: 18,
            stiffness: 250,
            mass: 0.8,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [modalOpacity, modalScale]
  );

  const hideModal = useCallback(
    (after?: () => void) => {
      Animated.parallel([
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 130,
          useNativeDriver: true,
        }),

        Animated.timing(modalScale, {
          toValue: 0.94,
          duration: 130,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalConfig(null);

        if (after) {
          setTimeout(after, 40);
        }
      });
    },
    [modalOpacity, modalScale]
  );

  const handleModalButton = useCallback(
    (button: ModalButton) => {
      hideModal(button.onPress);
    },
    [hideModal]
  );

  const showError = useCallback(
    (title: string, message: string) => {
      showModal({
        variant: 'error',
        title,
        message,
        buttons: [
          {
            label: 'OK',
            kind: 'primary',
          },
        ],
      });
    },
    [showModal]
  );

  /* ============================================================
    Input handlers
    ============================================================ */

  const handleNameChange = useCallback((text: string) => {
    setName(text);
  }, []);

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text);
  }, []);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text.replace(/[^0-9]/g, ''));
  }, []);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
  }, []);

  const handleConfirmPasswordChange = useCallback(
    (text: string) => {
      setConfirmPassword(text);
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
    scrollToInput(260);
    nameRing.handleFocus();
  }, [scrollToInput, nameRing]);

  const handleEmailFocus = useCallback(() => {
    scrollToInput(340);
    emailRing.handleFocus();
  }, [scrollToInput, emailRing]);

  const handlePhoneFocus = useCallback(() => {
    scrollToInput(420);
    phoneRing.handleFocus();
  }, [scrollToInput, phoneRing]);

  const handlePasswordFocus = useCallback(() => {
    scrollToInput(500);
    passwordRing.handleFocus();
  }, [scrollToInput, passwordRing]);

  const handleConfirmPasswordFocus = useCallback(() => {
    scrollToInput(580);
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
    PHOTO - GALLERY
    ============================================================ */

  const pickFromGallery = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        showError(
          'Permission required',
          'Please allow photo library access to select your profile photo.'
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

      if (!result.canceled && result.assets.length > 0) {
        setProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);

      showError(
        'Unable to select photo',
        'Something went wrong while selecting the photo.'
      );
    }
  }, [showError]);

  /* ============================================================
    PHOTO - CAMERA
    ============================================================ */

  const takePhoto = useCallback(async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        showError(
          'Permission required',
          'Please allow camera access to take your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setProfilePhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);

      showError(
        'Unable to take photo',
        'Something went wrong while taking your profile photo.'
      );
    }
  }, [showError]);

  /* ============================================================
    PHOTO OPTIONS
    ============================================================ */

  const chooseProfilePhoto = useCallback(() => {
    showModal({
      variant: 'options',
      title: 'Profile photo',
      message:
        'Choose how you want to add your profile photo.',
      buttons: [
        {
          label: 'Take photo',
          kind: 'primary',
          icon: <Camera size={20} color="#9A4B23" />,
          onPress: takePhoto,
        },
        {
          label: 'Choose from gallery',
          kind: 'primary',
          icon: <ImageIcon size={20} color="#9A4B23" />,
          onPress: pickFromGallery,
        },
        {
          label: 'Cancel',
          kind: 'ghost',
        },
      ],
    });
  }, [showModal, takePhoto, pickFromGallery]);

  /* ============================================================
    REMOVE PHOTO
    ============================================================ */

  const removeProfilePhoto = useCallback(() => {
    showModal({
      variant: 'confirm',
      title: 'Remove photo?',
      message:
        'Your current profile photo will be removed.',
      buttons: [
        {
          label: 'Cancel',
          kind: 'ghost',
        },
        {
          label: 'Remove',
          kind: 'danger',
          onPress: () => {
            setProfilePhoto(null);
          },
        },
      ],
    });
  }, [showModal]);

  /* ============================================================
    SUCCESS ANIMATION
    ============================================================ */

  const playSuccessAnimation = useCallback(
    (phoneNumber: string) => {
      Keyboard.dismiss();

      setShowSuccess(true);

      successOpacity.setValue(0);
      successScale.setValue(0.86);
      successCircleScale.setValue(0);
      successTickScale.setValue(0);

      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();

      Animated.spring(successScale, {
        toValue: 1,
        damping: 17,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }).start();

      Animated.spring(successCircleScale, {
        toValue: 1,
        delay: 120,
        damping: 10,
        stiffness: 220,
        mass: 0.7,
        useNativeDriver: true,
      }).start();

      Animated.spring(successTickScale, {
        toValue: 1,
        delay: 330,
        damping: 9,
        stiffness: 280,
        mass: 0.5,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        router.replace({
          pathname: '/delivery-side/delivery-otp',
          params: {
            phone: phoneNumber,
          },
        });
      }, 1900);
    },
    [
      successOpacity,
      successScale,
      successCircleScale,
      successTickScale,
    ]
  );

  /* ============================================================
    CREATE ACCOUNT
    ============================================================ */

  const handleCreateAccount = useCallback(async () => {
    if (loading) return;

    /* ---------- validation ---------- */

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanName) {
      showError('Name required', 'Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      showError(
        'Email required',
        'Please enter your email address.'
      );
      return;
    }

    if (!EMAIL_PATTERN.test(cleanEmail)) {
      showError(
        'Invalid email',
        'Please enter a valid email address.'
      );
      return;
    }

    if (cleanPhone.length !== 10) {
      showError(
        'Invalid mobile number',
        'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!password) {
      showError('Password required', 'Please create a password.');
      return;
    }

    if (password.length < 6) {
      showError(
        'Weak password',
        'Password must be at least 6 characters.'
      );
      return;
    }

    if (!confirmPassword) {
      showError(
        'Confirm your password',
        'Please re-enter your password.'
      );
      return;
    }

    if (password !== confirmPassword) {
      showError(
        'Passwords do not match',
        'Please make sure both passwords are the same.'
      );
      return;
    }

    if (!profilePhoto) {
      showError(
        'Profile photo required',
        'Please add a profile photo to continue.'
      );
      return;
    }

    Keyboard.dismiss();

    try {
      setLoading(true);

      /* ---------- build form data ---------- */

      const formData = new FormData();

      formData.append('name', cleanName);
      formData.append('email', cleanEmail.toLowerCase());
      formData.append('phone', cleanPhone);
      formData.append('password', password);

      const imageBlob = await uriToBlob(profilePhoto.uri);

      let fileName = profilePhoto.fileName;

      if (!fileName) {
        const extension =
          imageBlob.type === 'image/png' ? 'png' : 'jpg';

        fileName = `delivery-profile-${Date.now()}.${extension}`;
      }

      formData.append('profilePhoto', imageBlob, fileName);

      /* ---------- backend registration ---------- */

      const response = await fetch(
        `${API_BASE_URL}/api/delivery/register`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const responseText = await response.text();

      let data: any;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          responseText ||
          'The server returned an invalid response.'
        );
      }

      /* ---------- backend error ---------- */

      if (!response.ok || !data.success) {
        const serverMessage =
          data.message || 'Unable to create delivery account.';

        const lowerMessage = serverMessage.toLowerCase();

        let errorTitle = 'Registration failed';

        if (lowerMessage.includes('email')) {
          errorTitle = 'Email already in use';
        } else if (
          lowerMessage.includes('phone') ||
          lowerMessage.includes('mobile')
        ) {
          errorTitle = 'Phone number already in use';
        }

        showError(errorTitle, serverMessage);
        return;
      }

      /* ========================================================
        SAVE TEMPORARY REGISTRATION DATA
        ======================================================== */

      await AsyncStorage.setItem(
        'medbuy_pending_user',
        JSON.stringify({
          name: cleanName,
          email: cleanEmail.toLowerCase(),
          phone: cleanPhone,
          role: 'delivery_agent',
          userId: data.userId,
          deliveryAgentId: data.deliveryAgentId || null,
        })
      );

      /* ---------- success tick, then OTP ---------- */

      playSuccessAnimation(cleanPhone);
    } catch (error: any) {
      console.error('Delivery registration error:', error);

      let message =
        'Something went wrong while creating your account. Please try again.';

      if (error?.message?.includes('Network request failed')) {
        message =
          'Unable to connect to the MedBuy server. Make sure the backend is running and your Android device is connected to the same Wi-Fi network as your computer.';
      } else if (error?.message) {
        message = error.message;
      }

      showError('Registration failed', message);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    name,
    email,
    phone,
    password,
    confirmPassword,
    profilePhoto,
    playSuccessAnimation,
    showError,
  ]);

  /* ============================================================
    CUSTOM MODAL
    ============================================================ */

  const renderModal = () => {
    if (!modalConfig) {
      return null;
    }

    const isOptions = modalConfig.variant === 'options';

    return (
      <Modal
        visible={true}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => hideModal()}
      >
        <View style={styles.modalRoot}>
          <Animated.View
            style={[
              styles.modalBackdrop,
              {
                opacity: modalOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: modalOpacity,
                transform: [
                  {
                    scale: modalScale,
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.modalIcon,
                modalConfig.variant === 'error' &&
                styles.modalIconDanger,
                modalConfig.variant === 'confirm' &&
                styles.modalIconDanger,
                modalConfig.variant === 'options' &&
                styles.modalIconSubtle,
              ]}
            >
              {modalConfig.variant === 'options' ? (
                <Camera size={30} color="#9A4B23" />
              ) : modalConfig.variant === 'confirm' ? (
                <Trash size={30} color="#FFFFFF" />
              ) : (
                <WarningCircle size={30} color="#FFFFFF" />
              )}
            </View>

            <Text style={styles.modalTitle}>
              {modalConfig.title}
            </Text>

            {modalConfig.message && (
              <Text style={styles.modalMessage}>
                {modalConfig.message}
              </Text>
            )}

            {isOptions ? (
              <View style={styles.optionList}>
                {modalConfig.buttons.map((button) => (
                  <Pressable
                    key={button.label}
                    onPress={() => handleModalButton(button)}
                    style={({ pressed }) => [
                      styles.optionButton,
                      pressed && styles.optionButtonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={button.label}
                  >
                    {button.icon && (
                      <View style={styles.optionIcon}>
                        {button.icon}
                      </View>
                    )}

                    <Text
                      style={[
                        styles.optionText,
                        button.kind === 'ghost' &&
                        styles.optionGhostText,
                      ]}
                    >
                      {button.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={styles.modalButtons}>
                {modalConfig.buttons.map((button) => (
                  <Pressable
                    key={button.label}
                    onPress={() => handleModalButton(button)}
                    style={({ pressed }) => [
                      styles.modalButton,
                      button.kind === 'danger' &&
                      styles.modalButtonDanger,
                      button.kind === 'ghost' &&
                      styles.modalButtonGhost,
                      pressed && styles.modalButtonPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={button.label}
                  >
                    <Text
                      style={[
                        styles.modalButtonText,
                        button.kind === 'ghost' &&
                        styles.modalButtonGhostText,
                      ]}
                    >
                      {button.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
    );
  };

  /* ============================================================
    SUCCESS OVERLAY
    ============================================================ */

  const renderSuccess = () => {
    if (!showSuccess) {
      return null;
    }

    return (
      <Modal
        visible={true}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View
          style={[
            styles.successRoot,
            {
              opacity: successOpacity,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.successCard,
              {
                transform: [
                  {
                    scale: successScale,
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.successCircle,
                {
                  transform: [
                    {
                      scale: successCircleScale,
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: successTickScale,
                    },
                  ],
                }}
              >
                <Check
                  size={48}
                  color="#FFFFFF"
                  weight="bold"
                />
              </Animated.View>
            </Animated.View>

            <Text style={styles.successTitle}>
              Account created!
            </Text>

            <Text style={styles.successSubtitle}>
              Welcome to MedBuy
              {name.trim()
                ? `, ${name.trim().split(' ')[0]}`
                : ''}
              . Your delivery account is ready.
            </Text>

            <View style={styles.successProgress}>
              <View style={styles.successProgressDot} />

              <Text style={styles.successHint}>
                Taking you to phone verification…
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <ArrowLeft size={24} color="#1A1512" />
              </Pressable>

              <View style={styles.logoContainer}>
                <Bicycle
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
                Create delivery account
              </Text>

              <Text style={styles.subtitle}>
                Join MedBuy as a delivery partner and start
                managing deliveries
              </Text>
            </View>
          </MemoEntrance>

          {/* ==================================================
              PHOTO
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 2}>
            <View style={styles.photoSection}>
              <Pressable
                style={styles.photoWrapper}
                onPress={chooseProfilePhoto}
                accessibilityRole="button"
                accessibilityLabel="Add profile photo"
                hitSlop={8}
              >
                {profilePhoto ? (
                  <Image
                    source={{
                      uri: profilePhoto.uri,
                    }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Camera size={28} color="#9A4B23" />
                  </View>
                )}

                <View style={styles.cameraBadge}>
                  <Camera
                    size={13}
                    color="#FFFFFF"
                    weight="fill"
                  />
                </View>
              </Pressable>

              <Text style={styles.photoTitle}>
                {profilePhoto
                  ? 'Profile photo added'
                  : 'Add profile photo'}
              </Text>

              <Text style={styles.photoSubtitle}>
                Use a clear photo so customers can identify
                you.
              </Text>

              {profilePhoto && (
                <Pressable
                  style={styles.removePhotoButton}
                  onPress={removeProfilePhoto}
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  hitSlop={8}
                >
                  <Text style={styles.removePhotoText}>
                    Remove photo
                  </Text>
                </Pressable>
              )}
            </View>
          </MemoEntrance>

          {/* ==================================================
              NAME
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 3}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Full name</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  nameRing.animatedStyle,
                ]}
              >
                <User size={22} color="#5C534C" />

                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9A9189"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  selectionColor="#9A4B23"
                  returnKeyType="next"
                  onFocus={handleNameFocus}
                  onBlur={nameRing.handleBlur}
                  accessibilityLabel="Full name"
                />
              </Animated.View>
            </View>
          </MemoEntrance>

          {/* ==================================================
              EMAIL
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 4}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email address</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  emailRing.animatedStyle,
                ]}
              >
                <Text style={styles.emailIcon}>@</Text>

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

          <MemoEntrance delay={ENTRANCE_STAGGER * 5}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Mobile number</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  phoneRing.animatedStyle,
                ]}
              >
                <Phone size={22} color="#5C534C" />

                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#9A9189"
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                  selectionColor="#9A4B23"
                  maxLength={15}
                  returnKeyType="next"
                  onFocus={handlePhoneFocus}
                  onBlur={phoneRing.handleBlur}
                  accessibilityLabel="Mobile number"
                />
              </Animated.View>
            </View>
          </MemoEntrance>

          {/* ==================================================
              PASSWORD
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 6}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  passwordRing.animatedStyle,
                ]}
              >
                <Lock size={22} color="#5C534C" />

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
                    <EyeSlash size={22} color="#5C534C" />
                  ) : (
                    <Eye size={22} color="#5C534C" />
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </MemoEntrance>

          {/* ==================================================
              CONFIRM PASSWORD
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 7}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Confirm password</Text>

              <Animated.View
                style={[
                  styles.inputWrapper,
                  confirmRing.animatedStyle,
                ]}
              >
                <Lock size={22} color="#5C534C" />

                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9A9189"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  selectionColor="#9A4B23"
                  returnKeyType="done"
                  onFocus={handleConfirmPasswordFocus}
                  onBlur={confirmRing.handleBlur}
                  onSubmitEditing={handleCreateAccount}
                  accessibilityLabel="Confirm password"
                />

                <Pressable
                  style={styles.eyeButton}
                  onPress={toggleConfirmPasswordVisibility}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  hitSlop={8}
                >
                  {showConfirmPassword ? (
                    <EyeSlash size={22} color="#5C534C" />
                  ) : (
                    <Eye size={22} color="#5C534C" />
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </MemoEntrance>

          {/* ==================================================
              PASSWORD HINT
              ================================================== */}

          <View style={styles.passwordHint}>
            <Text style={styles.passwordHintText}>
              Password must contain at least 6 characters.
            </Text>
          </View>

          {/* ==================================================
              CREATE ACCOUNT BUTTON
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 8}>
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
                  <Text style={styles.createButtonText}>
                    Create Account
                  </Text>
                )}
              </Pressable>
            </Animated.View>
          </MemoEntrance>

          {/* ==================================================
              LOGIN
              ================================================== */}

          <MemoEntrance delay={ENTRANCE_STAGGER * 9}>
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
                <Text style={styles.loginLink}>Sign in</Text>
              </Pressable>
            </View>
          </MemoEntrance>

          {/* ==================================================
              TERMS
              ================================================== */}

          <Text style={styles.termsText}>
            By creating an account, you agree to the MedBuy
            terms and privacy policy.
          </Text>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>

      {renderModal()}
      {renderSuccess()}
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

  /* PHOTO */

  photoSection: {
    alignItems: 'center',
    marginBottom: 22,
  },

  photoWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    position: 'relative',
    marginBottom: 10,
  },

  photoPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#F6E6DC',
    borderWidth: 1.5,
    borderColor: '#E0D8CE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: '#9A4B23',
  },

  cameraBadge: {
    position: 'absolute',
    right: 1,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9A4B23',
    borderWidth: 2.5,
    borderColor: '#F9F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: '#1A1512',
  },

  photoSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#5C534C',
    marginTop: 2,
    textAlign: 'center',
  },

  removePhotoButton: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  removePhotoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A82520',
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

  /* PASSWORD HINT */

  passwordHint: {
    marginTop: -4,
    marginBottom: 20,
  },

  passwordHintText: {
    fontSize: 12,
    lineHeight: 17,
    color: '#5C534C',
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

  /* TERMS */

  termsText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#81786F',
    textAlign: 'center',
    marginTop: 22,
    paddingHorizontal: 20,
  },

  bottomSpace: {
    height: 80,
  },

  /* =========================================================
    PHOTO MODAL
    ========================================================= */

  modalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,21,18,0.58)',
  },

  modalCard: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 27,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },

  modalIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    backgroundColor: '#9A4B23',
  },

  modalIconDanger: {
    backgroundColor: '#A82520',
  },

  modalIconSubtle: {
    backgroundColor: '#F6E6DC',
  },

  modalTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: '#1A1512',
    textAlign: 'center',
  },

  modalMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5C534C',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 22,
  },

  modalButtons: {
    flexDirection: 'row',
    width: '100%',
  },

  modalButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#9A4B23',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },

  modalButtonDanger: {
    backgroundColor: '#A82520',
  },

  modalButtonGhost: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0D8CE',
  },

  modalButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },

  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  modalButtonGhostText: {
    color: '#5C534C',
  },

  optionList: {
    width: '100%',
    marginTop: 3,
  },

  optionButton: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#F9F7F4',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 8,
  },

  optionButtonPressed: {
    backgroundColor: '#F6E6DC',
    transform: [{ scale: 0.985 }],
  },

  optionIcon: {
    marginRight: 12,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1512',
  },

  optionGhostText: {
    color: '#5C534C',
  },

  /* =========================================================
    SUCCESS
    ========================================================= */

  successRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(26,21,18,0.58)',
  },

  successCard: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 34,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },

  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1F6B45',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
  },

  successTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    color: '#1A1512',
    textAlign: 'center',
  },

  successSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#5C534C',
    textAlign: 'center',
    marginTop: 7,
  },

  successProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 17,
  },

  successProgressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9A4B23',
    marginRight: 7,
  },

  successHint: {
    fontSize: 12,
    lineHeight: 17,
    color: '#8A8179',
  },
});
