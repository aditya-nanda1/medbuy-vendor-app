import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Bell,
  CaretLeft,
  CheckCircle,
  CurrencyInr,
  Package,
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
   MEDBUY DELIVERY NOTIFICATIONS
   Drop-in for: src/app/delivery-side/delivery-notifications.tsx
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

const STORAGE_KEY = 'medbuy_delivery_notifications';

/* ============================================================
   DEMO DATA
   Seeded into storage on first open (only while no real
   notifications exist) so the Home badge and this list always
   agree. Real notifications written to the same key replace
   the demo set.
   ============================================================ */

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'assignment' | 'earning' | 'system';
  read: boolean;
};

const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'demo-1',
    title: 'New delivery nearby',
    body: 'A pickup is available near Bandra West. Go to Deliveries to view it.',
    time: '2 min ago',
    type: 'assignment',
    read: false,
  },
  {
    id: 'demo-2',
    title: 'Earnings update',
    body: "₹155 has been added to today's earnings. Keep it up.",
    time: '1 hr ago',
    type: 'earning',
    read: false,
  },
  {
    id: 'demo-3',
    title: 'Welcome to MedBuy Delivery',
    body: 'Stay online to receive nearby delivery assignments.',
    time: 'Yesterday',
    type: 'system',
    read: false,
  },
];

/* ============================================================
   TYPE ICON
   ============================================================ */

function iconForType(type: NotificationItem['type']) {
  switch (type) {
    case 'assignment':
      return (
        <Package
          size={22}
          color={COLORS.primary}
          weight="regular"
        />
      );

    case 'earning':
      return (
        <CurrencyInr
          size={22}
          color={COLORS.primary}
          weight="regular"
        />
      );

    default:
      return (
        <Bell
          size={22}
          color={COLORS.primary}
          weight="regular"
        />
      );
  }
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
   NOTIFICATION ROW
   ============================================================ */

const NotificationRow = memo(
  function NotificationRow({
    item,
    isFirst,
    isLast,
    onPress,
  }: {
    item: NotificationItem;
    isFirst: boolean;
    isLast: boolean;
    onPress: (id: string) => void;
  }) {
    const press = usePressScale(0.985);

    const handlePress = useCallback(() => {
      onPress(item.id);
    }, [onPress, item.id]);

    return (
      <View
        style={[
          styles.notificationItem,
          isFirst &&
          styles.notificationItemFirst,
          isLast &&
          styles.notificationItemLast,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          accessibilityRole="button"
          accessibilityLabel={
            item.read
              ? item.title
              : `${item.title}, unread`
          }
        >
          <Animated.View
            style={[
              styles.notificationRow,
              {
                transform: [
                  {
                    scale:
                      press.scale,
                  },
                ],
              },
            ]}
          >
            <View
              style={styles.notificationIcon}
            >
              {iconForType(item.type)}
            </View>

            <View
              style={
                styles.notificationContent
              }
            >
              <Text
                style={[
                  styles.notificationTitle,
                  !item.read &&
                  styles.notificationTitleUnread,
                ]}
              >
                {item.title}
              </Text>

              <Text
                style={
                  styles.notificationBody
                }
                numberOfLines={2}
              >
                {item.body}
              </Text>

              <Text
                style={
                  styles.notificationTime
                }
              >
                {item.time}
              </Text>
            </View>

            {!item.read && (
              <View
                style={styles.unreadDot}
              />
            )}
          </Animated.View>
        </Pressable>

        {!isLast && (
          <View
            style={
              styles.notificationDivider
            }
          />
        )}
      </View>
    );
  }
);

/* ============================================================
   NOTIFICATIONS SCREEN
   ============================================================ */

export default function DeliveryNotifications() {
  const insets =
    useSafeAreaInsets();

  const [items, setItems] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [isDemo, setIsDemo] =
    useState(false);

  const screenOpacity =
    useRef(
      new Animated.Value(0)
    ).current;

  const unreadCount = items.filter(
    (entry) => !entry.read
  ).length;

  /* ==========================================================
     PERSIST
     ========================================================== */

  const persist = useCallback(
    async (next: NotificationItem[]) => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(next)
        );
      } catch (error) {
        console.log(
          'Unable to save notifications:',
          error
        );
      }
    },
    []
  );

  /* ==========================================================
     LOAD
     Reads medbuy_delivery_notifications. When nothing is
     stored yet, the demo set is seeded so this screen and the
     Home badge always agree.
     ========================================================== */

  const loadData = useCallback(async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (stored) {
        try {
          const parsed =
            JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setItems(
              parsed.map(
                (entry: any, index: number) => ({
                  id:
                    String(
                      entry?.id ?? index
                    ),
                  title:
                    String(
                      entry?.title ??
                      'Notification'
                    ),
                  body:
                    String(
                      entry?.body ?? ''
                    ),
                  time:
                    String(
                      entry?.time ?? ''
                    ),
                  type:
                    entry?.type ===
                      'earning' ||
                      entry?.type ===
                      'system' ||
                      entry?.type ===
                      'assignment'
                      ? entry.type
                      : 'system',
                  read: Boolean(
                    entry?.read
                  ),
                })
              )
            );

            setIsDemo(false);
          }
        } catch {
          // Keep the current list on a bad payload.
        }
      } else {
        setItems(DEMO_NOTIFICATIONS);
        setIsDemo(true);

        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            DEMO_NOTIFICATIONS
          )
        );
      }
    } catch (error) {
      console.log(
        'Unable to load notifications:',
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
     MARK READ
     ========================================================== */

  const markAsRead = useCallback(
    (id: string) => {
      setItems((previous) => {
        const next = previous.map(
          (entry) =>
            entry.id === id
              ? { ...entry, read: true }
              : entry
        );

        persist(next);
        return next;
      });
    },
    [persist]
  );

  const markAllRead = useCallback(() => {
    setItems((previous) => {
      const next = previous.map(
        (entry) => ({
          ...entry,
          read: true,
        })
      );

      persist(next);
      return next;
    });
  }, [persist]);

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

  /* ==========================================================
     LIST PIECES
     ========================================================== */

  const keyExtractor = useCallback(
    (item: NotificationItem) => item.id,
    []
  );

  const renderItem = useCallback(
    ({
      item,
      index,
    }: {
      item: NotificationItem;
      index: number;
    }) => (
      <NotificationRow
        item={item}
        isFirst={index === 0}
        isLast={
          index === items.length - 1
        }
        onPress={markAsRead}
      />
    ),
    [items.length, markAsRead]
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
          accessibilityRole="button"
          accessibilityLabel="Back"
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
          <View
            style={styles.headerTitleRow}
          >
            <Text
              style={styles.headerTitle}
            >
              Notifications
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
            style={
              styles.headerSubtitle
            }
          >
            {unreadCount > 0
              ? `${unreadCount} unread`
              : 'You are all caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <Pressable
            onPress={markAllRead}
            hitSlop={8}
            style={({ pressed }) => [
              styles.markAllButton,
              pressed &&
              styles.markAllButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <CheckCircle
              size={16}
              color={COLORS.primary}
              weight="regular"
            />

            <Text
              style={styles.markAllText}
            >
              Mark all read
            </Text>
          </Pressable>
        )}
      </View>

      {/* ==================================================
          SECTION NOTE
      ================================================== */}

      <AnimatedSection delay={60}>
        <Text
          style={styles.sectionNote}
        >
          {isDemo
            ? 'Sample notifications — real updates will appear here.'
            : 'Tap a notification to mark it as read.'}
        </Text>
      </AnimatedSection>
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
        <Bell
          size={40}
          color={COLORS.primary}
          weight="regular"
        />
      </View>

      <Text
        style={styles.emptyTitle}
      >
        No notifications
      </Text>

      <Text
        style={
          styles.emptyDescription
        }
      >
        Delivery assignments and
        earnings updates will appear
        here.
      </Text>
    </View>
  );

  const listFooter = (
    <Text
      style={styles.footer}
    >
      {isDemo
        ? "You're viewing demo notifications — real updates replace these."
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
          data={items}
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
                insets.bottom + 28,
            },
          ]}
        />
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
    flex: 1,
    marginLeft: 12,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    lineHeight: 26,
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

  headerSubtitle: {
    marginTop: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor:
      COLORS.subtle,
  },

  markAllButtonPressed: {
    opacity: 0.7,
  },

  markAllText: {
    marginLeft: 5,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: COLORS.primary,
  },

  sectionNote: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  /* ==========================================================
     NOTIFICATION LIST
  ========================================================== */

  notificationItem: {
    backgroundColor:
      COLORS.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor:
      COLORS.border,
    paddingHorizontal: 16,
  },

  notificationItemFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingTop: 6,
  },

  notificationItemLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    paddingBottom: 6,
  },

  notificationRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },

  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor:
      COLORS.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationContent: {
    flex: 1,
    marginLeft: 11,
  },

  notificationTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_500Medium',
    color:
      COLORS.textPrimary,
  },

  notificationTitleUnread: {
    fontFamily:
      'IBMPlexSans_600SemiBold',
  },

  notificationBody: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 17,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.textSecondary,
  },

  notificationTime: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_400Regular',
    color:
      COLORS.neutral,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor:
      COLORS.primary,
    marginTop: 6,
    marginLeft: 8,
  },

  notificationDivider: {
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
});
