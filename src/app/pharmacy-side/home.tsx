import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Bell,
  CaretRight,
  CheckCircle,
  Clock,
  Cube,
  Power,
} from 'phosphor-react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: '#F9F7F4',

  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE7',

  primary: '#9A4B23',
  primaryPressed: '#7B3A19',
  primarySoft: '#F6E6DC',

  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#8B8178',

  border: '#E0D8CE',

  success: '#1F6B45',
  successSoft: '#DDF2E9',

  offlineTrack: '#B8B1AA',
  offlineSoft: '#EDE8E1',
  offlineDot: '#8A8178',
  offlineDotOuter: '#D9D3CA',

  danger: '#A82520',
};

/* =========================================================
   MOCK ORDERS
========================================================= */

const NEW_ORDERS = [
  {
    id: '#MB1452',
    items: '2 items',
    distance: '1.2 km',
    time: '5 mins ago',
  },
  {
    id: '#MB1451',
    items: '1 item',
    distance: '0.8 km',
    time: '18 mins ago',
  },
  {
    id: '#MB1450',
    items: '3 items',
    distance: '2.4 km',
    time: '32 mins ago',
  },
];

/* =========================================================
   GREETING
========================================================= */

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

/* =========================================================
   PRESS SCALE HOOK
========================================================= */

function usePressScale(pressedScale = 0.97) {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: pressedScale,
      damping: 18,
      stiffness: 400,
      useNativeDriver: true,
    }).start();
  }, [scale, pressedScale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 18,
      stiffness: 380,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return {
    scale,
    onPressIn,
    onPressOut,
  };
}

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = memo(function StatCard({
  icon,
  value,
  label,
  compact,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  compact: boolean;
}) {
  const press = usePressScale(0.97);

  return (
    <Pressable
      style={styles.statPressable}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
    >
      <Animated.View
        style={[
          styles.statCard,
          compact && styles.statCardCompact,
          {
            transform: [
              {
                scale: press.scale,
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.statIcon,
            compact && styles.statIconCompact,
          ]}
        >
          {icon}
        </View>

        <Text style={styles.statValue}>
          {value}
        </Text>

        <Text
          style={[
            styles.statLabel,
            compact && styles.statLabelCompact,
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

/* =========================================================
   ORDER CARD
========================================================= */

const OrderCard = memo(function OrderCard({
  order,
  animation,
  compact,
  onPress,
}: {
  order: (typeof NEW_ORDERS)[number];
  animation: Animated.Value;
  compact: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(0.985);
  const viewPress = usePressScale(0.94);

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: animation,
        transform: [
          {
            translateY,
          },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
      >
        <Animated.View
          style={[
            styles.orderCard,
            compact && styles.orderCardCompact,
            {
              transform: [
                {
                  scale: press.scale,
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.orderIcon,
              compact && styles.orderIconCompact,
            ]}
          >
            <Cube
              size={24}
              color={COLORS.primary}
              weight="regular"
            />
          </View>

          <View style={styles.orderInfo}>
            <Text
              style={styles.orderId}
              numberOfLines={1}
            >
              {order.id}
            </Text>

            <Text
              style={styles.orderMeta}
              numberOfLines={1}
            >
              {order.items}
              {'  •  '}
              {order.distance}
            </Text>

            <Text
              style={styles.orderTime}
              numberOfLines={1}
            >
              {order.time}
            </Text>
          </View>

          <Pressable
            onPress={onPress}
            onPressIn={viewPress.onPressIn}
            onPressOut={viewPress.onPressOut}
          >
            <Animated.View
              style={[
                styles.viewButton,
                compact && styles.viewButtonCompact,
                {
                  transform: [
                    {
                      scale: viewPress.scale,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.viewButtonText}>
                View
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

/* =========================================================
   HOME SCREEN
========================================================= */

export default function PharmacyHome() {
  const { width, height } =
    useWindowDimensions();

  const compact =
    width <= 380 || height <= 700;

  const [isOnline, setIsOnline] =
    useState(true);

  const [greeting, setGreeting] =
    useState(getGreeting());

  /*
   * IMPORTANT:
   * This starts empty.
   *
   * We do NOT use "Pharmacy Store" as the
   * displayed store name because the real name
   * must come from the account created during signup.
   */
  const [storeName, setStoreName] =
    useState('');

  /* =======================================================
     LOAD ACTUAL STORE NAME
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const storedUser =
          await AsyncStorage.getItem(
            'medbuy_user'
          );

        if (!storedUser) {
          return;
        }

        const user = JSON.parse(storedUser);

        /*
         * Read the exact storeName entered
         * during Create Account.
         */
        if (
          mounted &&
          user &&
          typeof user.storeName === 'string' &&
          user.storeName.trim().length > 0
        ) {
          setStoreName(
            user.storeName.trim()
          );
        }
      } catch (error) {
        console.log(
          'Unable to load pharmacy user:',
          error
        );
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     UPDATE GREETING
  ======================================================= */

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    updateGreeting();

    const interval = setInterval(
      updateGreeting,
      60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     SCREEN ENTRANCE ANIMATIONS
  ======================================================= */

  const screenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const headerTranslate = useRef(
    new Animated.Value(-8)
  ).current;

  const statusTranslate = useRef(
    new Animated.Value(12)
  ).current;

  const statsTranslate = useRef(
    new Animated.Value(14)
  ).current;

  const ordersTranslate = useRef(
    new Animated.Value(16)
  ).current;

  const bottomTranslate = useRef(
    new Animated.Value(8)
  ).current;

  const orderAnimations = useRef(
    NEW_ORDERS.map(
      () => new Animated.Value(0)
    )
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(statusTranslate, {
        toValue: 0,
        duration: 350,
        delay: 40,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(statsTranslate, {
        toValue: 0,
        duration: 350,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(ordersTranslate, {
        toValue: 0,
        duration: 350,
        delay: 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(bottomTranslate, {
        toValue: 0,
        duration: 300,
        delay: 170,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    orderAnimations.forEach(
      (animation, index) => {
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          delay: 180 + index * 60,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    );
  }, [
    screenOpacity,
    headerTranslate,
    statusTranslate,
    statsTranslate,
    ordersTranslate,
    bottomTranslate,
    orderAnimations,
  ]);

  /* =======================================================
     ONLINE STATUS ANIMATION

     IMPORTANT:
     This Animated.Value ONLY uses native driver.
  ======================================================= */

  const toggleAnimation = useRef(
    new Animated.Value(
      isOnline ? 1 : 0
    )
  ).current;

  useEffect(() => {
    Animated.spring(
      toggleAnimation,
      {
        toValue: isOnline ? 1 : 0,
        damping: 20,
        stiffness: 300,
        mass: 0.8,
        useNativeDriver: true,
      }
    ).start();
  }, [
    isOnline,
    toggleAnimation,
  ]);

  const thumbTranslateX =
    toggleAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0,
        compact ? 24 : 26,
      ],
    });

  /* =======================================================
     ONLINE DOT PULSE
  ======================================================= */

  const pulseAnimation = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    if (!isOnline) {
      pulseAnimation.stopAnimation();

      Animated.spring(
        pulseAnimation,
        {
          toValue: 1,
          useNativeDriver: true,
        }
      ).start();

      return;
    }

    const pulse =
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            pulseAnimation,
            {
              toValue: 1.05,
              duration: 1200,
              easing:
                Easing.inOut(
                  Easing.ease
                ),
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            pulseAnimation,
            {
              toValue: 1,
              duration: 1200,
              easing:
                Easing.inOut(
                  Easing.ease
                ),
              useNativeDriver: true,
            }
          ),
        ])
      );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [
    isOnline,
    pulseAnimation,
  ]);

  /* =======================================================
     PRESS ANIMATIONS
  ======================================================= */

  const bellPress =
    usePressScale(0.9);

  const seeAllPress =
    usePressScale(0.95);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const toggleOnline =
    useCallback(() => {
      setIsOnline(
        previous => !previous
      );
    }, []);

  const openOrder =
    useCallback((orderId: string) => {
      router.push({
        pathname:
          '/pharmacy-side/order-request',
        params: {
          orderId,
        },
      });
    }, []);

  const openOrders =
    useCallback(() => {
      router.replace(
        '/pharmacy-side/orders'
      );
    }, []);

  const openHistory =
    useCallback(() => {
      router.replace(
        '/pharmacy-side/history'
      );
    }, []);

  const openProfile =
    useCallback(() => {
      router.replace(
        '/pharmacy-side/profile'
      );
    }, []);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          COLORS.background
        }
      />

      <View style={styles.container}>
        <Animated.View
          style={[
            styles.main,
            {
              opacity: screenOpacity,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.scrollContent
            }
          >
            {/* ==========================================
                HEADER
            ========================================== */}

            <Animated.View
              style={[
                styles.header,
                compact &&
                styles.headerCompact,
                {
                  transform: [
                    {
                      translateY:
                        headerTranslate,
                    },
                  ],
                },
              ]}
            >
              <View
                style={styles.headerText}
              >
                <Text
                  style={[
                    styles.greeting,
                    compact &&
                    styles.greetingCompact,
                  ]}
                >
                  {greeting}
                </Text>

                <Text
                  style={[
                    styles.storeName,
                    compact &&
                    styles.storeNameCompact,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  {storeName || 'Loading...'}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  router.push('/pharmacy-side/notifications')
                }
                onPressIn={
                  bellPress.onPressIn
                }
                onPressOut={
                  bellPress.onPressOut
                }
                accessibilityRole="button"
                accessibilityLabel="Open notifications"
              >
                <Animated.View
                  style={[
                    styles.notificationButton,
                    compact &&
                    styles.notificationButtonCompact,
                    {
                      transform: [
                        {
                          scale:
                            bellPress.scale,
                        },
                      ],
                    },
                  ]}
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
                </Animated.View>
              </Pressable>
            </Animated.View>

            {/* ==========================================
                ONLINE / OFFLINE CARD
            ========================================== */}

            <Animated.View
              style={[
                styles.statusCard,
                compact &&
                styles.statusCardCompact,
                {
                  transform: [
                    {
                      translateY:
                        statusTranslate,
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.statusIconBox,
                  compact &&
                  styles.statusIconBoxCompact,
                  {
                    backgroundColor:
                      isOnline
                        ? COLORS.successSoft
                        : COLORS.offlineSoft,
                  },
                ]}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale:
                          pulseAnimation,
                      },
                    ],
                  }}
                >
                  <View
                    style={[
                      styles.onlineDotOuter,
                      {
                        backgroundColor:
                          isOnline
                            ? '#BCE2D0'
                            : COLORS.offlineDotOuter,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.onlineDot,
                        {
                          backgroundColor:
                            isOnline
                              ? COLORS.success
                              : COLORS.offlineDot,
                        },
                      ]}
                    />
                  </View>
                </Animated.View>
              </View>

              <View
                style={
                  styles.statusText
                }
              >
                <Text
                  style={[
                    styles.statusTitle,
                    compact &&
                    styles.statusTitleCompact,
                  ]}
                  numberOfLines={1}
                >
                  {isOnline
                    ? 'You are online'
                    : 'You are offline'}
                </Text>

                <Text
                  style={
                    styles.statusSubtitle
                  }
                  numberOfLines={1}
                >
                  {isOnline
                    ? 'You can receive new orders'
                    : 'You will not receive new orders'}
                </Text>
              </View>

              <Pressable
                onPress={
                  toggleOnline
                }
                hitSlop={10}
                accessibilityRole="switch"
                accessibilityState={{
                  checked: isOnline,
                }}
              >
                <Animated.View
                  style={[
                    styles.toggle,
                    compact &&
                    styles.toggleCompact,
                    {
                      backgroundColor:
                        isOnline
                          ? COLORS.success
                          : COLORS.offlineTrack,
                    },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      compact &&
                      styles.toggleThumbCompact,
                      {
                        transform: [
                          {
                            translateX:
                              thumbTranslateX,
                          },
                        ],
                      },
                    ]}
                  />
                </Animated.View>
              </Pressable>
            </Animated.View>

            {/* ==========================================
                STATS
            ========================================== */}

            <Animated.View
              style={[
                styles.statsRow,
                compact &&
                styles.statsRowCompact,
                {
                  transform: [
                    {
                      translateY:
                        statsTranslate,
                    },
                  ],
                },
              ]}
            >
              <StatCard
                icon={
                  <Cube
                    size={21}
                    color={
                      COLORS.primary
                    }
                  />
                }
                value="3"
                label="New Orders"
                compact={compact}
              />

              <StatCard
                icon={
                  <Clock
                    size={21}
                    color={
                      COLORS.primary
                    }
                  />
                }
                value="5"
                label="Ongoing"
                compact={compact}
              />

              <StatCard
                icon={
                  <CheckCircle
                    size={21}
                    color={
                      COLORS.success
                    }
                  />
                }
                value="28"
                label="Completed"
                compact={compact}
              />
            </Animated.View>

            {/* ==========================================
                NEW ORDERS
            ========================================== */}

            <Animated.View
              style={[
                styles.ordersSection,
                compact &&
                styles.ordersSectionCompact,
                {
                  transform: [
                    {
                      translateY:
                        ordersTranslate,
                    },
                  ],
                },
              ]}
            >
              <View
                style={
                  styles.sectionHeader
                }
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    compact &&
                    styles.sectionTitleCompact,
                  ]}
                >
                  New Orders
                </Text>

                <Pressable
                  onPress={
                    openOrders
                  }
                  onPressIn={
                    seeAllPress.onPressIn
                  }
                  onPressOut={
                    seeAllPress.onPressOut
                  }
                >
                  <Animated.View
                    style={[
                      styles.seeAllContainer,
                      {
                        transform: [
                          {
                            scale:
                              seeAllPress.scale,
                          },
                        ],
                      },
                    ]}
                  >
                    <Text
                      style={
                        styles.seeAll
                      }
                    >
                      See All
                    </Text>

                    <CaretRight
                      size={14}
                      color={
                        COLORS.primary
                      }
                      weight="bold"
                    />
                  </Animated.View>
                </Pressable>
              </View>

              {isOnline ? (
                NEW_ORDERS.map(
                  (
                    order,
                    index
                  ) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      animation={
                        orderAnimations[
                        index
                        ]
                      }
                      compact={compact}
                      onPress={() =>
                        openOrder(
                          order.id
                        )
                      }
                    />
                  )
                )
              ) : (
                <View
                  style={
                    styles.offlineBox
                  }
                >
                  <View
                    style={
                      styles.offlineIcon
                    }
                  >
                    <Power
                      size={23}
                      color={
                        COLORS.textSecondary
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.offlineTitle
                    }
                  >
                    You're offline
                  </Text>

                  <Text
                    style={
                      styles.offlineText
                    }
                  >
                    Go online to receive
                    new orders.
                  </Text>

                  <Pressable
                    onPress={
                      toggleOnline
                    }
                  >
                    <View
                      style={
                        styles.goOnlineButton
                      }
                    >
                      <Text
                        style={
                          styles.goOnlineText
                        }
                      >
                        Go Online
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </Animated.View>

        {/* ==========================================
            BOTTOM NAVIGATION
        ========================================== */}

        <Animated.View
          style={[
            styles.bottomNav,
            {
              transform: [
                {
                  translateY:
                    bottomTranslate,
                },
              ],
            },
          ]}
        >
          <Pressable style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Ionicons
                name="home"
                size={21}
                color="#9A4B23"
              />
            </View>

            <Text style={styles.navTextActive}>
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

          <Pressable
            style={styles.navItem}
            onPress={openProfile}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#6B615A"
            />

            <Text style={styles.navText}>
              Profile
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

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
    paddingTop: 8,
    paddingBottom: 110,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 15,
  },

  headerCompact: {
    minHeight: 59,
    marginBottom: 12,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  greeting: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },

  greetingCompact: {
    fontSize: 12,
    lineHeight: 17,
  },

  storeName: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  storeNameCompact: {
    fontSize: 18,
    lineHeight: 23,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  notificationButtonCompact: {
    width: 43,
    height: 43,
    borderRadius: 13,
  },

  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor:
      COLORS.danger,
    borderWidth: 1,
    borderColor:
      COLORS.surface,
  },

  /* =======================================================
     ONLINE CARD
  ======================================================= */

  statusCard: {
    minHeight: 112,
    borderRadius: 17,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  statusCardCompact: {
    minHeight: 104,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 15,
    marginBottom: 12,
  },

  statusIconBox: {
    width: 56,
    height: 56,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 12,
  },

  statusIconBoxCompact: {
    width: 51,
    height: 51,
    borderRadius: 16,
    marginRight: 10,
  },

  onlineDotOuter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  onlineDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
  },

  statusText: {
    flex: 1,
    minWidth: 0,
  },

  statusTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  statusTitleCompact: {
    fontSize: 15,
    lineHeight: 20,
  },

  statusSubtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  /* =======================================================
     TOGGLE
  ======================================================= */

  toggle: {
    width: 66,
    height: 40,
    borderRadius: 20,
    padding: 3,
    justifyContent:
      'center',
    marginLeft: 8,
  },

  toggleCompact: {
    width: 62,
    height: 38,
    borderRadius: 19,
  },

  toggleThumb: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor:
      '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  toggleThumbCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  /* =======================================================
     STATS
  ======================================================= */

  statsRow: {
    flexDirection: 'row',
    gap: 9,
  },

  statsRowCompact: {
    gap: 7,
  },

  statPressable: {
    flex: 1,
    minWidth: 0,
  },

  statCard: {
    height: 132,
    borderRadius: 17,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 12,
    alignItems: 'flex-start',
  },

  statCardCompact: {
    height: 126,
    padding: 10,
    borderRadius: 15,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: 11,
  },

  statIconCompact: {
    width: 40,
    height: 40,
    borderRadius: 12,
    marginBottom: 9,
  },

  statValue: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  statLabel: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  statLabelCompact: {
    fontSize: 11,
    lineHeight: 16,
  },

  /* =======================================================
     ORDERS
  ======================================================= */

  ordersSection: {
    marginTop: 22,
  },

  ordersSectionCompact: {
    marginTop: 18,
  },

  sectionHeader: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 11,
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  sectionTitleCompact: {
    fontSize: 17,
    lineHeight: 22,
  },

  seeAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  seeAll: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },

  /* =======================================================
     ORDER CARD
  ======================================================= */

  orderCard: {
    minHeight: 100,
    borderRadius: 17,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    marginBottom: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderCardCompact: {
    minHeight: 94,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 15,
  },

  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor:
      COLORS.primarySoft,
    alignItems: 'center',
    justifyContent:
      'center',
    marginRight: 12,
  },

  orderIconCompact: {
    width: 44,
    height: 44,
    borderRadius: 15,
    marginRight: 10,
  },

  orderInfo: {
    flex: 1,
    minWidth: 0,
  },

  orderId: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  orderMeta: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  orderTime: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textMuted,
  },

  viewButton: {
    width: 72,
    height: 40,
    borderRadius: 10,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
    marginLeft: 9,
  },

  viewButtonCompact: {
    width: 68,
    height: 37,
    borderRadius: 10,
  },

  viewButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* =======================================================
     OFFLINE
  ======================================================= */

  offlineBox: {
    borderRadius: 17,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 21,
    alignItems: 'center',
  },

  offlineIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor:
      COLORS.offlineSoft,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  offlineTitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  offlineText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  goOnlineButton: {
    height: 43,
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
    marginTop: 16,
  },

  goOnlineText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* =======================================================
     BOTTOM NAV
  ======================================================= */

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
});
