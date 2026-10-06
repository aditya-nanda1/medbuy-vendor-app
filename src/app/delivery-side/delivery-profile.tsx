import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bicycle,
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  EnvelopeSimple,
  Gear,
  House,
  IdentificationCard,
  Package,
  Person,
  Phone,
  Power,
  Receipt,
  SignOut,
  X
} from 'phosphor-react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ============================================================
   MEDBUY DELIVERY PROFILE
   ============================================================ */

const COLORS = {
  primary: '#9A4B23',
  pressed: '#7B3A19',
  subtle: '#F6E6DC',

  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE7',
  background: '#F9F7F4',

  border: '#E0D8CE',

  textPrimary: '#1A1512',
  textSecondary: '#5C534C',

  success: '#1F6B45',
  successSubtle: '#DDF0E5',

  danger: '#A82520',
  dangerSubtle: '#F8E5E3',

  neutral: '#6B615A',
};

const NAV_HEIGHT = 76;

/* ============================================================
   TYPES
   ============================================================ */

type DeliveryUser = {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  token?: string;

  // Kept flexible in case more fields are added later.
  [key: string]: unknown;
};

/* ============================================================
   PRESS SCALE
   ============================================================ */

function usePressScale(pressedScale = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: pressedScale,
      duration: 90,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [scale, pressedScale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 14,
      stiffness: 320,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return {
    scale,
    onPressIn,
    onPressOut,
  };
}

/* ============================================================
   ANIMATED SECTION
   ============================================================ */

const AnimatedSection = memo(
  function AnimatedSection({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
      const animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 420,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(translateY, {
          toValue: 0,
          duration: 420,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }, [opacity, translateY, delay]);

    return (
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
        }}
      >
        {children}
      </Animated.View>
    );
  }
);

/* ============================================================
   PROFILE ROW
   ============================================================ */

const ProfileRow = memo(
  function ProfileRow({
    icon,
    title,
    subtitle,
    danger = false,
    last = false,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    danger?: boolean;
    last?: boolean;
    onPress: () => void;
  }) {
    const press = usePressScale(0.985);

    return (
      <View>
        <Pressable
          onPress={onPress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          accessibilityRole="button"
          accessibilityLabel={title}
        >
          <Animated.View
            style={[
              styles.profileRow,
              {
                transform: [{ scale: press.scale }],
              },
            ]}
          >
            <View
              style={[
                styles.profileRowIcon,
                danger && styles.profileRowIconDanger,
              ]}
            >
              {icon}
            </View>

            <View style={styles.profileRowContent}>
              <Text
                style={[
                  styles.profileRowTitle,
                  danger && styles.profileRowTitleDanger,
                ]}
              >
                {title}
              </Text>

              <Text style={styles.profileRowSubtitle}>
                {subtitle}
              </Text>
            </View>

            <CaretRight
              size={20}
              color={danger ? COLORS.danger : COLORS.neutral}
            />
          </Animated.View>
        </Pressable>

        {!last && <View style={styles.profileDivider} />}
      </View>
    );
  }
);

/* ============================================================
   BOTTOM NAV ITEM
   ============================================================ */

const BottomNavItem = memo(
  function BottomNavItem({
    icon,
    label,
    active = false,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onPress: () => void;
  }) {
    const press = usePressScale(0.94);

    return (
      <Pressable
        style={styles.navItem}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: active }}
      >
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: press.scale }],
          }}
        >
          <View
            style={[
              styles.navIconWrapper,
              active && styles.navIconWrapperActive,
            ]}
          >
            {icon}
          </View>

          <Text
            style={[
              styles.navLabel,
              active && styles.navLabelActive,
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  }
);

/* ============================================================
   DETAIL ITEM
   ============================================================ */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>{icon}</View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   PROFILE SCREEN
   ============================================================ */

export default function DeliveryProfile() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<DeliveryUser>({});
  const [isOnline, setIsOnline] = useState(false);
  const [trips, setTrips] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const screenOpacity = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(1)).current;

  /* ==========================================================
     LOAD EVERYTHING FROM ASYNC STORAGE
     ========================================================== */

  const loadProfile = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('medbuy_user');

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser);
          }
        } catch (error) {
          console.log('Invalid medbuy_user:', error);
        }
      }

      const storedOnline = await AsyncStorage.getItem(
        'medbuy_delivery_online'
      );

      setIsOnline(storedOnline === 'true');

      const storedEarnings = await AsyncStorage.getItem(
        'medbuy_delivery_earnings'
      );

      if (storedEarnings) {
        try {
          const parsed = JSON.parse(storedEarnings);

          setTrips(Number(parsed?.trips) || 0);
        } catch {
          setTrips(0);
        }
      }
    } catch (error) {
      console.log('Unable to load delivery profile:', error);
    }
  }, []);

  /* ==========================================================
     SCREEN ENTRANCE
     ========================================================== */

  useEffect(() => {
    Animated.timing(screenOpacity, {
      toValue: 1,
      duration: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    return () => {
      screenOpacity.stopAnimation();
    };
  }, [screenOpacity]);

  /* ==========================================================
     RELOAD ON FOCUS + PULL TO REFRESH
     So availability and trip counts never go stale after
     changes made on Home or Deliveries.
     ========================================================== */

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);

  /* ==========================================================
     ONLINE STATUS PULSE
     Gentle pulse on the status dot while online. Native driver
     only, on its own isolated view.
     ========================================================== */

  useEffect(() => {
    if (!isOnline) {
      statusPulse.stopAnimation();
      statusPulse.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(statusPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [isOnline, statusPulse]);

  /* ==========================================================
     AVAILABILITY TOGGLE
     Writes medbuy_delivery_online so Home and Deliveries see
     the same state.
     ========================================================== */

  const toggleOnline = useCallback(() => {
    setIsOnline((previous) => {
      const next = !previous;

      AsyncStorage.setItem(
        'medbuy_delivery_online',
        next ? 'true' : 'false'
      ).catch((error) =>
        console.log('Unable to save online status:', error)
      );

      return next;
    });
  }, []);

  /* ==========================================================
     USER DATA
     ========================================================== */

  const actualName =
    typeof user.name === 'string' && user.name.trim()
      ? user.name.trim()
      : 'Delivery Partner';

  const actualEmail =
    typeof user.email === 'string' && user.email.trim()
      ? user.email.trim()
      : 'Not available';

  const actualPhone =
    typeof user.phone === 'string' && user.phone.trim()
      ? user.phone.trim()
      : 'Not available';

  const hasId =
    user.id !== undefined && user.id !== null && user.id !== '';

  const actualId = hasId
    ? String(user.id)
    : 'Not available';

  const displayId = hasId
    ? `#${actualId}`
    : 'Not available';

  const actualRole =
    typeof user.role === 'string' && user.role.trim()
      ? user.role.replace(/_/g, ' ')
      : 'Delivery Agent';

  const formattedRole =
    actualRole.charAt(0).toUpperCase() +
    actualRole.slice(1);

  const initial =
    actualName.charAt(0).toUpperCase() || 'D';

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const goBack = useCallback(() => {
    router.replace('/delivery-side/delivery-home');
  }, []);

  const openHome = useCallback(() => {
    router.replace('/delivery-side/delivery-home');
  }, []);

  const openDeliveries = useCallback(() => {
    router.replace('/delivery-side/deliveries');
  }, []);

  const openHistory = useCallback(() => {
    router.replace('/delivery-side/delivery-history');
  }, []);

  const openProfile = useCallback(() => {
    // Already here.
    loadProfile();
  }, [loadProfile]);

  const openHistoryFromSettings = useCallback(() => {
    setSettingsVisible(false);
    router.replace('/delivery-side/delivery-history');
  }, []);

  /* ==========================================================
     ACCOUNT SETTINGS
     ========================================================== */

  const openSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsVisible(false);
  }, []);

  /* ==========================================================
     LOGOUT
     ========================================================== */

  const performLogout = useCallback(async () => {
    try {
      /*
       * Remove the session.
       *
       * We intentionally keep delivery preferences/history
       * separate from the login session.
       */
      await AsyncStorage.multiRemove([
        'medbuy_user',
        'medbuy_token',
      ]);

      setSettingsVisible(false);

      router.replace('/delivery-side/delivery-login');
    } catch (error) {
      console.log('Logout error:', error);

      Alert.alert(
        'Logout failed',
        'Unable to sign you out right now. Please try again.'
      );
    }
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log out',
      `Are you sure you want to log out of ${actualName}'s account?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  }, [actualName, performLogout]);

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View
        style={[
          styles.main,
          {
            opacity: screenOpacity,
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + 12,
              paddingBottom:
                NAV_HEIGHT + insets.bottom + 32,
            },
          ]}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <Pressable
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
            >
              <CaretLeft
                size={22}
                color={COLORS.textPrimary}
                weight="bold"
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                Profile
              </Text>

              <Text style={styles.headerSubtitle}>
                Your partner account
              </Text>
            </View>
          </View>

          {/* ==================================================
              PROFILE HERO
          ================================================== */}

          <AnimatedSection delay={60}>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.avatarLarge}>
                  <Text style={styles.avatarLargeText}>
                    {initial}
                  </Text>

                  <View style={styles.avatarBadge}>
                    <CheckCircle
                      size={17}
                      color={COLORS.surface}
                      weight="fill"
                    />
                  </View>
                </View>

                <View style={styles.heroCopy}>
                  <Text
                    style={styles.heroName}
                    numberOfLines={2}
                  >
                    {actualName}
                  </Text>

                  <Text
                    style={styles.heroEmail}
                    numberOfLines={1}
                  >
                    {actualEmail}
                  </Text>

                  <View style={styles.roleBadge}>
                    <Bicycle
                      size={13}
                      color={COLORS.primary}
                      weight="bold"
                    />

                    <Text style={styles.roleBadgeText}>
                      {formattedRole}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.statusLine}>
                <Animated.View
                  style={[
                    styles.statusDot,
                    isOnline && styles.statusDotOnline,
                    { opacity: statusPulse },
                  ]}
                />

                <Text style={styles.statusText}>
                  {isOnline
                    ? 'Currently available for deliveries'
                    : 'Currently offline'}
                </Text>

                <Pressable
                  onPress={toggleOnline}
                  style={({ pressed }) => [
                    styles.statusToggle,
                    isOnline && styles.statusToggleOnline,
                    pressed && styles.statusTogglePressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isOnline ? 'Go offline' : 'Go online'
                  }
                  accessibilityState={{ selected: isOnline }}
                >
                  <Text
                    style={[
                      styles.statusToggleText,
                      isOnline && styles.statusToggleTextOnline,
                    ]}
                  >
                    {isOnline ? 'Go offline' : 'Go online'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </AnimatedSection>

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <AnimatedSection delay={120}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Personal information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Details linked to your account
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <DetailItem
                icon={
                  <Person
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Full name"
                value={actualName}
              />

              <View style={styles.detailDivider} />

              <DetailItem
                icon={
                  <EnvelopeSimple
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Email address"
                value={actualEmail}
              />

              <View style={styles.detailDivider} />

              <DetailItem
                icon={
                  <Phone
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Phone number"
                value={actualPhone}
              />

              <View style={styles.detailDivider} />

              <DetailItem
                icon={
                  <IdentificationCard
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Partner ID"
                value={displayId}
              />
            </View>
          </AnimatedSection>

          {/* ==================================================
              QUICK FACTS
          ================================================== */}

          <AnimatedSection delay={180}>
            <View style={styles.factsCard}>
              <View style={styles.factItem}>
                <View style={styles.factIcon}>
                  <Bicycle
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                </View>

                <Text style={styles.factValue}>
                  {String(trips)}
                </Text>

                <Text style={styles.factLabel}>
                  Total trips
                </Text>
              </View>

              <View style={styles.factDivider} />

              <Pressable
                style={styles.factItem}
                onPress={toggleOnline}
                accessibilityRole="button"
                accessibilityLabel={
                  isOnline
                    ? 'Availability, online. Tap to go offline'
                    : 'Availability, offline. Tap to go online'
                }
                accessibilityState={{ selected: isOnline }}
              >
                <View
                  style={[
                    styles.factIcon,
                    isOnline && styles.factIconOnline,
                  ]}
                >
                  <Power
                    size={20}
                    color={
                      isOnline
                        ? COLORS.success
                        : COLORS.neutral
                    }
                    weight="regular"
                  />
                </View>

                <Text style={styles.factValue}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>

                <Text style={styles.factLabel}>
                  Availability · tap to change
                </Text>
              </Pressable>
            </View>
          </AnimatedSection>

          {/* ==================================================
              ACCOUNT
          ================================================== */}

          <AnimatedSection delay={240}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Account
              </Text>

              <Text style={styles.sectionSubtitle}>
                Manage your delivery partner account
              </Text>
            </View>

            <View style={styles.accountCard}>
              <ProfileRow
                icon={
                  <Receipt
                    size={22}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Delivery history"
                subtitle="View your completed deliveries"
                onPress={openHistory}
              />

              <ProfileRow
                icon={
                  <Gear
                    size={22}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Account settings"
                subtitle="View account details and session"
                onPress={openSettings}
              />

              <ProfileRow
                last
                danger
                icon={
                  <SignOut
                    size={22}
                    color={COLORS.danger}
                    weight="regular"
                  />
                }
                title="Log out"
                subtitle="Sign out of this device"
                onPress={handleLogout}
              />
            </View>
          </AnimatedSection>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <Text style={styles.footer}>
            MedBuy Delivery Partner · v1.0.0
          </Text>
        </ScrollView>

        {/* ====================================================
            BOTTOM NAVIGATION
        ==================================================== */}

        <View
          style={[
            styles.bottomNav,
            {
              height: NAV_HEIGHT + insets.bottom,
              paddingBottom: insets.bottom + 4,
            },
          ]}
        >
          <BottomNavItem
            label="Home"
            icon={
              <House
                size={21}
                color={COLORS.neutral}
                weight="regular"
              />
            }
            onPress={openHome}
          />

          <BottomNavItem
            label="Deliveries"
            icon={
              <Package
                size={21}
                color={COLORS.neutral}
                weight="regular"
              />
            }
            onPress={openDeliveries}
          />

          <BottomNavItem
            label="History"
            icon={
              <Clock
                size={21}
                color={COLORS.neutral}
                weight="regular"
              />
            }
            onPress={openHistory}
          />

          <BottomNavItem
            active
            label="Profile"
            icon={
              <Person
                size={21}
                color={COLORS.primary}
                weight="fill"
              />
            }
            onPress={openProfile}
          />
        </View>
      </Animated.View>

      {/* ======================================================
          ACCOUNT SETTINGS MODAL
      ====================================================== */}

      <Modal
        visible={settingsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeSettings}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeSettings}
            accessibilityRole="button"
            accessibilityLabel="Close settings"
          />

          <View
            style={[
              styles.settingsSheet,
              {
                paddingBottom: Math.max(
                  22,
                  insets.bottom + 10
                ),
              },
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>
                  Account settings
                </Text>

                <Text style={styles.sheetSubtitle}>
                  Your account information
                </Text>
              </View>

              <Pressable
                onPress={closeSettings}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close settings"
              >
                <X
                  size={20}
                  color={COLORS.textPrimary}
                />
              </Pressable>
            </View>

            <View style={styles.sheetCard}>
              <DetailItem
                icon={
                  <Person
                    size={19}
                    color={COLORS.primary}
                  />
                }
                label="Name"
                value={actualName}
              />

              <View style={styles.detailDivider} />

              <DetailItem
                icon={
                  <EnvelopeSimple
                    size={19}
                    color={COLORS.primary}
                  />
                }
                label="Email"
                value={actualEmail}
              />

              <View style={styles.detailDivider} />

              <DetailItem
                icon={
                  <Phone
                    size={19}
                    color={COLORS.primary}
                  />
                }
                label="Phone"
                value={actualPhone}
              />

              <View style={styles.detailDivider} />

              <DetailItem
                icon={
                  <IdentificationCard
                    size={19}
                    color={COLORS.primary}
                  />
                }
                label="Partner ID"
                value={displayId}
              />
            </View>

            <Pressable
              onPress={toggleOnline}
              style={({ pressed }) => [
                styles.modalAvailabilityButton,
                pressed &&
                styles.modalAvailabilityButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                isOnline ? 'Go offline' : 'Go online'
              }
              accessibilityState={{ selected: isOnline }}
            >
              <Power
                size={20}
                color={
                  isOnline ? COLORS.success : COLORS.neutral
                }
              />

              <Text style={styles.modalAvailabilityText}>
                {isOnline
                  ? 'Availability: Online — tap to go offline'
                  : 'Availability: Offline — tap to go online'}
              </Text>
            </Pressable>

            <Pressable
              onPress={openHistoryFromSettings}
              style={({ pressed }) => [
                styles.modalHistoryButton,
                pressed && styles.modalHistoryButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="View delivery history"
            >
              <Receipt
                size={20}
                color={COLORS.primary}
              />

              <Text style={styles.modalHistoryText}>
                View delivery history
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.modalLogoutButton,
                pressed &&
                styles.modalLogoutButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Log out"
            >
              <SignOut
                size={20}
                color={COLORS.danger}
              />

              <Text style={styles.modalLogoutText}>
                Log out
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  main: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonPressed: {
    backgroundColor: COLORS.surfaceAlt,
    transform: [{ scale: 0.94 }],
  },

  headerText: {
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
  },

  /* HERO */

  heroCard: {
    marginTop: 20,
    padding: 17,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 23,
    backgroundColor: COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  avatarLargeText: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.primary,
  },

  avatarBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    borderWidth: 3,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCopy: {
    flex: 1,
    marginLeft: 15,
  },

  heroName: {
    fontSize: 21,
    lineHeight: 27,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  heroEmail: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: COLORS.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  roleBadgeText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'IBMPlexSans_500Medium',
    color: COLORS.primary,
  },

  heroDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 17,
    marginBottom: 12,
  },

  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neutral,
    marginRight: 7,
  },

  statusDotOnline: {
    backgroundColor: COLORS.success,
  },

  statusText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
  },

  statusToggle: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusToggleOnline: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  statusTogglePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  statusToggleText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.surface,
  },

  statusToggleTextOnline: {
    color: COLORS.textSecondary,
  },

  /* SECTIONS */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
  },

  /* DETAILS */

  detailsCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },

  detailItem: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    flex: 1,
    marginLeft: 12,
  },

  detailLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'IBMPlexSans_500Medium',
    color: COLORS.neutral,
  },

  detailValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_500Medium',
    color: COLORS.textPrimary,
  },

  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 52,
  },

  /* FACTS */

  factsCard: {
    marginTop: 16,
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  factItem: {
    flex: 1,
    alignItems: 'center',
  },

  factIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  factIconOnline: {
    backgroundColor: COLORS.successSubtle,
  },

  factValue: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 22,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  factLabel: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.neutral,
  },

  factDivider: {
    width: 1,
    height: 48,
    backgroundColor: COLORS.border,
  },

  /* ACCOUNT */

  accountCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  profileRow: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileRowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileRowIconDanger: {
    backgroundColor: COLORS.dangerSubtle,
  },

  profileRowContent: {
    flex: 1,
    marginLeft: 11,
  },

  profileRowTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_500Medium',
    color: COLORS.textPrimary,
  },

  profileRowTitleDanger: {
    color: COLORS.danger,
  },

  profileRowSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
  },

  profileDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 53,
  },

  /* FOOTER */

  footer: {
    marginTop: 28,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.neutral,
  },

  /* BOTTOM NAV */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },

  navItem: {
    width: 78,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconWrapper: {
    width: 36,
    height: 30,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconWrapperActive: {
    backgroundColor: COLORS.subtle,
  },

  navLabel: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'IBMPlexSans_500Medium',
    color: COLORS.neutral,
  },

  navLabelActive: {
    color: COLORS.primary,
  },

  /* SETTINGS MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 21, 18, 0.32)',
    justifyContent: 'flex-end',
  },

  settingsSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sheetTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  sheetSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'IBMPlexSans_400Regular',
    color: COLORS.textSecondary,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: COLORS.surfaceAlt,
  },

  sheetCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },

  modalAvailabilityButton: {
    minHeight: 50,
    borderRadius: 13,
    marginTop: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  modalAvailabilityButtonPressed: {
    backgroundColor: COLORS.surfaceAlt,
    transform: [{ scale: 0.98 }],
  },

  modalAvailabilityText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.textPrimary,
  },

  modalHistoryButton: {
    minHeight: 50,
    borderRadius: 13,
    marginTop: 10,
    backgroundColor: COLORS.subtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  modalHistoryButtonPressed: {
    backgroundColor: COLORS.surfaceAlt,
    transform: [{ scale: 0.98 }],
  },

  modalHistoryText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.primary,
  },

  modalLogoutButton: {
    minHeight: 50,
    borderRadius: 13,
    marginTop: 10,
    backgroundColor: COLORS.dangerSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  modalLogoutButtonPressed: {
    backgroundColor: COLORS.dangerSubtle,
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  modalLogoutText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'IBMPlexSans_600SemiBold',
    color: COLORS.danger,
  },
});
