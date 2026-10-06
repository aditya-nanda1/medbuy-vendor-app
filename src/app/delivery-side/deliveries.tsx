import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bicycle,
  CaretRight,
  CheckCircle,
  Clock,
  House,
  MapPin,
  Package,
  Person,
  Power,
  Storefront,
} from 'phosphor-react-native';
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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ============================================================
   MEDBUY DELIVERIES
   Drop-in for: src/app/delivery-side/deliveries.tsx
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
   FLOW ITEM
   ============================================================ */

type FlowItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: string;
  isLast?: boolean;
};

const FlowItem = memo(
  function FlowItem({
    icon,
    title,
    description,
    number,
    isLast = false,
  }: FlowItemProps) {
    return (
      <View>
        <View style={styles.flowItem}>
          <View style={styles.flowNumber}>
            <Text
              style={styles.flowNumberText}
            >
              {number}
            </Text>
          </View>

          <View style={styles.flowIcon}>
            {icon}
          </View>

          <View
            style={styles.flowContent}
          >
            <Text
              style={styles.flowTitle}
            >
              {title}
            </Text>

            <Text
              style={
                styles.flowDescription
              }
            >
              {description}
            </Text>
          </View>

          <CaretRight
            size={18}
            color={COLORS.neutral}
            weight="regular"
          />
        </View>

        {!isLast && (
          <View style={styles.flowLine} />
        )}
      </View>
    );
  }
);

/* ============================================================
   RECENT DELIVERY ITEM
   ============================================================ */

type RecentItem = {
  id: string;
  date: string;
  pharmacy: string;
  area: string;
  amount: number;
  status: string;
};

const RecentDeliveryItem = memo(
  function RecentDeliveryItem({
    item,
    isLast,
  }: {
    item: RecentItem;
    isLast: boolean;
  }) {
    return (
      <View>
        <View style={styles.recentRow}>
          <View style={styles.recentIcon}>
            <Package
              size={22}
              color={COLORS.primary}
              weight="regular"
            />
          </View>

          <View
            style={styles.recentContent}
          >
            <Text
              style={styles.recentTitle}
            >
              {item.pharmacy}
            </Text>

            <Text
              style={styles.recentSubtitle}
            >
              {item.area} · {item.date}
            </Text>
          </View>

          <View style={styles.recentRight}>
            <Text
              style={styles.recentAmount}
            >
              {inr(item.amount)}
            </Text>

            <View
              style={styles.statusPill}
            >
              <Text
                style={styles.statusPillText}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {!isLast && (
          <View
            style={styles.recentDivider}
          />
        )}
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
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          selected: active,
        }}
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
   DELIVERIES SCREEN
   ============================================================ */

export default function Deliveries() {
  const insets =
    useSafeAreaInsets();

  const [isOnline, setIsOnline] =
    useState(true);

  const [completedCount, setCompletedCount] =
    useState(0);

  const [totalTrips, setTotalTrips] =
    useState(0);

  const [recent, setRecent] =
    useState<RecentItem[]>([]);

  const [refreshing, setRefreshing] =
    useState(false);

  const screenOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  /* ==========================================================
     LOAD STATE
     Reads:
       medbuy_delivery_online   — 'true' | 'false'
       medbuy_delivery_history  — completed trips (array)
       medbuy_delivery_earnings — { today, week, month, trips }
     Assigned / in-progress stay 0 until a live source writes
     them; Completed and Recent reflect the stored history.
     ========================================================== */

  const loadData = useCallback(async () => {
    try {
      const storedOnline =
        await AsyncStorage.getItem(
          'medbuy_delivery_online'
        );

      if (storedOnline !== null) {
        setIsOnline(
          storedOnline === 'true'
        );
      }

      const storedHistory =
        await AsyncStorage.getItem(
          'medbuy_delivery_history'
        );

      if (storedHistory) {
        try {
          const parsed =
            JSON.parse(
              storedHistory
            );

          if (Array.isArray(parsed)) {
            setCompletedCount(
              parsed.length
            );

            setRecent(
              parsed
                .slice(-3)
                .reverse()
                .map(
                  (entry: any, index: number) => ({
                    id:
                      String(
                        entry?.id ?? index
                      ),
                    date:
                      String(
                        entry?.date ??
                        '—'
                      ),
                    pharmacy:
                      String(
                        entry?.pharmacy ??
                        'MedBuy Pharmacy'
                      ),
                    area:
                      String(
                        entry?.area ??
                        'Delivery'
                      ),
                    amount:
                      Number(
                        entry?.amount
                      ) || 0,
                    status:
                      String(
                        entry?.status ??
                        'Delivered'
                      ),
                  })
                )
            );
          }
        } catch {
          // Keep zeros on a bad payload.
        }
      } else {
        setCompletedCount(0);
        setRecent([]);
      }

      const storedEarnings =
        await AsyncStorage.getItem(
          'medbuy_delivery_earnings'
        );

      if (storedEarnings) {
        try {
          const parsed =
            JSON.parse(
              storedEarnings
            );

          setTotalTrips(
            Number(
              parsed.trips
            ) || 0
          );
        } catch {
          // Keep zero trips on a bad payload.
        }
      }
    } catch (error) {
      console.log(
        'Unable to load deliveries:',
        error
      );
    }
  }, []);

  /* ==========================================================
     SCREEN ENTRANCE
     ========================================================== */

  useEffect(() => {
    Animated.timing(
      screenOpacity,
      {
        toValue: 1,
        duration: 450,
        easing:
          Easing.out(Easing.cubic),
        useNativeDriver: true,
      }
    ).start();
  }, [screenOpacity]);

  /* ==========================================================
     LOAD + RELOAD ON FOCUS + PULL TO REFRESH
     ========================================================== */

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  /* ==========================================================
     GO ONLINE
     ========================================================== */

  const goOnline = useCallback(() => {
    setIsOnline(true);

    AsyncStorage.setItem(
      'medbuy_delivery_online',
      'true'
    ).catch((error) =>
      console.log(
        'Unable to save online status:',
        error
      )
    );
  }, []);

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const openHome = useCallback(() => {
    router.replace(
      '/delivery-side/delivery-home'
    );
  }, []);

  const openDeliveries = useCallback(() => {
    // Already on deliveries.
  }, []);

  const openHistory = useCallback(() => {
    router.replace(
      '/delivery-side/delivery-history'
    );
  }, []);

  const openProfile = useCallback(() => {
    router.replace(
      '/delivery-side/delivery-profile'
    );
  }, []);

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
          showsVerticalScrollIndicator={
            false
          }
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
              paddingTop:
                insets.top + 12,
              paddingBottom:
                NAV_HEIGHT +
                insets.bottom +
                28,
            },
          ]}
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <AnimatedSection delay={0}>
            <View style={styles.header}>
              <View
                style={styles.headerCopy}
              >
                <Text
                  style={styles.title}
                >
                  Deliveries
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  Manage your delivery
                  assignments
                </Text>
              </View>

              <View
                style={styles.headerIcon}
              >
                <Bicycle
                  size={25}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>
            </View>
          </AnimatedSection>

          {/* ==================================================
              OFFLINE BANNER
          ================================================== */}

          {!isOnline && (
            <AnimatedSection delay={40}>
              <View
                style={styles.offlineCard}
              >
                <View
                  style={styles.offlineIcon}
                >
                  <Power
                    size={22}
                    color={COLORS.neutral}
                    weight="regular"
                  />
                </View>

                <View
                  style={styles.offlineCopy}
                >
                  <Text
                    style={styles.offlineTitle}
                  >
                    You're offline
                  </Text>

                  <Text
                    style={
                      styles.offlineSubtitle
                    }
                  >
                    Go online to receive
                    nearby delivery
                    assignments.
                  </Text>
                </View>

                <Pressable
                  onPress={goOnline}
                  style={({ pressed }) => [
                    styles.goOnlineButton,
                    pressed &&
                    styles.goOnlineButtonPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.goOnlineText
                    }
                  >
                    Go online
                  </Text>
                </Pressable>
              </View>
            </AnimatedSection>
          )}

          {/* ==================================================
              TODAY'S SUMMARY
          ================================================== */}

          <AnimatedSection delay={80}>
            <View
              style={styles.summaryCard}
            >
              <Text
                style={styles.summaryTitle}
              >
                Today's deliveries
              </Text>

              <View
                style={styles.summaryRow}
              >
                <View
                  style={styles.summaryItem}
                >
                  <Text
                    style={
                      styles.summaryNumber
                    }
                  >
                    0
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Assigned
                  </Text>
                </View>

                <View
                  style={styles.divider}
                />

                <View
                  style={styles.summaryItem}
                >
                  <Text
                    style={
                      styles.summaryNumber
                    }
                  >
                    0
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    In progress
                  </Text>
                </View>

                <View
                  style={styles.divider}
                />

                <View
                  style={styles.summaryItem}
                >
                  <Text
                    style={
                      styles.summaryNumber
                    }
                  >
                    {String(completedCount)}
                  </Text>

                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Completed
                  </Text>
                </View>
              </View>
            </View>
          </AnimatedSection>

          {/* ==================================================
              ACTIVE DELIVERY
          ================================================== */}

          <AnimatedSection delay={140}>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Active delivery
              </Text>

              <View
                style={styles.activeBadge}
              >
                <View
                  style={styles.activeDot}
                />

                <Text
                  style={styles.activeText}
                >
                  0 active
                </Text>
              </View>
            </View>

            <View
              style={styles.emptyCard}
            >
              <View
                style={styles.emptyIcon}
              >
                <Package
                  size={32}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                No active delivery
              </Text>

              <Text
                style={styles.emptyText}
              >
                Your current delivery
                assignment will appear here.
              </Text>
            </View>
          </AnimatedSection>

          {/* ==================================================
              AVAILABLE DELIVERIES
          ================================================== */}

          <AnimatedSection delay={200}>
            <View
              style={styles.sectionHeader}
            >
              <View>
                <Text
                  style={styles.sectionTitle}
                >
                  Available deliveries
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Nearby assignments you
                  can accept
                </Text>
              </View>
            </View>

            <View
              style={styles.emptyCard}
            >
              <View
                style={[
                  styles.emptyIcon,
                  styles.emptyIconAlt,
                ]}
              >
                <Bicycle
                  size={32}
                  color={COLORS.neutral}
                  weight="regular"
                />
              </View>

              <Text
                style={styles.emptyTitle}
              >
                No deliveries available
              </Text>

              <Text
                style={styles.emptyText}
              >
                New delivery assignments
                will appear here when they
                become available.
              </Text>

              {totalTrips > 0 && (
                <Text
                  style={styles.emptyMeta}
                >
                  {totalTrips} trips
                  completed so far
                </Text>
              )}
            </View>
          </AnimatedSection>

          {/* ==================================================
              RECENT DELIVERIES
          ================================================== */}

          {recent.length > 0 && (
            <AnimatedSection delay={240}>
              <View
                style={styles.sectionHeader}
              >
                <View>
                  <Text
                    style={styles.sectionTitle}
                  >
                    Recent deliveries
                  </Text>

                  <Text
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Your latest trips
                  </Text>
                </View>

                <Pressable
                  onPress={openHistory}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.viewAllLink,
                    pressed &&
                    styles.viewAllLinkPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.viewAllText
                    }
                  >
                    View all
                  </Text>

                  <CaretRight
                    size={16}
                    color={COLORS.primary}
                    weight="bold"
                  />
                </Pressable>
              </View>

              <View
                style={styles.recentCard}
              >
                {recent.map(
                  (item, index) => (
                    <RecentDeliveryItem
                      key={item.id}
                      item={item}
                      isLast={
                        index ===
                        recent.length - 1
                      }
                    />
                  )
                )}
              </View>
            </AnimatedSection>
          )}

          {/* ==================================================
              HOW IT WORKS
          ================================================== */}

          <AnimatedSection delay={300}>
            <View
              style={styles.sectionHeader}
            >
              <Text
                style={styles.sectionTitle}
              >
                Delivery flow
              </Text>
            </View>

            <View
              style={styles.flowCard}
            >
              <FlowItem
                number="1"
                title="Pickup"
                description="Collect the order from the pharmacy"
                icon={
                  <Storefront
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
              />

              <FlowItem
                number="2"
                title="Deliver"
                description="Travel to the customer's location"
                icon={
                  <MapPin
                    size={20}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
              />

              <FlowItem
                isLast
                number="3"
                title="Complete"
                description="Confirm the delivery successfully"
                icon={
                  <CheckCircle
                    size={20}
                    color={COLORS.success}
                    weight="regular"
                  />
                }
              />
            </View>
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
            active
            label="Deliveries"
            icon={
              <Package
                size={21}
                color={COLORS.primary}
                weight="fill"
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
            label="Profile"
            icon={
              <Person
                size={21}
                color={COLORS.neutral}
                weight="regular"
              />
            }
            onPress={openProfile}
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
     HEADER
  ========================================================== */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ==========================================================
     OFFLINE BANNER
  ========================================================== */

  offlineCard: {
    marginTop: 22,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  offlineIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor:
      COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  offlineCopy: {
    flex: 1,
    marginLeft: 11,
    paddingRight: 10,
  },

  offlineTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  offlineSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  goOnlineButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
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
    fontSize: 13,
    lineHeight: 19,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.surface,
  },

  /* ==========================================================
     SUMMARY
  ========================================================== */

  summaryCard: {
    marginTop: 22,
    backgroundColor:
      COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
  },

  summaryTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryNumber: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  summaryLabel: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
    textAlign: 'center',
  },

  divider: {
    width: 1,
    height: 48,
    backgroundColor:
      COLORS.border,
  },

  /* ==========================================================
     SECTIONS
  ========================================================== */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
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

  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingLeft: 8,
  },

  viewAllLinkPressed: {
    opacity: 0.6,
  },

  viewAllText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.primary,
    marginRight: 2,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      COLORS.successSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor:
      COLORS.success,
    marginRight: 6,
  },

  activeText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.success,
  },

  /* ==========================================================
     EMPTY STATES
  ========================================================== */

  emptyCard: {
    backgroundColor:
      COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 22,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyIconAlt: {
    backgroundColor:
      COLORS.surfaceAlt,
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

  emptyText: {
    marginTop: 6,
    maxWidth: 290,
    fontSize: 13,
    lineHeight: 19,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
    textAlign: 'center',
  },

  emptyMeta: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.neutral,
  },

  /* ==========================================================
     RECENT DELIVERIES
  ========================================================== */

  recentCard: {
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  recentRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },

  recentIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentContent: {
    flex: 1,
    marginLeft: 11,
  },

  recentTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  recentSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  recentRight: {
    alignItems: 'flex-end',
  },

  recentAmount: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  statusPill: {
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor:
      COLORS.successSubtle,
  },

  statusPillText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.success,
  },

  recentDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginLeft: 53,
  },

  /* ==========================================================
     FLOW
  ========================================================== */

  flowCard: {
    backgroundColor:
      COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
  },

  flowItem: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },

  flowNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  flowNumberText: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.primary,
  },

  flowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  flowContent: {
    flex: 1,
  },

  flowTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  flowDescription: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  flowLine: {
    height: 14,
    width: 1,
    backgroundColor:
      COLORS.border,
    marginLeft: 46,
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
