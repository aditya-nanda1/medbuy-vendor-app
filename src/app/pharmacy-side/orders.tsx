import {
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
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Bell,
  CheckCircle,
  Clock,
  Cube,
  MagnifyingGlass,
  XCircle,
} from 'phosphor-react-native';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  warning: '#8A5A00',
  warningSoft: '#F7EAC7',

  danger: '#A82520',
  dangerSoft: '#F6DEDC',
};

/* =========================================================
   TYPES
========================================================= */

type OrderStatus =
  | 'new'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

type Order = {
  id: string;
  customer: string;
  items: string;
  distance: string;
  time: string;
  totalItems: number;
  medicineNames: string[];
  status: OrderStatus;
};

/* =========================================================
   MOCK ORDERS
========================================================= */

const ORDERS: Order[] = [
  {
    id: '#MB1452',
    customer: 'Rahul Sharma',
    items: '2 items',
    distance: '1.2 km',
    time: '5 mins ago',
    totalItems: 2,
    medicineNames: ['Paracetamol 500 mg', 'Cetirizine 10 mg'],
    status: 'new',
  },
  {
    id: '#MB1451',
    customer: 'Priya Verma',
    items: '1 item',
    distance: '0.8 km',
    time: '18 mins ago',
    totalItems: 1,
    medicineNames: ['Azithromycin 500 mg'],
    status: 'new',
  },
  {
    id: '#MB1450',
    customer: 'Amit Patel',
    items: '3 items',
    distance: '2.4 km',
    time: '32 mins ago',
    totalItems: 3,
    medicineNames: ['Pantoprazole 40 mg', 'Paracetamol 650 mg', 'Vitamin D3 60K IU'],
    status: 'new',
  },
  {
    id: '#MB1448',
    customer: 'Sneha Das',
    items: '4 items',
    distance: '1.7 km',
    time: '42 mins ago',
    totalItems: 4,
    medicineNames: ['Dolo 650 mg', 'ORS 21 g'],
    status: 'ongoing',
  },
  {
    id: '#MB1447',
    customer: 'Vikram Singh',
    items: '2 items',
    distance: '3.1 km',
    time: '1 hr ago',
    totalItems: 2,
    medicineNames: ['Levocetirizine 5 mg', 'Montelukast 10 mg'],
    status: 'ongoing',
  },
  {
    id: '#MB1446',
    customer: 'Ananya Rao',
    items: '5 items',
    distance: '1.4 km',
    time: '2 hrs ago',
    totalItems: 5,
    medicineNames: ['Metformin 500 mg', 'Amlodipine 5 mg'],
    status: 'ongoing',
  },
  {
    id: '#MB1442',
    customer: 'Arjun Mehta',
    items: '3 items',
    distance: '2.2 km',
    time: 'Yesterday',
    totalItems: 3,
    medicineNames: ['Paracetamol 500 mg', 'Cetirizine 10 mg'],
    status: 'completed',
  },
  {
    id: '#MB1440',
    customer: 'Neha Gupta',
    items: '2 items',
    distance: '1.1 km',
    time: 'Yesterday',
    totalItems: 2,
    medicineNames: ['Pantoprazole 40 mg', 'ORS 21 g'],
    status: 'completed',
  },
];

/* =========================================================
   PRESS SCALE
========================================================= */

function usePressScale(
  pressedScale = 0.97
) {
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
   STATUS CONFIG
========================================================= */

function getStatusConfig(status: OrderStatus) {
  switch (status) {
    case 'new':
      return {
        label: 'New',
        background: COLORS.primarySoft,
        color: COLORS.primary,
        icon: (
          <Cube
            size={15}
            color={COLORS.primary}
            weight="regular"
          />
        ),
      };

    case 'ongoing':
      return {
        label: 'Ongoing',
        background: COLORS.warningSoft,
        color: COLORS.warning,
        icon: (
          <Clock
            size={15}
            color={COLORS.warning}
            weight="regular"
          />
        ),
      };

    case 'completed':
      return {
        label: 'Completed',
        background: COLORS.successSoft,
        color: COLORS.success,
        icon: (
          <CheckCircle
            size={15}
            color={COLORS.success}
            weight="regular"
          />
        ),
      };

    default:
      return {
        label: 'Cancelled',
        background: COLORS.dangerSoft,
        color: COLORS.danger,
        icon: (
          <XCircle
            size={15}
            color={COLORS.danger}
            weight="regular"
          />
        ),
      };
  }
}

/* =========================================================
   ORDER CARD
========================================================= */

const OrderCard = memo(function OrderCard({
  order,
  animation,
  compact,
  onPress,
}: {
  order: Order;
  animation: Animated.Value;
  compact: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(0.985);
  const viewPress = usePressScale(0.94);

  const translateY =
    animation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 0],
    });

  const status =
    getStatusConfig(order.status);

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
            compact &&
            styles.orderCardCompact,
            {
              transform: [
                {
                  scale: press.scale,
                },
              ],
            },
          ]}
        >
          {/* TOP ROW */}

          <View
            style={styles.orderTopRow}
          >
            <View
              style={styles.orderIdWrap}
            >
              <Text
                style={styles.orderId}
              >
                {order.id}
              </Text>

              <View
                style={[
                  styles.statusPill,
                  {
                    backgroundColor:
                      status.background,
                  },
                ]}
              >
                {status.icon}

                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        status.color,
                    },
                  ]}
                >
                  {status.label}
                </Text>
              </View>
            </View>

            <Text
              style={styles.orderTime}
            >
              {order.time}
            </Text>
          </View>

          {/* CUSTOMER */}

          <Text
            style={styles.customerName}
            numberOfLines={1}
          >
            {order.customer}
          </Text>

          {/* META */}

          <View
            style={styles.metaRow}
          >
            <View
              style={styles.metaItem}
            >
              <Cube
                size={16}
                color={
                  COLORS.textMuted
                }
              />

              <Text
                style={styles.metaText}
              >
                {order.items}
              </Text>
            </View>

            <View
              style={styles.metaDot}
            />

            <View
              style={styles.metaItem}
            >
              <Text
                style={styles.metaText}
              >
                {order.distance}
              </Text>
            </View>
          </View>

          {/* DIVIDER */}

          <View
            style={styles.divider}
          />

          {/* BOTTOM */}

          <View
            style={styles.orderBottomRow}
          >
            <Text
              style={styles.itemsText}
            >
              {order.totalItems}{' '}
              {order.totalItems === 1
                ? 'item'
                : 'items'}
            </Text>

            <Pressable
              onPress={onPress}
              onPressIn={
                viewPress.onPressIn
              }
              onPressOut={
                viewPress.onPressOut
              }
            >
              <Animated.View
                style={[
                  styles.viewButton,
                  compact &&
                  styles.viewButtonCompact,
                  {
                    transform: [
                      {
                        scale:
                          viewPress.scale,
                      },
                    ],
                  },
                ]}
              >
                <Text
                  style={
                    styles.viewButtonText
                  }
                >
                  View Order
                </Text>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

/* =========================================================
   FILTER TAB
========================================================= */

const FilterTab = memo(function FilterTab({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const press = usePressScale(0.97);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={styles.filterPressable}
    >
      <Animated.View
        style={[
          styles.filterTab,
          active &&
          styles.filterTabActive,
          {
            transform: [
              {
                scale: press.scale,
              },
            ],
          },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            active &&
            styles.filterTextActive,
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.filterCount,
            active &&
            styles.filterCountActive,
          ]}
        >
          <Text
            style={[
              styles.filterCountText,
              active &&
              styles.filterCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
});

/* =========================================================
   ORDERS SCREEN
========================================================= */

export default function PharmacyOrders() {
  const { width, height } =
    useWindowDimensions();

  const compact =
    width <= 380 || height <= 700;

  const [selectedFilter, setSelectedFilter] =
    useState<OrderStatus | 'all'>(
      'new'
    );

  const [searchVisible, setSearchVisible] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  /* =======================================================
     SCREEN ANIMATION
  ======================================================= */

  const screenOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const headerTranslate = useRef(
    new Animated.Value(-8)
  ).current;

  const filtersTranslate = useRef(
    new Animated.Value(10)
  ).current;

  const ordersTranslate = useRef(
    new Animated.Value(14)
  ).current;

  const bottomTranslate = useRef(
    new Animated.Value(8)
  ).current;

  const orderAnimations = useRef(
    ORDERS.map(
      () => new Animated.Value(0)
    )
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        screenOpacity,
        {
          toValue: 1,
          duration: 280,
          easing:
            Easing.out(Easing.ease),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        headerTranslate,
        {
          toValue: 0,
          duration: 350,
          easing:
            Easing.out(Easing.cubic),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        filtersTranslate,
        {
          toValue: 0,
          duration: 350,
          delay: 60,
          easing:
            Easing.out(Easing.cubic),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        ordersTranslate,
        {
          toValue: 0,
          duration: 350,
          delay: 100,
          easing:
            Easing.out(Easing.cubic),
          useNativeDriver: true,
        }
      ),

      Animated.timing(
        bottomTranslate,
        {
          toValue: 0,
          duration: 300,
          delay: 150,
          easing:
            Easing.out(Easing.cubic),
          useNativeDriver: true,
        }
      ),
    ]).start();

    orderAnimations.forEach(
      (animation, index) => {
        Animated.timing(animation, {
          toValue: 1,
          duration: 280,
          delay:
            160 + index * 45,
          easing:
            Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      }
    );
  }, []);

  /* =======================================================
     FILTERED ORDERS
  ======================================================= */

  const filteredOrders = ORDERS.filter((order) => {
    const matchesFilter =
      selectedFilter === 'all' ||
      order.status === selectedFilter;

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return matchesFilter;
    }

    const searchableText = [
      order.id,
      order.customer,
      order.items,
      ...order.medicineNames,
    ].join(' ').toLowerCase();

    return matchesFilter && searchableText.includes(query);
  });

  /* =======================================================
     COUNTS
  ======================================================= */

  const newCount =
    ORDERS.filter(
      order => order.status === 'new'
    ).length;

  const ongoingCount =
    ORDERS.filter(
      order =>
        order.status === 'ongoing'
    ).length;

  const completedCount =
    ORDERS.filter(
      order =>
        order.status === 'completed'
    ).length;

  /* =======================================================
     HANDLERS
  ======================================================= */

  const selectFilter = useCallback(
    (filter: OrderStatus | 'all') => {
      setSelectedFilter(filter);
    },
    []
  );

  const openOrder = useCallback(
    (orderId: string) => {
      router.push({
        pathname:
          '/pharmacy-side/order-request',
        params: {
          orderId,
        },
      });
    },
    []
  );

  const openHome = useCallback(() => {
    router.replace(
      '/pharmacy-side/home'
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

  const notificationPress =
    usePressScale(0.9);

  const searchPress =
    usePressScale(0.9);

  const toggleSearch = useCallback(() => {
    setSearchVisible(previous => {
      if (previous) {
        setSearchQuery('');
      }
      return !previous;
    });
  }, []);

  const openNotifications = useCallback(() => {
    router.push('/pharmacy-side/notifications');
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
              opacity:
                screenOpacity,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={[
              styles.scrollContent,
              compact &&
              styles.scrollContentCompact,
            ]}
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
                    styles.title,
                    compact &&
                    styles.titleCompact,
                  ]}
                >
                  Orders
                </Text>

                <Text
                  style={styles.subtitle}
                >
                  Manage your pharmacy
                  orders
                </Text>
              </View>

              <View
                style={
                  styles.headerActions
                }
              >
                <Pressable
                  onPress={toggleSearch}
                  onPressIn={
                    searchPress.onPressIn
                  }
                  onPressOut={
                    searchPress.onPressOut
                  }
                >
                  <Animated.View
                    style={[
                      styles.iconButton,
                      {
                        transform: [
                          {
                            scale:
                              searchPress.scale,
                          },
                        ],
                      },
                    ]}
                  >
                    <MagnifyingGlass
                      size={22}
                      color={
                        COLORS.textPrimary
                      }
                    />
                  </Animated.View>
                </Pressable>

                <Pressable
                  onPress={openNotifications}
                  onPressIn={
                    notificationPress.onPressIn
                  }
                  onPressOut={
                    notificationPress.onPressOut
                  }
                >
                  <Animated.View
                    style={[
                      styles.iconButton,
                      {
                        transform: [
                          {
                            scale:
                              notificationPress.scale,
                          },
                        ],
                      },
                    ]}
                  >
                    <Bell
                      size={22}
                      color={
                        COLORS.textPrimary
                      }
                    />

                    <View
                      style={
                        styles.notificationDot
                      }
                    />
                  </Animated.View>
                </Pressable>
              </View>
            </Animated.View>

            {searchVisible && (
              <Animated.View
                style={[
                  styles.searchContainer,
                  {
                    opacity: screenOpacity,
                    transform: [
                      {
                        translateY: screenOpacity.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-6, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MagnifyingGlass
                  size={19}
                  color={COLORS.textMuted}
                />

                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search customer, order ID or medicine"
                  placeholderTextColor={COLORS.textMuted}
                  autoFocus
                  returnKeyType="search"
                  style={styles.searchInput}
                />

                {searchQuery.length > 0 && (
                  <Pressable
                    onPress={() => setSearchQuery('')}
                    hitSlop={8}
                  >
                    <XCircle
                      size={19}
                      color={COLORS.textMuted}
                      weight="regular"
                    />
                  </Pressable>
                )}
              </Animated.View>
            )}

            {/* ==========================================
                SUMMARY
            ========================================== */}

            <Animated.View
              style={[
                styles.summaryCard,
                compact &&
                styles.summaryCardCompact,
                {
                  transform: [
                    {
                      translateY:
                        filtersTranslate,
                    },
                  ],
                },
              ]}
            >
              <View>
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Total Orders
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {ORDERS.length}
                </Text>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View>
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Pending
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        COLORS.primary,
                    },
                  ]}
                >
                  {newCount}
                </Text>
              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View>
                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Ongoing
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color:
                        COLORS.warning,
                    },
                  ]}
                >
                  {ongoingCount}
                </Text>
              </View>
            </Animated.View>

            {/* ==========================================
                FILTERS
            ========================================== */}

            <Animated.View
              style={[
                styles.filters,
                {
                  transform: [
                    {
                      translateY:
                        filtersTranslate,
                    },
                  ],
                },
              ]}
            >
              <FilterTab
                label="New"
                count={newCount}
                active={
                  selectedFilter ===
                  'new'
                }
                onPress={() =>
                  selectFilter(
                    'new'
                  )
                }
              />

              <FilterTab
                label="Ongoing"
                count={ongoingCount}
                active={
                  selectedFilter ===
                  'ongoing'
                }
                onPress={() =>
                  selectFilter(
                    'ongoing'
                  )
                }
              />

              <FilterTab
                label="Completed"
                count={
                  completedCount
                }
                active={
                  selectedFilter ===
                  'completed'
                }
                onPress={() =>
                  selectFilter(
                    'completed'
                  )
                }
              />
            </Animated.View>

            {/* ==========================================
                ORDER LIST
            ========================================== */}

            <Animated.View
              style={[
                styles.ordersSection,
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
                  styles.listHeader
                }
              >
                <Text
                  style={
                    styles.listTitle
                  }
                >
                  {selectedFilter ===
                    'new'
                    ? 'New Orders'
                    : selectedFilter ===
                      'ongoing'
                      ? 'Ongoing Orders'
                      : 'Completed Orders'}
                </Text>

                <Text
                  style={
                    styles.listCount
                  }
                >
                  {filteredOrders.length}{' '}
                  {filteredOrders.length ===
                    1
                    ? 'order'
                    : 'orders'}
                </Text>
              </View>

              {filteredOrders.length >
                0 ? (
                filteredOrders.map(
                  (order, index) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      compact={compact}
                      animation={
                        orderAnimations[
                        index %
                        orderAnimations.length
                        ]
                      }
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
                    styles.emptyState
                  }
                >
                  <View
                    style={
                      styles.emptyIcon
                    }
                  >
                    <Cube
                      size={28}
                      color={
                        COLORS.textMuted
                      }
                    />
                  </View>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    {searchQuery.trim()
                      ? 'No matching orders'
                      : 'No orders here'}
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    {searchQuery.trim()
                      ? `No order matches "${searchQuery.trim()}".`
                      : 'Orders in this category will appear here.'}
                  </Text>
                </View>
              )}
            </Animated.View>
          </ScrollView>
        </Animated.View>

        {/* ==========================================
            BOTTOM NAV
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
          <Pressable
            style={styles.navItem}
            onPress={openHome}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color="#6B615A"
            />
            <Text style={styles.navText}>Home</Text>
          </Pressable>

          <Pressable style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Ionicons
                name="receipt"
                size={21}
                color="#9A4B23"
              />
            </View>
            <Text style={styles.navTextActive}>Orders</Text>
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
            <Text style={styles.navText}>History</Text>
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
            <Text style={styles.navText}>Profile</Text>
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
    paddingBottom: 105,
  },

  scrollContentCompact: {
    paddingHorizontal: 14,
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 16,
  },

  headerCompact: {
    minHeight: 57,
    marginBottom: 12,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },

  titleCompact: {
    fontSize: 23,
    lineHeight: 28,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 10,
  },

  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 7,
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
     SEARCH
  ======================================================= */

  searchContainer: {
    minHeight: 50,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    marginBottom: 13,
    gap: 9,
  },

  searchInput: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 0,
    fontSize: 13,
    color: COLORS.textPrimary,
  },

  /* =======================================================
     SUMMARY
  ======================================================= */

  summaryCard: {
    minHeight: 94,
    borderRadius: 17,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
    paddingHorizontal: 12,
    marginBottom: 17,
  },

  summaryCardCompact: {
    minHeight: 86,
    marginBottom: 13,
    borderRadius: 15,
  },

  summaryLabel: {
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  summaryValue: {
    marginTop: 3,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor:
      COLORS.border,
  },

  /* =======================================================
     FILTERS
  ======================================================= */

  filters: {
    flexDirection: 'row',
    backgroundColor:
      COLORS.surfaceAlt,
    borderRadius: 13,
    padding: 4,
    marginBottom: 22,
  },

  filterPressable: {
    flex: 1,
  },

  filterTab: {
    minHeight: 43,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 5,
  },

  filterTabActive: {
    backgroundColor:
      COLORS.surface,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 1,
  },

  filterText: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  filterTextActive: {
    color: COLORS.primary,
  },

  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor:
      '#E4DED6',
    alignItems: 'center',
    justifyContent:
      'center',
    paddingHorizontal: 5,
  },

  filterCountActive: {
    backgroundColor:
      COLORS.primarySoft,
  },

  filterCountText: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  filterCountTextActive: {
    color: COLORS.primary,
  },

  /* =======================================================
     ORDERS
  ======================================================= */

  ordersSection: {
    marginBottom: 15,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 11,
  },

  listTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  listCount: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textMuted,
  },

  /* =======================================================
     ORDER CARD
  ======================================================= */

  orderCard: {
    backgroundColor:
      COLORS.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    padding: 14,
    marginBottom: 11,
  },

  orderCardCompact: {
    padding: 12,
    borderRadius: 15,
  },

  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  orderIdWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },

  orderId: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  statusPill: {
    minHeight: 25,
    borderRadius: 8,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statusText: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '600',
  },

  orderTime: {
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textMuted,
  },

  customerName: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor:
      COLORS.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor:
      COLORS.border,
    marginVertical: 12,
  },

  orderBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

  itemsText: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  viewButton: {
    height: 39,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor:
      COLORS.primary,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  viewButtonCompact: {
    height: 36,
    paddingHorizontal: 13,
  },

  viewButtonText: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  emptyState: {
    minHeight: 210,
    borderRadius: 17,
    backgroundColor:
      COLORS.surface,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    alignItems: 'center',
    justifyContent:
      'center',
    padding: 20,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor:
      COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  emptyTitle: {
    marginTop: 13,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  emptyText: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
