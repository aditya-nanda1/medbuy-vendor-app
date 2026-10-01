import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Envelope,
  IdentificationCard,
  Phone,
  Storefront,
  User,
} from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const COLORS = {
  background: '#F9F7F4',
  surface: '#FFFFFF',
  primary: '#9A4B23',
  primarySoft: '#F6E6DC',
  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',
  border: '#E0D8CE',
  divider: '#EEE9E3',
};

export default function StoreInformationScreen() {
  const [user, setUser] = useState<UserData | null>(null);

  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();

    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('medbuy_user');

      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load user:', error);
    }
  };

  const storeName = user?.storeName || 'Pharmacy Store';
  const ownerName = user?.name || 'Store Owner';
  const email = user?.email || 'Not available';
  const phone = user?.phone || 'Not available';

  const getInitials = () => {
    const name = ownerName.trim();

    if (!name) return 'MS';

    const parts = name.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={{
            flex: 1,
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* HEADER */}

            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <ArrowLeft
                  size={22}
                  color={COLORS.textPrimary}
                  weight="regular"
                />
              </Pressable>

              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Store Information
                </Text>

                <Text style={styles.subtitle}>
                  Your pharmacy account details
                </Text>
              </View>
            </View>

            {/* STORE IDENTITY */}

            <View style={styles.identityCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials()}
                </Text>
              </View>

              <View style={styles.identityContent}>
                <Text style={styles.storeName}>
                  {storeName}
                </Text>

                <Text style={styles.ownerName}>
                  {ownerName}
                </Text>

                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeText}>
                    Pharmacy Store
                  </Text>
                </View>
              </View>
            </View>

            {/* DETAILS */}

            <Text style={styles.sectionTitle}>
              Account Details
            </Text>

            <View style={styles.card}>

              <DetailRow
                icon={
                  <Storefront
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Store Name"
                value={storeName}
              />

              <View style={styles.divider} />

              <DetailRow
                icon={
                  <User
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Owner Name"
                value={ownerName}
              />

              <View style={styles.divider} />

              <DetailRow
                icon={
                  <Envelope
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Email Address"
                value={email}
              />

              <View style={styles.divider} />

              <DetailRow
                icon={
                  <Phone
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Phone Number"
                value={phone}
              />

              <View style={styles.divider} />

              <DetailRow
                icon={
                  <IdentificationCard
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                label="Account Type"
                value="Pharmacy Store"
              />

            </View>

            <View style={styles.note}>
              <Text style={styles.noteText}>
                These details are associated with your
                MedBuy pharmacy account.
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        {icon}
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text style={styles.detailValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    backgroundColor: '#F1EDE7',
    transform: [{ scale: 0.97 }],
  },

  headerText: {
    marginLeft: 12,
    flex: 1,
  },

  title: {
    fontSize: 21,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  identityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 21,
    fontWeight: '600',
    color: COLORS.primary,
  },

  identityContent: {
    flex: 1,
    marginLeft: 14,
  },

  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  ownerName: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1F6B45',
    marginRight: 5,
  },

  activeText: {
    fontSize: 11,
    color: '#1F6B45',
    fontWeight: '500',
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 9,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  detailRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },

  detailValue: {
    marginTop: 3,
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 66,
  },

  note: {
    marginTop: 14,
    paddingHorizontal: 4,
  },

  noteText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textMuted,
  },
});