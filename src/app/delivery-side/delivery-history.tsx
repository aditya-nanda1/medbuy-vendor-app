import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  CaretLeft,
  Clock,
  CurrencyInr,
  House,
  Package,
  Person,
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
  Animated,
  Easing,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ============================================================
   MEDBUY DELIVERY HISTORY
   Drop-in for: src/app/delivery-side/delivery-history.tsx
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
   DEMO DATA
   Shown only while no real trips are stored, so the screen is
   never dead. A clear "Demo" marker keeps it honest, and the
   moment a real trip lands in medbuy_delivery_history (with
   medbuy_delivery_earnings), the demo disappears on its own.
   ============================================================ */

const DEMO_HISTORY = [
  {
    id: 'demo-1',
    date: 'Today, 10:24 AM',
    pharmacy: 'Apollo Pharmacy',
    area: 'Andheri West',
    amount: 85,
    status: 'Delivered',
  },
  {
    id: 'demo-2',
    date: 'Today, 9:02 AM',
    pharmacy: 'MedPlus',
    area: 'Bandra West',
    amount: 70,
    status: 'Delivered',
  },
  {
    id: 'demo-3',
    date: 'Yesterday, 6:41 PM',
    pharmacy: 'Wellness Forever',
    area: 'Juhu',
    amount: 95,
    status: 'Delivered',
  },
  {
    id: 'demo-4',
    date: 'Yesterday, 1:15 PM',
    pharmacy: 'Care Pharmacy',
    area: 'Powai',
    amount: 60,
    status: 'Delivered',
  },
  {
    id: 'demo-5',
    date: 'Mon, 5:03 PM',
    pharmacy: 'City Medicals',
    area: 'Malad West',
    amount: 75,
    status: 'Delivered',
  },
  {
    id: 'demo-6',
    date: 'Sun, 12:20 PM',
    pharmacy: 'Shree Pharmacy',
    area: 'Versova',
    amount: 65,
    status: 'Delivered',
  },
];

const DEMO_EARNINGS = {
  today: 155,
  week: 980,
  month: 4250,
  trips: 64,
};

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
   HISTORY ITEM
   ============================================================ */

type HistoryItem = {
  id: string;
  date: string;
  pharmacy: string;
  area: string;
  amount: number;
  status: string;
};

const DeliveryHistoryItem = memo(
  function DeliveryHistoryItem({
    item,
    isFirst,
    isLast,
  }: {
    item: HistoryItem;
    isFirst: boolean;
    isLast: boolean;
  }) {
    const statusKey =
      item.status.toLowerCase();

    const isDelivered =
      statusKey.includes('deliver') ||
      statusKey.includes('complete');

    return (
      <View
        style={[
          styles.historyItem,
          isFirst &&
          styles.historyItemFirst,
          isLast &&
          styles.historyItemLast,
        ]}
      >
        <View style={styles.historyRow}>
          <View style={styles.historyIcon}>
            <Package
              size={22}
              color={COLORS.primary}
              weight="regular"
            />
          </View>

          <View
            style={styles.historyContent}
          >
            <Text
              style={styles.historyTitle}
            >
              {item.pharmacy}
            </Text>

            <Text
              style={styles.historySubtitle}
            >
              {item.area} · {item.date}
            </Text>
          </View>

          <View style={styles.historyRight}>
            <Text
              style={styles.historyAmount}
            >
              {inr(item.amount)}
            </Text>

            <View
              style={[
                styles.statusPill,
                !isDelivered &&
                styles.statusPillMuted,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  !isDelivered &&
                  styles.statusPillTextMuted,
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {!isLast && (
          <View
            style={styles.historyDivider}
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
   HISTORY SCREEN
   ============================================================ */

export default function DeliveryHistory() {
  const insets =
    useSafeAreaInsets();

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [summary, setSummary] =
    useState({
      today: 0,
      week: 0,
      month: 0,
      trips: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const screenOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  /* ==========================================================
     LOAD HISTORY + EARNINGS
     Reads:
       medbuy_delivery_history  — JSON array of completed trips
       medbuy_delivery_earnings — { today, week, month, trips }
     Missing/invalid payloads fall back to demo data.
     ========================================================== */

  const loadData = useCallback(async () => {
    try {
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
            setHistory(
              parsed.map(
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
          // Keep the empty state on a bad payload.
        }
      } else {
        setHistory([]);
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

          setSummary({
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
          // Keep zeroed summary on a bad payload.
        }
      }
    } catch (error) {
      console.log(
        'Unable to load delivery history:',
        error
      );
    } finally {
      setLoading(false);
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
     RELOAD ON FOCUS + PULL TO REFRESH
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
     DEMO FALLBACK
     Real data always wins; demo only fills an empty screen.
     ========================================================== */

  const isDemo =
    !loading && history.length === 0;

  const displayHistory = isDemo
    ? DEMO_HISTORY
    : history;

  const displaySummary = isDemo
    ? DEMO_EARNINGS
    : summary;

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(
        '/delivery-side/delivery-home'
      );
    }
  }, []);

  const openHome = useCallback(() => {
    router.replace(
      '/delivery-side/delivery-home'
    );
  }, []);

  const openDeliveries = useCallback(() => {
    router.replace(
      '/delivery-side/deliveries'
    );
  }, []);

  const openHistory = useCallback(() => {
    // Already on history.
  }, []);

  const openProfile = useCallback(() => {
    router.replace(
      '/delivery-side/delivery-profile'
    );
  }, []);

  /* ==========================================================
     LIST PIECES
     ========================================================== */

  const keyExtractor = useCallback(
    (item: HistoryItem) => item.id,
    []
  );

  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: HistoryItem;
      index: number;
    }) => (
      <DeliveryHistoryItem
        item={item}
        isFirst={index === 0}
        isLast={
          index ===
          displayHistory.length - 1
        }
      />
    ),
    [displayHistory.length]
  );

  const listHeader = (
    <>
      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed &&
            styles.backButtonPressed,
          ]}
          hitSlop={8}
        >
          <CaretLeft
            size={22}
            color={
              COLORS.textPrimary
            }
            weight="bold"
          />
        </Pressable>

        <View
          style={styles.headerText}
        >
          <Text
            style={styles.headerTitle}
          >
            Delivery history
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Your completed trips
          </Text>
        </View>
      </View>

      {/* ==================================================
          EARNINGS SUMMARY
      ================================================== */}

      <AnimatedSection delay={80}>
        <View
          style={styles.summaryCard}
        >
          <View
            style={styles.summaryTop}
          >
            <View
              style={
                styles.summaryIcon
              }
            >
              <CurrencyInr
                size={22}
                color={COLORS.primary}
                weight="regular"
              />
            </View>

            <View
              style={
                styles.summaryCopy
              }
            >
              <Text
                style={
                  styles.summaryLabel
                }
              >
                This month
              </Text>

              <Text
                style={
                  styles.summaryValue
                }
              >
                {inr(displaySummary.month)}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.summaryDivider
            }
          />

          <View
            style={styles.summaryRow}
          >
            <View
              style={styles.summaryMini}
            >
              <Text
                style={
                  styles.summaryMiniLabel
                }
              >
                Today
              </Text>

              <Text
                style={
                  styles.summaryMiniValue
                }
              >
                {inr(displaySummary.today)}
              </Text>
            </View>

            <View
              style={styles.summaryMini}
            >
              <Text
                style={
                  styles.summaryMiniLabel
                }
              >
                This week
              </Text>

              <Text
                style={
                  styles.summaryMiniValue
                }
              >
                {inr(displaySummary.week)}
              </Text>
            </View>

            <View
              style={styles.summaryMini}
            >
              <Text
                style={
                  styles.summaryMiniLabel
                }
              >
                Total trips
              </Text>

              <Text
                style={
                  styles.summaryMiniValue
                }
              >
                {String(displaySummary.trips)}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedSection>

      {/* ==================================================
          SECTION HEADER
      ================================================== */}

      <View
        style={styles.sectionHeader}
      >
        <View
          style={styles.sectionTitleRow}
        >
          <Text
            style={styles.sectionTitle}
          >
            Recent deliveries
          </Text>

          {isDemo && (
            <View
              style={styles.demoPill}
            >
              <Text
                style={
                  styles.demoPillText
                }
              >
                DEMO
              </Text>
            </View>
          )}
        </View>

        <Text
          style={styles.sectionSubtitle}
        >
          {isDemo
            ? 'Sample trips — your real deliveries replace these automatically'
            : displayHistory.length > 0
              ? `${displayHistory.length} completed`
              : 'Nothing here yet'}
        </Text>
      </View>
    </>
  );

  const listEmpty = loading ? null : (
    <View
      style={styles.emptyCard}
    >
      <View
        style={
          styles.emptyIllustration
        }
      >
        <Scooter
          size={40}
          color={COLORS.primary}
          weight="regular"
        />
      </View>

      <Text
        style={styles.emptyTitle}
      >
        No deliveries yet
      </Text>

      <Text
        style={
          styles.emptyDescription
        }
      >
        Completed deliveries will
        appear here once you finish
        your first trip.
      </Text>
    </View>
  );

  const listFooter = (
    <Text
      style={styles.footer}
    >
      {isDemo
        ? "You're viewing demo data — it clears itself once real trips are recorded."
        : 'MedBuy Delivery Partner · v1.0.0'}
    </Text>
  );

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
        <FlatList
          data={displayHistory}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={listFooter}
          initialNumToRender={10}
          windowSize={5}
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
        />

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
            active
            label="History"
            icon={
              <Clock
                size={21}
                color={COLORS.primary}
                weight="fill"
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
  },

  backButton: {
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

  backButtonPressed: {
    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  headerText: {
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  headerSubtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  /* ==========================================================
     SUMMARY
  ========================================================== */

  summaryCard: {
    marginTop: 22,
    borderRadius: 14,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 16,
  },

  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryCopy: {
    flex: 1,
    marginLeft: 12,
  },

  summaryLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textSecondary,
  },

  summaryValue: {
    marginTop: 2,
    fontSize: 24,
    lineHeight: 30,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  summaryDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 12,
  },

  summaryRow: {
    flexDirection: 'row',
  },

  summaryMini: {
    flex: 1,
  },

  summaryMiniLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  summaryMiniValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  /* ==========================================================
     SECTIONS
  ========================================================== */

  sectionHeader: {
    marginTop: 25,
    marginBottom: 10,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.textPrimary,
  },

  demoPill: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor:
      COLORS.subtle,
  },

  demoPillText: {
    fontSize: 9,
    lineHeight: 13,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.primary,
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
     HISTORY LIST
  ========================================================== */

  historyItem: {
    backgroundColor:
      COLORS.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 16,
  },

  historyItemFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingTop: 6,
  },

  historyItemLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingBottom: 6,
  },

  historyRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyContent: {
    flex: 1,
    marginLeft: 11,
  },

  historyTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  historySubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  historyRight: {
    alignItems: 'flex-end',
  },

  historyAmount: {
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

  statusPillMuted: {
    backgroundColor:
      COLORS.surfaceAlt,
  },

  statusPillText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color:
      COLORS.success,
  },

  statusPillTextMuted: {
    color:
      COLORS.neutral,
  },

  historyDivider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginLeft: 53,
  },

  /* ==========================================================
     EMPTY STATE
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
