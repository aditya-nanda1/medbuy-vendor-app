import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HistoryOrder = {
  id: string;
  customer: string;
  items: number;
  amount: string;
  distance: string;
  completedAt: string;
  deliveryAgent: string;
  orderName: string;
};

const HISTORY_ORDERS: HistoryOrder[] = [
  {
    id: '#MB1442',
    customer: 'Arjun Mehta',
    items: 3,
    amount: '₹486',
    distance: '2.2 km',
    completedAt: 'Today, 10:42 AM',
    deliveryAgent: 'Rahul Kumar',
    orderName: 'Paracetamol 500 mg, Cetirizine 10 mg',
  },
  {
    id: '#MB1440',
    customer: 'Neha Gupta',
    items: 2,
    amount: '₹325',
    distance: '1.1 km',
    completedAt: 'Today, 09:18 AM',
    deliveryAgent: 'Amit Das',
    orderName: 'Pantoprazole 40 mg, ORS 21 g',
  },
  {
    id: '#MB1438',
    customer: 'Rohan Patnaik',
    items: 4,
    amount: '₹712',
    distance: '3.4 km',
    completedAt: 'Yesterday, 08:36 PM',
    deliveryAgent: 'Sourav Singh',
    orderName: 'Azithromycin 500 mg, Vitamin D3 60K IU',
  },
  {
    id: '#MB1435',
    customer: 'Priya Sharma',
    items: 2,
    amount: '₹268',
    distance: '1.8 km',
    completedAt: 'Yesterday, 06:12 PM',
    deliveryAgent: 'Vikram Das',
    orderName: 'Dolo 650 mg, ORS 21 g',
  },
  {
    id: '#MB1432',
    customer: 'Ananya Rao',
    items: 5,
    amount: '₹945',
    distance: '2.7 km',
    completedAt: 'Yesterday, 03:48 PM',
    deliveryAgent: 'Rahul Kumar',
    orderName: 'Metformin 500 mg, Amlodipine 5 mg',
  },
  {
    id: '#MB1429',
    customer: 'Vivek Mishra',
    items: 3,
    amount: '₹540',
    distance: '1.5 km',
    completedAt: '18 Sep, 07:25 PM',
    deliveryAgent: 'Amit Das',
    orderName: 'Levocetirizine 5 mg, Montelukast 10 mg',
  },
  {
    id: '#MB1425',
    customer: 'Sneha Das',
    items: 1,
    amount: '₹185',
    distance: '0.9 km',
    completedAt: '18 Sep, 04:16 PM',
    deliveryAgent: 'Sourav Singh',
    orderName: 'Paracetamol 650 mg',
  },
  {
    id: '#MB1421',
    customer: 'Aakash Verma',
    items: 4,
    amount: '₹634',
    distance: '2.8 km',
    completedAt: '17 Sep, 01:42 PM',
    deliveryAgent: 'Vikram Das',
    orderName: 'Pantoprazole 40 mg, Cetirizine 10 mg, Vitamin D3 60K IU',
  },
];

const FILTERS = ['All', 'Today', 'Yesterday', 'This Week'];

export default function HistoryScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const headerAnim = useRef(new Animated.Value(0)).current;
  const summaryAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const cardAnimations = useRef(
    HISTORY_ORDERS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(summaryAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      60,
      cardAnimations.map((animation) =>
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  // Live search: filter immediately as each character is typed.
  // Name/order searches match from the beginning of a word.
  // Example:
  // "a"  -> Arjun Mehta, Ananya Rao, Aakash Verma, etc.
  // "ar" -> Arjun Mehta
  // "an" -> Ananya Rao
  // Order IDs still support normal partial matching.
  const filteredOrders = HISTORY_ORDERS.filter((order) => {
    const query = search.toLowerCase();

    const customerWords = order.customer
      .toLowerCase()
      .split(/\\s+/)
      .filter(Boolean);

    const orderNameWords = order.orderName
      .toLowerCase()
      .split(/[,\\s]+/)
      .filter(Boolean);

    const agentWords = order.deliveryAgent
      .toLowerCase()
      .split(/\\s+/)
      .filter(Boolean);

    const matchesCustomer =
      query.length === 0 ||
      customerWords.some((word) => word.startsWith(query));

    const matchesOrderName =
      query.length === 0 ||
      orderNameWords.some((word) => word.startsWith(query));

    const matchesDeliveryAgent =
      query.length === 0 ||
      agentWords.some((word) => word.startsWith(query));

    const matchesOrderId =
      query.length === 0 ||
      order.id.toLowerCase().includes(query);

    const matchesSearch =
      matchesCustomer ||
      matchesOrderName ||
      matchesDeliveryAgent ||
      matchesOrderId;

    let matchesFilter = true;

    if (activeFilter === 'Today') {
      matchesFilter = order.completedAt.startsWith('Today');
    }

    if (activeFilter === 'Yesterday') {
      matchesFilter = order.completedAt.startsWith('Yesterday');
    }

    if (activeFilter === 'This Week') {
      matchesFilter =
        order.completedAt.startsWith('Today') ||
        order.completedAt.startsWith('Yesterday') ||
        order.completedAt.includes('Sep');
    }

    return matchesSearch && matchesFilter;
  });

  const openOrder = (orderId: string) => {
    router.push({
      pathname: '/pharmacy-side/order-request',
      params: {
        orderId,
        source: 'history',
      },
    });
  };

  const openHome = () => {
    router.replace('/pharmacy-side/home');
  };

  const openOrders = () => {
    router.replace('/pharmacy-side/orders');
  };

  const openProfile = () => {
    router.replace('/pharmacy-side/profile');
  };

  const renderOrder = ({
    item,
    index,
  }: {
    item: HistoryOrder;
    index: number;
  }) => {
    const animation =
      cardAnimations[index % cardAnimations.length] ||
      new Animated.Value(1);

    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 0],
    });

    return (
      <Animated.View
        style={[
          styles.orderCard,
          {
            opacity: animation,
            transform: [{ translateY }],
          },
        ]}
      >
        <Pressable
          onPress={() => openOrder(item.id)}
          style={({ pressed }) => [
            styles.orderPressable,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.orderTop}>
            <View style={styles.orderIdRow}>
              <View style={styles.completedIcon}>
                <Ionicons
                  name="checkmark"
                  size={15}
                  color="#1F6B45"
                />
              </View>

              <View>
                <Text style={styles.orderId}>{item.id}</Text>
                <Text style={styles.completedText}>Completed</Text>
              </View>
            </View>

            <Text style={styles.amount}>{item.amount}</Text>
          </View>

          <View style={styles.customerRow}>
            <View style={styles.customerIcon}>
              <Ionicons
                name="person-outline"
                size={16}
                color="#5C534C"
              />
            </View>

            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{item.customer}</Text>
              <Text style={styles.orderName} numberOfLines={1}>
                {item.orderName}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="cube-outline"
                size={15}
                color="#6B615A"
              />
              <Text style={styles.metaText}>
                {item.items} {item.items === 1 ? 'item' : 'items'}
              </Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Ionicons
                name="location-outline"
                size={15}
                color="#6B615A"
              />
              <Text style={styles.metaText}>{item.distance}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={15}
                color="#6B615A"
              />
              <Text style={styles.metaText}>{item.completedAt}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.bottomRow}>
            <View style={styles.agentRow}>
              <Ionicons
                name="bicycle-outline"
                size={17}
                color="#5C534C"
              />
              <Text style={styles.agentText}>
                Delivered by {item.deliveryAgent}
              </Text>
            </View>

            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View</Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color="#9A4B23"
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>
              View your completed orders
            </Text>
          </View>

          <Pressable style={styles.iconButton} onPress={() => router.push("/pharmacy-side/notifications")}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#1A1512"
            />
          </Pressable>
        </Animated.View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B615A"
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search orders or customers"
            placeholderTextColor="#91877F"
            style={styles.searchInput}
            returnKeyType="search"
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color="#91877F"
              />
            </Pressable>
          )}
        </View>

        {/* SUMMARY */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: summaryAnim,
              transform: [
                {
                  translateY: summaryAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#1F6B45"
              />
            </View>

            <View>
              <Text style={styles.summaryValue}>28</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#9A4B23"
              />
            </View>

            <View>
              <Text style={styles.summaryValue}>6</Text>
              <Text style={styles.summaryLabel}>This Week</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="trending-up-outline"
                size={20}
                color="#2A5A96"
              />
            </View>

            <View>
              <Text style={styles.summaryValue}>₹4.2K</Text>
              <Text style={styles.summaryLabel}>Order Value</Text>
            </View>
          </View>
        </Animated.View>

        {/* FILTERS */}
        <View style={styles.filterContainer}>
          {FILTERS.map((filter) => {
            const active = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterButton,
                  active && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* LIST */}
        <Animated.View
          style={[
            styles.listContainer,
            {
              opacity: listAnim,
              transform: [
                {
                  translateY: listAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Completed Orders</Text>

            <Text style={styles.countText}>
              {filteredOrders.length} orders
            </Text>
          </View>

          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrder}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="file-tray-outline"
                    size={30}
                    color="#9A4B23"
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No orders found
                </Text>

                <Text style={styles.emptyText}>
                  Try changing your search or filter.
                </Text>
              </View>
            }
          />
        </Animated.View>

        {/* BOTTOM NAV */}
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
            <Text style={styles.navText}>Home</Text>
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
            <Text style={styles.navText}>Orders</Text>
          </Pressable>

          <Pressable style={styles.navItem}>
            <View style={styles.activeNavIcon}>
              <Ionicons
                name="time"
                size={21}
                color="#9A4B23"
              />
            </View>
            <Text style={styles.navTextActive}>History</Text>
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },

  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },

  /* HEADER */

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontFamily: 'System',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    color: '#1A1512',
  },

  subtitle: {
    marginTop: 3,
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    color: '#6B615A',
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0D8CE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* SEARCH */

  searchContainer: {
    marginHorizontal: 20,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D8CE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    fontFamily: 'System',
    fontSize: 14,
    color: '#1A1512',
    paddingVertical: 0,
  },

  /* SUMMARY */

  summaryCard: {
    marginHorizontal: 20,
    marginTop: 14,
    height: 82,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0D8CE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1EDE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1512',
  },

  summaryLabel: {
    marginTop: 1,
    fontFamily: 'System',
    fontSize: 10,
    color: '#6B615A',
  },

  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E0D8CE',
  },

  /* FILTERS */

  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    gap: 8,
  },

  filterButton: {
    height: 36,
    paddingHorizontal: 15,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0D8CE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#9A4B23',
    borderColor: '#9A4B23',
  },

  filterText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    color: '#5C534C',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* LIST */

  listContainer: {
    flex: 1,
    marginTop: 18,
  },

  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listTitle: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1512',
  },

  countText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#6B615A',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 105,
  },

  /* ORDER CARD */

  orderCard: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0D8CE',
    overflow: 'hidden',
  },

  orderPressable: {
    padding: 15,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  completedIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#E8F3ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  orderId: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1512',
  },

  completedText: {
    marginTop: 2,
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '500',
    color: '#1F6B45',
  },

  amount: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1512',
  },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 13,
  },

  customerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1EDE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  customerDetails: {
    flex: 1,
    minWidth: 0,
  },

  customerName: {
    fontFamily: 'System',
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1512',
  },

  orderName: {
    marginTop: 2,
    fontFamily: 'System',
    fontSize: 11,
    color: '#6B615A',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    flexWrap: 'wrap',
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    marginLeft: 4,
    fontFamily: 'System',
    fontSize: 11,
    color: '#6B615A',
  },

  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B7AEA5',
    marginHorizontal: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE9E3',
    marginTop: 13,
  },

  bottomRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  agentText: {
    marginLeft: 6,
    fontFamily: 'System',
    fontSize: 11,
    color: '#6B615A',
  },

  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewButtonText: {
    fontFamily: 'System',
    fontSize: 12,
    fontWeight: '500',
    color: '#9A4B23',
    marginRight: 2,
  },

  /* EMPTY */

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F6E6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    marginTop: 15,
    fontFamily: 'System',
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1512',
  },

  emptyText: {
    marginTop: 5,
    fontFamily: 'System',
    fontSize: 13,
    color: '#6B615A',
    textAlign: 'center',
  },

  /* BOTTOM NAV */

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