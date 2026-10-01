import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Bell,
  CaretRight,
  Clock,
  Gear,
  Info,
  LockKey,
  Question,
  SignOut,
  Storefront,
} from 'phosphor-react-native';

import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';

/* ============================================================
   TYPES
============================================================ */

type UserData = {
  id?: number;
  userId?: number;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  pharmacyId?: number;
  storeName?: string;
};

type DayHours = {
  enabled: boolean;
  open: string;
  close: string;
};

type BusinessHours = Record<string, DayHours>;

/* ============================================================
   CONSTANTS
============================================================ */

const COLORS = {
  background: '#F9F7F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE7',

  primary: '#9A4B23',
  primaryPressed: '#7B3A19',
  primarySoft: '#F6E6DC',

  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',

  border: '#E0D8CE',
  divider: '#EEE9E3',

  success: '#1F6B45',
  successSoft: '#E4F1EA',

  danger: '#A82520',
  dangerSoft: '#FFF0EE',

  info: '#2A5A96',
};

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  Monday: {
    enabled: true,
    open: '09:00 AM',
    close: '09:00 PM',
  },
  Tuesday: {
    enabled: true,
    open: '09:00 AM',
    close: '09:00 PM',
  },
  Wednesday: {
    enabled: true,
    open: '09:00 AM',
    close: '09:00 PM',
  },
  Thursday: {
    enabled: true,
    open: '09:00 AM',
    close: '09:00 PM',
  },
  Friday: {
    enabled: true,
    open: '09:00 AM',
    close: '09:00 PM',
  },
  Saturday: {
    enabled: true,
    open: '09:00 AM',
    close: '09:00 PM',
  },
  Sunday: {
    enabled: false,
    open: '09:00 AM',
    close: '09:00 PM',
  },
};

/* ============================================================
   PRESS SCALE
   Very subtle professional interaction feedback
============================================================ */

function usePressScale(scaleTo = 0.985) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: scaleTo,
      damping: 20,
      stiffness: 400,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [scale, scaleTo]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 20,
      stiffness: 400,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return {
    animatedStyle: {
      transform: [{ scale }],
    },
    onPressIn,
    onPressOut,
  };
}

/* ============================================================
   MENU ITEM
============================================================ */

type MenuItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
};

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  rightElement,
}: MenuItemProps) {
  const press = usePressScale();

  return (
    <Animated.View style={press.animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && styles.menuItemPressed,
        ]}
        android_ripple={{
          color: '#F1EDE7',
        }}
      >
        <View style={styles.menuIcon}>{icon}</View>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>{title}</Text>

          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>

        {rightElement}

        {showChevron && !rightElement && (
          <CaretRight
            size={19}
            color={COLORS.textMuted}
            weight="regular"
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ============================================================
   SCREEN
============================================================ */

export default function ProfileScreen() {
  const [user, setUser] = useState<UserData | null>(null);

  const [isOnline, setIsOnline] = useState(true);

  const [notifications, setNotifications] = useState(true);

  const [logoutModalVisible, setLogoutModalVisible] =
    useState(false);

  const [businessHoursModalVisible, setBusinessHoursModalVisible] =
    useState(false);

  const [businessHours, setBusinessHours] =
    useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);

  /* ----------------------------------------------------------
     Entrance animation
  ---------------------------------------------------------- */

  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();
    loadSettings();

    Animated.timing(entrance, {
      toValue: 1,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  /* ==========================================================
     LOAD USER
  ========================================================== */

  const loadUser = async () => {
    try {
      const storedUser =
        await AsyncStorage.getItem('medbuy_user');

      if (!storedUser) {
        return;
      }

      const parsedUser: UserData = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.log('Failed to load user:', error);
    }
  };

  /* ==========================================================
     LOAD SETTINGS
  ========================================================== */

  const loadSettings = async () => {
    try {
      const storedNotifications =
        await AsyncStorage.getItem(
          'medbuy_notifications_enabled'
        );

      if (storedNotifications !== null) {
        setNotifications(
          storedNotifications === 'true'
        );
      }

      const storedHours =
        await AsyncStorage.getItem(
          'medbuy_business_hours'
        );

      if (storedHours) {
        const parsedHours = JSON.parse(
          storedHours
        );

        setBusinessHours(parsedHours);
      }
    } catch (error) {
      console.log(
        'Failed to load profile settings:',
        error
      );
    }
  };

  /* ==========================================================
     USER DISPLAY DATA
  ========================================================== */

  const storeName = useMemo(
    () => user?.storeName || 'Pharmacy Store',
    [user]
  );

  const ownerName = useMemo(
    () => user?.name || 'Store Owner',
    [user]
  );

  /* ==========================================================
     INITIALS
  ========================================================== */

  const initials = useMemo(() => {
    if (!ownerName) {
      return 'MS';
    }

    const parts = ownerName
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }, [ownerName]);

  /* ==========================================================
     BUSINESS HOURS SUMMARY
  ========================================================== */

  const businessHoursSummary = useMemo(() => {
    const enabledDays = DAYS.filter(
      (day) => businessHours[day]?.enabled
    );

    if (enabledDays.length === 0) {
      return 'Closed every day';
    }

    const firstDay = businessHours[enabledDays[0]];

    const sameHours = enabledDays.every(
      (day) =>
        businessHours[day]?.open === firstDay?.open &&
        businessHours[day]?.close === firstDay?.close
    );

    if (
      enabledDays.length === 7 &&
      sameHours
    ) {
      return `${firstDay.open} – ${firstDay.close}`;
    }

    if (
      enabledDays.length === 6 &&
      !businessHours.Sunday.enabled &&
      sameHours
    ) {
      return `Mon – Sat · ${firstDay.open} – ${firstDay.close}`;
    }

    if (sameHours) {
      return `${enabledDays.length} days · ${firstDay.open} – ${firstDay.close}`;
    }

    return `${enabledDays.length} days configured`;
  }, [businessHours]);

  /* ==========================================================
     SAVE NOTIFICATIONS
  ========================================================== */

  const handleNotificationsChange = async (
    value: boolean
  ) => {
    setNotifications(value);

    try {
      await AsyncStorage.setItem(
        'medbuy_notifications_enabled',
        String(value)
      );
    } catch (error) {
      console.log(
        'Failed to save notification setting:',
        error
      );
    }
  };

  /* ==========================================================
     BUSINESS HOURS
  ========================================================== */

  const openBusinessHours = () => {
    setBusinessHoursModalVisible(true);
  };

  const updateDayEnabled = (
    day: string,
    enabled: boolean
  ) => {
    setBusinessHours((current) => ({
      ...current,
      [day]: {
        ...current[day],
        enabled,
      },
    }));
  };

  const updateDayOpen = (
    day: string,
    value: string
  ) => {
    setBusinessHours((current) => ({
      ...current,
      [day]: {
        ...current[day],
        open: value,
      },
    }));
  };

  const updateDayClose = (
    day: string,
    value: string
  ) => {
    setBusinessHours((current) => ({
      ...current,
      [day]: {
        ...current[day],
        close: value,
      },
    }));
  };

  const saveBusinessHours = async () => {
    try {
      await AsyncStorage.setItem(
        'medbuy_business_hours',
        JSON.stringify(businessHours)
      );

      setBusinessHoursModalVisible(false);
    } catch (error) {
      console.log(
        'Failed to save business hours:',
        error
      );
    }
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const openHome = () => {
    router.replace('/pharmacy-side/home');
  };

  const openOrders = () => {
    router.replace('/pharmacy-side/orders');
  };

  const openHistory = () => {
    router.replace('/pharmacy-side/history');
  };

  const openStoreInformation = () => {
    router.push('/pharmacy-side/store-information');
  };

  const openNotifications = () => {
    router.push('/pharmacy-side/notifications');
  };

  const openPrivacySecurity = () => {
    router.push('/pharmacy-side/privacy-security');
  };

  const openSettings = () => {
    router.push('/pharmacy-side/settings');
  };

  const openHelpSupport = () => {
    router.push('/pharmacy-side/help-support');
  };

  const openAbout = () => {
    router.push('/pharmacy-side/about');
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('medbuy_user');

      setLogoutModalVisible(false);

      router.replace('/role-selection');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  /* ==========================================================
     ANIMATION STYLE
  ========================================================== */

  const entranceStyle = {
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={entranceStyle}>

            {/* ==================================================
                HEADER
            ================================================== */}

            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  Profile
                </Text>

                <Text style={styles.subtitle}>
                  Manage your pharmacy account
                </Text>
              </View>

              {/* SETTINGS ICON */}
              <Pressable
                onPress={openSettings}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.headerButtonPressed,
                ]}
                hitSlop={8}
              >
                <Gear
                  size={21}
                  color={COLORS.textPrimary}
                  weight="regular"
                />
              </Pressable>
            </View>

            {/* ==================================================
                PROFILE CARD
                IMPORTANT:
                NO EMAIL / PHONE HERE
            ================================================== */}

            <View style={styles.profileCard}>
              <View style={styles.profileTop}>

                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {initials}
                  </Text>
                </View>

                <View style={styles.profileMain}>
                  <Text
                    style={styles.storeName}
                    numberOfLines={1}
                  >
                    {storeName}
                  </Text>

                  <Text
                    style={styles.ownerName}
                    numberOfLines={1}
                  >
                    {ownerName}
                  </Text>

                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isOnline
                            ? COLORS.success
                            : COLORS.textMuted,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isOnline
                            ? COLORS.success
                            : COLORS.textSecondary,
                        },
                      ]}
                    >
                      {isOnline
                        ? 'Online'
                        : 'Offline'}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={isOnline}
                  onValueChange={setIsOnline}
                  trackColor={{
                    false: '#D7D0C8',
                    true: '#AFCDBD',
                  }}
                  thumbColor={
                    isOnline
                      ? COLORS.success
                      : '#FFFFFF'
                  }
                  ios_backgroundColor="#D7D0C8"
                />
              </View>
            </View>

            {/* ==================================================
                ACCOUNT
            ================================================== */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Account
              </Text>

              <View style={styles.menuCard}>

                {/* STORE INFORMATION */}

                <MenuItem
                  icon={
                    <Storefront
                      size={21}
                      color={COLORS.primary}
                      weight="regular"
                    />
                  }
                  title="Store Information"
                  subtitle="View pharmacy and owner details"
                  onPress={openStoreInformation}
                />

                <View style={styles.menuDivider} />

                {/* BUSINESS HOURS */}

                <MenuItem
                  icon={
                    <Clock
                      size={21}
                      color={COLORS.primary}
                      weight="regular"
                    />
                  }
                  title="Business Hours"
                  subtitle={businessHoursSummary}
                  onPress={openBusinessHours}
                />
              </View>
            </View>

            {/* ==================================================
                SETTINGS
            ================================================== */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Settings
              </Text>

              <View style={styles.menuCard}>

                {/* NOTIFICATIONS */}

                <MenuItem
                  icon={
                    <Bell
                      size={21}
                      color={COLORS.primary}
                      weight="regular"
                    />
                  }
                  title="Notifications"
                  subtitle="Order alerts and updates"
                  onPress={openNotifications}
                />

                <View style={styles.menuDivider} />

                {/* PRIVACY */}

                <MenuItem
                  icon={
                    <LockKey
                      size={21}
                      color={COLORS.primary}
                      weight="regular"
                    />
                  }
                  title="Privacy & Security"
                  subtitle="Password and account security"
                  onPress={openPrivacySecurity}
                />

                <View style={styles.menuDivider} />

                {/* GENERAL SETTINGS */}

                <MenuItem
                  icon={
                    <Gear
                      size={21}
                      color={COLORS.primary}
                      weight="regular"
                    />
                  }
                  title="Settings"
                  subtitle="Manage app preferences"
                  onPress={openSettings}
                />
              </View>
            </View>

            {/* ==================================================
                SUPPORT
            ================================================== */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Support
              </Text>

              <View style={styles.menuCard}>

                {/* HELP */}

                <MenuItem
                  icon={
                    <Question
                      size={21}
                      color={COLORS.info}
                      weight="regular"
                    />
                  }
                  title="Help & Support"
                  subtitle="Get help with your account or orders"
                  onPress={openHelpSupport}
                />

                <View style={styles.menuDivider} />

                {/* ABOUT */}

                <MenuItem
                  icon={
                    <Info
                      size={21}
                      color={COLORS.textSecondary}
                      weight="regular"
                    />
                  }
                  title="About MedBuy"
                  subtitle="Version 1.0.0"
                  onPress={openAbout}
                />
              </View>
            </View>

            {/* ==================================================
                LOGOUT
            ================================================== */}

            <View style={styles.logoutContainer}>
              <Pressable
                onPress={() =>
                  setLogoutModalVisible(true)
                }
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed &&
                  styles.logoutButtonPressed,
                ]}
              >
                <SignOut
                  size={20}
                  color={COLORS.danger}
                  weight="regular"
                />

                <Text style={styles.logoutText}>
                  Log Out
                </Text>
              </Pressable>
            </View>

            <Text style={styles.versionText}>
              MedBuy Pharmacy Partner · v1.0.0
            </Text>

          </Animated.View>
        </ScrollView>

        {/* ======================================================
            BOTTOM NAVIGATION
        ====================================================== */}

        <View style={styles.bottomNav}>

          <Pressable
            style={styles.navItem}
            onPress={openHome}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#6B615A"
            />

            <Text style={styles.navText}>
              Home
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={openOrders}
          >
            <Ionicons
              name="receipt-outline"
              size={22}
              color="#6B615A"
            />

            <Text style={styles.navText}>
              Orders
            </Text>
          </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={openHistory}
          >
            <Ionicons
              name="time-outline"
              size={22}
              color="#6B615A"
            />

            <Text style={styles.navText}>
              History
            </Text>
          </Pressable>

          <Pressable style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Ionicons
                name="person"
                size={21}
                color="#9A4B23"
              />
            </View>

            <Text style={styles.navTextActive}>
              Profile
            </Text>
          </Pressable>

        </View>

        {/* ======================================================
            BUSINESS HOURS MODAL
        ====================================================== */}

        <Modal
          visible={businessHoursModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setBusinessHoursModalVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.hoursModal}>

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    Business Hours
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Set your pharmacy operating hours
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setBusinessHoursModalVisible(false)
                  }
                  style={styles.modalClose}
                >
                  <Text style={styles.modalCloseText}>
                    ×
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.hoursScroll}
              >
                {DAYS.map((day) => {
                  const dayData =
                    businessHours[day];

                  return (
                    <View
                      key={day}
                      style={styles.dayRow}
                    >
                      <View
                        style={styles.dayTop}
                      >
                        <Text style={styles.dayName}>
                          {day}
                        </Text>

                        <Switch
                          value={dayData.enabled}
                          onValueChange={(value) =>
                            updateDayEnabled(
                              day,
                              value
                            )
                          }
                          trackColor={{
                            false: '#D7D0C8',
                            true: '#CFAE9C',
                          }}
                          thumbColor={
                            dayData.enabled
                              ? COLORS.primary
                              : '#FFFFFF'
                          }
                          ios_backgroundColor="#D7D0C8"
                        />
                      </View>

                      {dayData.enabled && (
                        <View
                          style={styles.timeRow}
                        >
                          <View
                            style={
                              styles.timeField
                            }
                          >
                            <Text
                              style={
                                styles.timeLabel
                              }
                            >
                              Opens
                            </Text>

                            <Pressable
                              style={
                                styles.timeInput
                              }
                              onPress={() => {
                                const next =
                                  dayData.open ===
                                    '09:00 AM'
                                    ? '10:00 AM'
                                    : dayData.open ===
                                      '10:00 AM'
                                      ? '11:00 AM'
                                      : '09:00 AM';

                                updateDayOpen(
                                  day,
                                  next
                                );
                              }}
                            >
                              <Text
                                style={
                                  styles.timeValue
                                }
                              >
                                {dayData.open}
                              </Text>
                            </Pressable>
                          </View>

                          <View
                            style={
                              styles.timeSeparator
                            }
                          >
                            <Text
                              style={
                                styles.timeSeparatorText
                              }
                            >
                              —
                            </Text>
                          </View>

                          <View
                            style={
                              styles.timeField
                            }
                          >
                            <Text
                              style={
                                styles.timeLabel
                              }
                            >
                              Closes
                            </Text>

                            <Pressable
                              style={
                                styles.timeInput
                              }
                              onPress={() => {
                                const next =
                                  dayData.close ===
                                    '09:00 PM'
                                    ? '10:00 PM'
                                    : dayData.close ===
                                      '10:00 PM'
                                      ? '11:00 PM'
                                      : '09:00 PM';

                                updateDayClose(
                                  day,
                                  next
                                );
                              }}
                            >
                              <Text
                                style={
                                  styles.timeValue
                                }
                              >
                                {dayData.close}
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>

              <View
                style={styles.modalFooter}
              >
                <Pressable
                  onPress={() =>
                    setBusinessHoursModalVisible(false)
                  }
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveBusinessHours}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveText}>
                    Save Hours
                  </Text>
                </Pressable>
              </View>

            </View>
          </View>
        </Modal>

        {/* ======================================================
            LOGOUT MODAL
        ====================================================== */}

        <Modal
          visible={logoutModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setLogoutModalVisible(false)
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.logoutModal}>

              <View style={styles.logoutModalIcon}>
                <SignOut
                  size={25}
                  color={COLORS.danger}
                  weight="regular"
                />
              </View>

              <Text style={styles.logoutModalTitle}>
                Log out?
              </Text>

              <Text style={styles.logoutModalText}>
                Are you sure you want to log out of
                your pharmacy account?
              </Text>

              <View style={styles.logoutModalButtons}>

                <Pressable
                  onPress={() =>
                    setLogoutModalVisible(false)
                  }
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleLogout}
                  style={
                    styles.confirmLogoutButton
                  }
                >
                  <Text
                    style={
                      styles.confirmLogoutText
                    }
                  >
                    Log Out
                  </Text>
                </Pressable>

              </View>

            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 105,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 18,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonPressed: {
    backgroundColor: COLORS.surfaceAlt,
    transform: [{ scale: 0.97 }],
  },

  /* ==========================================================
     PROFILE CARD
  ========================================================== */

  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },

  profileMain: {
    flex: 1,
    marginLeft: 13,
    marginRight: 8,
  },

  storeName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  ownerName: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* ==========================================================
     SECTIONS
  ========================================================== */

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 9,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  menuCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: 'hidden',
  },

  menuItem: {
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemPressed: {
    backgroundColor: '#FBF9F6',
  },

  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  menuContent: {
    flex: 1,
    marginRight: 8,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },

  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 62,
  },

  /* ==========================================================
     LOGOUT
  ========================================================== */

  logoutContainer: {
    marginTop: 24,
  },

  logoutButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8C9C6',
    backgroundColor: '#FFF8F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutButtonPressed: {
    backgroundColor: COLORS.dangerSoft,
    transform: [{ scale: 0.99 }],
  },

  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.danger,
  },

  versionText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textMuted,
  },

  /* ==========================================================
     BOTTOM NAV
  ========================================================== */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0D8CE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 5,
  },

  navItem: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeNavIcon: {
    width: 36,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F6E6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    marginTop: 3,
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500',
    color: '#6B615A',
  },

  navTextActive: {
    marginTop: 3,
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600',
    color: '#9A4B23',
  },

  /* ==========================================================
     MODAL OVERLAY
  ========================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 21, 18, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  /* ==========================================================
     BUSINESS HOURS MODAL
  ========================================================== */

  hoursModal: {
    width: '100%',
    maxWidth: 390,
    maxHeight: '84%',
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCloseText: {
    fontSize: 24,
    lineHeight: 27,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  hoursScroll: {
    paddingHorizontal: 20,
  },

  dayRow: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  dayTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  timeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  timeField: {
    flex: 1,
  },

  timeLabel: {
    marginBottom: 5,
    fontSize: 10,
    color: COLORS.textMuted,
  },

  timeInput: {
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FCFAF8',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  timeValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  timeSeparator: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },

  timeSeparatorText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  modalFooter: {
    padding: 16,
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    backgroundColor: COLORS.surface,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.surface,
  },

  /* ==========================================================
     LOGOUT MODAL
  ========================================================== */

  logoutModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 22,
    alignItems: 'center',
  },

  logoutModalIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutModalTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  logoutModalText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  logoutModalButtons: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 21,
  },

  confirmLogoutButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmLogoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
