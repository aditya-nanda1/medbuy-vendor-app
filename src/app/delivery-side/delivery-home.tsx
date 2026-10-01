import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  Bicycle,
  CaretRight,
  CheckCircle,
  Clock,
  CurrencyInr,
  Gear,
  House,
  Package,
  Person,
  Power,
  Receipt,
  Scooter,
} from 'phosphor-react-native';
import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ============================================================
   MEDBUY DELIVERY HOME
   Built strictly inside the MedBuy Design System (Vendor / warm
   clay): token colours only, IBM Plex Sans roles, 4pt spacing,
   radius scale, 44px minimum targets.
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
  warning: '#8A5A00',
  danger: '#A82520',
  info: '#2A5A96',
  neutral: '#6B615A',
};

const NAV_HEIGHT = 76;

/* ============================================================
   GREETING
   ============================================================ */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

/* ============================================================
   CURRENCY
   ============================================================ */

function inr(value: number) {
  return '₹' + Number(value || 0).toLocaleString('en-IN');
}

/* ============================================================
   PRESS SCALE HOOK
   ============================================================ */

function usePressScale(
  pressedScale = 0.96
) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

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
    const opacity = useRef(
      new Animated.Value(0)
    ).current;

    const translateY = useRef(
      new Animated.Value(16)
    ).current;

    useEffect(() => {
      const animation =
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 420,
            delay,
            easing:
              Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),

          Animated.timing(
            translateY,
            {
              toValue: 0,
              duration: 420,
              delay,
              easing:
                Easing.out(Easing.cubic),
              useNativeDriver: true,
            }
          ),
        ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }, [
      opacity,
      translateY,
      delay,
    ]);

    return (
      <Animated.View
        style={{
          opacity,
          transform: [
            {
              translateY,
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    );
  }
);

/* ============================================================
   STATUS TOGGLE
   Fixed geometry: label and track sit side by side in a normal
   row, so they can never overlap or stick out of the pill.
   44px tall per the design system's minimum target size.
   ============================================================ */

const OnlineToggle = memo(
  function OnlineToggle({
    isOnline,
    onToggle,
  }: {
    isOnline: boolean;
    onToggle: () => void;
  }) {
    const scale = useRef(
      new Animated.Value(1)
    ).current;

    const knobPosition = useRef(
      new Animated.Value(
        isOnline ? 1 : 0
      )
    ).current;

    useEffect(() => {
      Animated.spring(
        knobPosition,
        {
          toValue: isOnline ? 1 : 0,
          damping: 16,
          stiffness: 260,
          useNativeDriver: true,
        }
      ).start();
    }, [
      isOnline,
      knobPosition,
    ]);

    const handlePressIn =
      useCallback(() => {
        Animated.timing(scale, {
          toValue: 0.97,
          duration: 90,
          useNativeDriver: true,
        }).start();
      }, [scale]);

    const handlePressOut =
      useCallback(() => {
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 300,
          useNativeDriver: true,
        }).start();
      }, [scale]);

    const translateX =
      knobPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 18],
      });

    return (
      <Animated.View
        style={{
          transform: [{ scale }],
        }}
      >
        <Pressable
          onPress={onToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="switch"
          accessibilityState={{
            checked: isOnline,
          }}
          style={[
            styles.onlineToggle,
            isOnline &&
            styles.onlineToggleActive,
          ]}
        >
          <View
            style={styles.toggleLabelRow}
          >
            <View
              style={[
                styles.statusDot,
                isOnline
                  ? styles.statusDotOnline
                  : styles.statusDotOffline,
              ]}
            />

            <Text
              style={[
                styles.toggleText,
                isOnline &&
                styles.toggleTextActive,
              ]}
            >
              {isOnline
                ? 'Online'
                : 'Offline'}
            </Text>
          </View>

          <View
            style={[
              styles.toggleTrack,
              isOnline &&
              styles.toggleTrackActive,
            ]}
          >
            <Animated.View
              style={[
                styles.toggleKnob,
                {
                  transform: [
                    {
                      translateX,
                    },
                  ],
                },
              ]}
            />
          </View>
        </Pressable>
      </Animated.View>
    );
  }
);

/* ============================================================
   QUICK STAT CARD
   ============================================================ */

const QuickStat = memo(
  function QuickStat({
    icon,
    value,
    label,
  }: {
    icon: React.ReactNode;
    value: string;
    label: string;
  }) {
    return (
      <View style={styles.quickStat}>
        <View style={styles.quickStatIcon}>
          {icon}
        </View>

        <Text style={styles.quickStatValue}>
          {value}
        </Text>

        <Text style={styles.quickStatLabel}>
          {label}
        </Text>
      </View>
    );
  }
);

/* ============================================================
   EARNINGS CARD
   Standard surface card from the design system — token colours
   only, no custom fills.
   ============================================================ */

const EarningsCard = memo(
  function EarningsCard({
    today,
    week,
    month,
    trips,
    onDetails,
  }: {
    today: number;
    week: number;
    month: number;
    trips: number;
    onDetails: () => void;
  }) {
    return (
      <View style={styles.earningsCard}>
        <View
          style={styles.earningsTop}
        >
          <View
            style={styles.earningsIcon}
          >
            <CurrencyInr
              size={22}
              color={COLORS.primary}
              weight="regular"
            />
          </View>

          <View
            style={styles.earningsCopy}
          >
            <Text
              style={
                styles.earningsLabel
              }
            >
              Today's earnings
            </Text>

            <Text
              style={
                styles.earningsValue
              }
            >
              {inr(today)}
            </Text>
          </View>

          <Pressable
            onPress={onDetails}
            hitSlop={8}
            style={({ pressed }) => [
              styles.earningsLink,
              pressed &&
              styles.earningsLinkPressed,
            ]}
          >
            <Text
              style={
                styles.earningsLinkText
              }
            >
              Details
            </Text>

            <CaretRight
              size={16}
              color={COLORS.primary}
              weight="bold"
            />
          </Pressable>
        </View>

        <View
          style={
            styles.earningsDivider
          }
        />

        <View
          style={styles.earningsRow}
        >
          <View
            style={styles.earningsMini}
          >
            <Text
              style={
                styles.earningsMiniLabel
              }
            >
              This week
            </Text>

            <Text
              style={
                styles.earningsMiniValue
              }
            >
              {inr(week)}
            </Text>
          </View>

          <View
            style={styles.earningsMini}
          >
            <Text
              style={
                styles.earningsMiniLabel
              }
            >
              This month
            </Text>

            <Text
              style={
                styles.earningsMiniValue
              }
            >
              {inr(month)}
            </Text>
          </View>

          <View
            style={styles.earningsMini}
          >
            <Text
              style={
                styles.earningsMiniLabel
              }
            >
              Total trips
            </Text>

            <Text
              style={
                styles.earningsMiniValue
              }
            >
              {String(trips)}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

/* ============================================================
   EMPTY DELIVERY CARD
   ============================================================ */

const EmptyDeliveryCard = memo(
  function EmptyDeliveryCard({
    isOnline,
    onGoOnline,
  }: {
    isOnline: boolean;
    onGoOnline: () => void;
  }) {
    return (
      <View style={styles.emptyCard}>
        <View
          style={styles.emptyIllustration}
        >
          <Scooter
            size={40}
            color={COLORS.primary}
            weight="regular"
          />
        </View>

        <Text style={styles.emptyTitle}>
          {isOnline
            ? 'Waiting for a delivery'
            : 'You are offline'}
        </Text>

        <Text
          style={styles.emptyDescription}
        >
          {isOnline
            ? 'New delivery assignments will appear here when they are available nearby.'
            : 'Go online to receive nearby delivery assignments.'}
        </Text>

        {!isOnline && (
          <Pressable
            style={({ pressed }) => [
              styles.goOnlineButton,
              pressed &&
              styles.goOnlineButtonPressed,
            ]}
            onPress={onGoOnline}
          >
            <Text
              style={styles.goOnlineText}
            >
              Go online
            </Text>
          </Pressable>
        )}

        <View
          style={styles.emptyStatus}
        >
          <View
            style={[
              styles.emptyStatusDot,
              isOnline &&
              styles.emptyStatusDotOnline,
            ]}
          />

          <Text
            style={
              styles.emptyStatusText
            }
          >
            {isOnline
              ? 'You are ready to receive assignments'
              : 'Assignments are paused'}
          </Text>
        </View>
      </View>
    );
  }
);

/* ============================================================
   HOW IT WORKS
   ============================================================ */

const HowItWorks = memo(
  function HowItWorks() {
    const items = [
      {
        icon: Bell,
        title: 'Receive an assignment',
        description:
          'Nearby delivery requests appear when you are online.',
      },
      {
        icon: CheckCircle,
        title: 'Accept the delivery',
        description:
          'Review the pickup and drop details before accepting.',
      },
      {
        icon: Bicycle,
        title: 'Pick up and deliver',
        description:
          'Follow the delivery flow and complete the OTP handover.',
      },
    ];

    return (
      <View
        style={styles.howItWorksCard}
      >
        <View
          style={styles.sectionHeader}
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              How deliveries work
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Simple, step-by-step
            </Text>
          </View>
        </View>

        <View
          style={styles.stepsContainer}
        >
          {items.map(
            (item, index) => {
              const Icon = item.icon;

              return (
                <View
                  key={item.title}
                  style={
                    styles.stepRow
                  }
                >
                  <View
                    style={
                      styles.stepIcon
                    }
                  >
                    <Icon
                      size={22}
                      color={
                        COLORS.primary
                      }
                      weight="regular"
                    />
                  </View>

                  <View
                    style={
                      styles.stepContent
                    }
                  >
                    <Text
                      style={
                        styles.stepTitle
                      }
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={
                        styles.stepDescription
                      }
                    >
                      {item.description}
                    </Text>
                  </View>

                  {index <
                    items.length -
                    1 && (
                      <View
                        style={
                          styles.stepLine
                        }
                      />
                    )}
                </View>
              );
            }
          )}
        </View>
      </View>
    );
  }
);

/* ============================================================
   BOTTOM NAV
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
    const press = usePressScale(
      0.94
    );

    return (
      <Pressable
        style={styles.navItem}
        onPress={onPress}
        onPressIn={
          press.onPressIn
        }
        onPressOut={
          press.onPressOut
        }
      >
        <Animated.View
          style={{
            alignItems: 'center',
            justifyContent:
              'center',
            transform: [
              {
                scale:
                  press.scale,
              },
            ],
          }}
        >
          <View
            style={[
              styles.navIconWrapper,
              active &&
              styles.navIconWrapperActive,
            ]}
          >
            {icon}
          </View>

          <Text
            style={[
              styles.navLabel,
              active &&
              styles.navLabelActive,
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
   HOME SCREEN
   ============================================================ */

export default function DeliveryHome() {
  const { width, height } =
    useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const compact =
    width <= 380 || height <= 700;

  const [isOnline, setIsOnline] =
    useState(true);

  const [name, setName] =
    useState('Delivery Partner');

  const [loading, setLoading] =
    useState(true);

  const [greeting, setGreeting] =
    useState(getGreeting());

  const [earnings, setEarnings] =
    useState({
      today: 0,
      week: 0,
      month: 0,
      trips: 0,
    });

  /* ==========================================================
     LOAD USER + EARNINGS
     ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            'medbuy_user'
          );

        if (stored) {
          const user =
            JSON.parse(stored);

          if (
            mounted &&
            user?.name
          ) {
            setName(
              String(user.name)
            );
          }
        }

        const storedOnline =
          await AsyncStorage.getItem(
            'medbuy_delivery_online'
          );

        if (
          mounted &&
          storedOnline !== null
        ) {
          setIsOnline(
            storedOnline ===
            'true'
          );
        }

        const storedEarnings =
          await AsyncStorage.getItem(
            'medbuy_delivery_earnings'
          );

        if (
          mounted &&
          storedEarnings
        ) {
          try {
            const parsed =
              JSON.parse(
                storedEarnings
              );

            setEarnings({
              today:
                Number(
                  parsed.today
                ) || 0,
              week:
                Number(
                  parsed.week
                ) || 0,
              month:
                Number(
                  parsed.month
                ) || 0,
              trips:
                Number(
                  parsed.trips
                ) || 0,
            });
          } catch {
            // Keep zeroed earnings on a bad payload.
          }
        }
      } catch (error) {
        console.log(
          'Unable to load delivery user:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     UPDATE GREETING
     ========================================================== */

  useEffect(() => {
    const updateGreeting =
      () => {
        setGreeting(
          getGreeting()
        );
      };

    const interval =
      setInterval(
        updateGreeting,
        60 * 1000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /* ==========================================================
     SCREEN ENTRANCE
     ========================================================== */

  const screenOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const headerTranslate =
    useRef(
      new Animated.Value(-10)
    ).current;

  const contentTranslate =
    useRef(
      new Animated.Value(14)
    ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        screenOpacity,
        {
          toValue: 1,
          duration: 450,
          easing:
            Easing.out(
              Easing.cubic
            ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        headerTranslate,
        {
          toValue: 0,
          duration: 450,
          easing:
            Easing.out(
              Easing.cubic
            ),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        contentTranslate,
        {
          toValue: 0,
          duration: 500,
          delay: 80,
          easing:
            Easing.out(
              Easing.cubic
            ),
          useNativeDriver: true,
        }
      ),
    ]).start();
  }, [
    screenOpacity,
    headerTranslate,
    contentTranslate,
  ]);

  /* ==========================================================
     ONLINE TOGGLE
     ========================================================== */

  const toggleOnline =
    useCallback(() => {
      setIsOnline(
        (previous) => {
          const next = !previous;

          AsyncStorage.setItem(
            'medbuy_delivery_online',
            String(next)
          ).catch((error) =>
            console.log(
              'Unable to save online status:',
              error
            )
          );

          return next;
        }
      );
    }, []);

  /* ==========================================================
     NOTIFICATIONS
     ========================================================== */

  const handleNotifications =
    useCallback(() => {
      // Notification screen will be connected later.
      console.log(
        'Delivery notifications pressed'
      );
    }, []);

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const openHome =
    useCallback(() => {
      // Already on home.
    }, []);

  const openHistory =
    useCallback(() => {
      router.push(
        '/delivery-side/delivery-history'
      );
    }, []);

  const openProfile =
    useCallback(() => {
      router.push(
        '/delivery-side/delivery-profile'
      );
    }, []);

  const openSettings =
    useCallback(() => {
      router.push(
        '/delivery-side/delivery-profile'
      );
    }, []);

  /* ==========================================================
     LOADING
     ========================================================== */

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { paddingTop: insets.top },
        ]}
      >
        <StatusBar style="dark" />

        <View
          style={styles.loadingLogo}
        >
          <Bicycle
            size={34}
            color={COLORS.primary}
            weight="regular"
          />
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={{
            marginTop: 18,
          }}
        />

        <Text
          style={styles.loadingText}
        >
          Loading your dashboard...
        </Text>
      </View>
    );
  }

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
            opacity:
              screenOpacity,
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop:
                insets.top +
                (compact ? 6 : 12),
              paddingBottom:
                NAV_HEIGHT +
                insets.bottom +
                28,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <Animated.View
            style={{
              transform: [
                {
                  translateY:
                    headerTranslate,
                },
              ],
            }}
          >
            <View
              style={styles.header}
            >
              <View
                style={styles.headerLeft}
              >
                <View
                  style={styles.logo}
                >
                  <Bicycle
                    size={28}
                    color={
                      COLORS.primary
                    }
                    weight="regular"
                  />
                </View>

                <View
                  style={
                    styles.headerText
                  }
                >
                  <Text
                    style={
                      styles.smallBrand
                    }
                  >
                    MEDBUY
                  </Text>

                  <Text
                    style={
                      styles.deliveryLabel
                    }
                  >
                    Delivery Partner
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={
                  handleNotifications
                }
                style={({ pressed }) => [
                  styles.notificationButton,
                  pressed &&
                  styles.notificationPressed,
                ]}
                hitSlop={8}
              >
                <Bell
                  size={23}
                  color={
                    COLORS.textPrimary
                  }
                  weight="regular"
                />

                <View
                  style={
                    styles.notificationDot
                  }
                />
              </Pressable>
            </View>

            {/* Greeting */}

            <View
              style={styles.greetingRow}
            >
              <View
                style={
                  styles.greetingTextContainer
                }
              >
                <Text
                  style={
                    styles.greeting
                  }
                >
                  {greeting},
                </Text>

                <Text
                  style={
                    styles.name
                  }
                  numberOfLines={1}
                >
                  {name}
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Ready to make your
                  next delivery?
                </Text>
              </View>

              <View
                style={
                  styles.rolePill
                }
              >
                <Scooter
                  size={15}
                  color={
                    COLORS.primary
                  }
                  weight="regular"
                />

                <Text
                  style={
                    styles.rolePillText
                  }
                >
                  DELIVERY
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* ==================================================
              ONLINE STATUS
          ================================================== */}

          <AnimatedSection
            delay={80}
          >
            <View
              style={
                styles.statusCard
              }
            >
              <View
                style={
                  styles.statusCardLeft
                }
              >
                <View
                  style={[
                    styles.statusIcon,
                    isOnline &&
                    styles.statusIconOnline,
                  ]}
                >
                  <Power
                    size={23}
                    color={
                      isOnline
                        ? COLORS.success
                        : COLORS.neutral
                    }
                    weight="regular"
                  />
                </View>

                <View
                  style={
                    styles.statusCopy
                  }
                >
                  <Text
                    style={
                      styles.statusTitle
                    }
                  >
                    {isOnline
                      ? 'You are online'
                      : 'You are offline'}
                  </Text>

                  <Text
                    style={
                      styles.statusSubtitle
                    }
                  >
                    {isOnline
                      ? 'You can receive nearby delivery assignments.'
                      : 'Go online when you are ready to receive assignments.'}
                  </Text>
                </View>
              </View>

              <OnlineToggle
                isOnline={
                  isOnline
                }
                onToggle={
                  toggleOnline
                }
              />
            </View>
          </AnimatedSection>

          {/* ==================================================
              EARNINGS
          ================================================== */}

          <AnimatedSection
            delay={140}
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Earnings
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Money you've made
                </Text>
              </View>
            </View>

            <EarningsCard
              today={earnings.today}
              week={earnings.week}
              month={earnings.month}
              trips={earnings.trips}
              onDetails={openHistory}
            />
          </AnimatedSection>

          {/* ==================================================
              TODAY'S SUMMARY
          ================================================== */}

          <AnimatedSection
            delay={200}
          >
            <View
              style={
                styles.sectionHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Today
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Your delivery activity
                </Text>
              </View>
            </View>

            <View
              style={
                styles.statsCard
              }
            >
              <QuickStat
                icon={
                  <Package
                    size={20}
                    color={
                      COLORS.primary
                    }
                    weight="regular"
                  />
                }
                value="0"
                label="Deliveries"
              />

              <View
                style={
                  styles.statDivider
                }
              />

              <QuickStat
                icon={
                  <CheckCircle
                    size={20}
                    color={
                      COLORS.success
                    }
                    weight="regular"
                  />
                }
                value="0"
                label="Completed"
              />

              <View
                style={
                  styles.statDivider
                }
              />

              <QuickStat
                icon={
                  <Clock
                    size={20}
                    color={
                      COLORS.neutral
                    }
                    weight="regular"
                  />
                }
                value="—"
                label="Active time"
              />
            </View>
          </AnimatedSection>

          {/* ==================================================
              CURRENT DELIVERY
          ================================================== */}

          <AnimatedSection
            delay={260}
          >
            <View
              style={
                styles.sectionHeaderWithAction
              }
            >
              <View>
                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Current delivery
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Your active task
                </Text>
              </View>
            </View>

            <EmptyDeliveryCard
              isOnline={isOnline}
              onGoOnline={toggleOnline}
            />
          </AnimatedSection>

          {/* ==================================================
              QUICK ACCESS
          ================================================== */}

          <AnimatedSection
            delay={320}
          >
            <View
              style={
                styles.quickAccessCard
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Quick access
              </Text>

              <View
                style={
                  styles.quickAccessGrid
                }
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.quickAccessItem,
                    pressed &&
                    styles.quickAccessPressed,
                  ]}
                  onPress={
                    openHistory
                  }
                >
                  <View
                    style={
                      styles.quickAccessIcon
                    }
                  >
                    <Receipt
                      size={22}
                      color={
                        COLORS.primary
                      }
                      weight="regular"
                    />
                  </View>

                  <View
                    style={
                      styles.quickAccessContent
                    }
                  >
                    <Text
                      style={
                        styles.quickAccessTitle
                      }
                    >
                      Delivery history
                    </Text>

                    <Text
                      style={
                        styles.quickAccessSubtitle
                      }
                    >
                      View completed deliveries
                    </Text>
                  </View>

                  <CaretRight
                    size={20}
                    color={
                      COLORS.neutral
                    }
                    weight="regular"
                  />
                </Pressable>

                <View
                  style={
                    styles.quickAccessDivider
                  }
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.quickAccessItem,
                    pressed &&
                    styles.quickAccessPressed,
                  ]}
                  onPress={
                    openSettings
                  }
                >
                  <View
                    style={
                      styles.quickAccessIcon
                    }
                  >
                    <Gear
                      size={22}
                      color={
                        COLORS.primary
                      }
                      weight="regular"
                    />
                  </View>

                  <View
                    style={
                      styles.quickAccessContent
                    }
                  >
                    <Text
                      style={
                        styles.quickAccessTitle
                      }
                    >
                      Account settings
                    </Text>

                    <Text
                      style={
                        styles.quickAccessSubtitle
                      }
                    >
                      Manage your partner account
                    </Text>
                  </View>

                  <CaretRight
                    size={20}
                    color={
                      COLORS.neutral
                    }
                    weight="regular"
                  />
                </Pressable>
              </View>
            </View>
          </AnimatedSection>

          {/* ==================================================
              HOW IT WORKS
          ================================================== */}

          <AnimatedSection
            delay={380}
          >
            <HowItWorks />
          </AnimatedSection>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <Text
            style={styles.footer}
          >
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
              height:
                NAV_HEIGHT +
                insets.bottom,
              paddingBottom:
                insets.bottom + 4,
            },
          ]}
        >
          <BottomNavItem
            active
            label="Home"
            icon={
              <House
                size={21}
                color={
                  COLORS.primary
                }
                weight="fill"
              />
            }
            onPress={
              openHome
            }
          />

          <BottomNavItem
            label="Deliveries"
            icon={
              <Package
                size={21}
                color={
                  COLORS.neutral
                }
                weight="regular"
              />
            }
            onPress={
              openHistory
            }
          />

          <BottomNavItem
            label="History"
            icon={
              <Clock
                size={21}
                color={
                  COLORS.neutral
                }
                weight="regular"
              />
            }
            onPress={
              openHistory
            }
          />

          <BottomNavItem
            label="Profile"
            icon={
              <Person
                size={21}
                color={
                  COLORS.neutral
                }
                weight="regular"
              />
            }
            onPress={
              openProfile
            }
          />
        </View>
      </Animated.View>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  main: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
  },

  /* ==========================================================
     LOADING
  ========================================================== */

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      COLORS.background,
  },

  loadingLogo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  /* ==========================================================
     HEADER
  ========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    marginLeft: 11,
  },

  smallBrand: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.primary,
  },

  deliveryLabel: {
    marginTop: 1,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationPressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor:
      COLORS.primary,
  },

  /* ==========================================================
     GREETING
  ========================================================== */

  greetingRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },

  greetingTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  name: {
    marginTop: 1,
    fontSize: 26,
    lineHeight: 32,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  rolePill: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor:
      COLORS.subtle,
  },

  rolePillText: {
    marginLeft: 4,
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.7,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: COLORS.primary,
  },

  /* ==========================================================
     ONLINE STATUS
  ========================================================== */

  statusCard: {
    marginTop: 22,
    padding: 14,
    minHeight: 82,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  statusCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },

  statusIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusIconOnline: {
    backgroundColor:
      '#E7F3EC',
  },

  statusCopy: {
    marginLeft: 11,
    flex: 1,
  },

  statusTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  statusSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  onlineToggle: {
    minWidth: 122,
    height: 44,
    borderRadius: 22,
    backgroundColor:
      COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  onlineToggleActive: {
    backgroundColor:
      COLORS.successSubtle,
    borderColor:
      COLORS.border,
  },

  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },

  statusDotOnline: {
    backgroundColor:
      COLORS.success,
  },

  statusDotOffline: {
    backgroundColor:
      COLORS.neutral,
  },

  toggleText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.neutral,
  },

  toggleTextActive: {
    color:
      COLORS.success,
  },

  toggleTrack: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor:
      COLORS.border,
    justifyContent: 'center',
  },

  toggleTrackActive: {
    backgroundColor:
      COLORS.success,
  },

  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor:
      COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 2,
  },

  /* ==========================================================
     SECTION HEADERS
  ========================================================== */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 10,
  },

  sectionHeaderWithAction: {
    marginTop: 25,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  /* ==========================================================
     EARNINGS
  ========================================================== */

  earningsCard: {
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
  },

  earningsTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  earningsIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  earningsCopy: {
    flex: 1,
    marginLeft: 12,
  },

  earningsLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textSecondary,
  },

  earningsValue: {
    marginTop: 2,
    fontSize: 24,
    lineHeight: 30,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  earningsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingLeft: 8,
  },

  earningsLinkPressed: {
    opacity: 0.6,
  },

  earningsLinkText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.primary,
    marginRight: 2,
  },

  earningsDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 12,
  },

  earningsRow: {
    flexDirection: 'row',
  },

  earningsMini: {
    flex: 1,
  },

  earningsMiniLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  earningsMiniValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  /* ==========================================================
     STATS
  ========================================================== */

  statsCard: {
    minHeight: 96,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  quickStat: {
    flex: 1,
    alignItems: 'center',
  },

  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickStatValue: {
    marginTop: 5,
    fontSize: 17,
    lineHeight: 22,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  quickStatLabel: {
    marginTop: 1,
    fontSize: 10,
    lineHeight: 14,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.neutral,
  },

  statDivider: {
    width: 1,
    height: 48,
    backgroundColor:
      COLORS.border,
  },

  /* ==========================================================
     EMPTY DELIVERY
  ========================================================== */

  emptyCard: {
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 22,
    alignItems: 'center',
  },

  emptyIllustration: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
    textAlign: 'center',
  },

  emptyDescription: {
    marginTop: 6,
    maxWidth: 300,
    fontSize: 13,
    lineHeight: 19,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
    textAlign: 'center',
  },

  goOnlineButton: {
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginTop: 16,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  goOnlineButtonPressed: {
    backgroundColor:
      COLORS.pressed,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  goOnlineText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.surface,
  },

  emptyStatus: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor:
      COLORS.neutral,
  },

  emptyStatusDotOnline: {
    backgroundColor:
      COLORS.success,
  },

  emptyStatusText: {
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.neutral,
  },

  /* ==========================================================
     QUICK ACCESS
  ========================================================== */

  quickAccessCard: {
    marginTop: 25,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
  },

  quickAccessGrid: {
    marginTop: 8,
  },

  quickAccessItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },

  quickAccessPressed: {
    opacity: 0.65,
  },

  quickAccessIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickAccessContent: {
    flex: 1,
    marginLeft: 11,
  },

  quickAccessTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  quickAccessSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  quickAccessDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginLeft: 53,
  },

  /* ==========================================================
     HOW IT WORKS
  ========================================================== */

  howItWorksCard: {
    marginTop: 25,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
  },

  stepsContainer: {
    marginTop: 14,
  },

  stepRow: {
    flexDirection: 'row',
    minHeight: 68,
    position: 'relative',
  },

  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepContent: {
    flex: 1,
    marginLeft: 11,
    paddingBottom: 13,
  },

  stepTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  stepDescription: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  stepLine: {
    position: 'absolute',
    left: 20,
    top: 42,
    bottom: 0,
    width: 1,
    backgroundColor:
      COLORS.border,
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footer: {
    marginTop: 28,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.neutral,
  },

  /* ==========================================================
     BOTTOM NAV
  ========================================================== */

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      COLORS.surface,
    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
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
    backgroundColor:
      COLORS.subtle,
  },

  navLabel: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.neutral,
  },

  navLabelActive: {
    color:
      COLORS.primary,
  },
});
