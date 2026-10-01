import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Package,
  ShoppingBag,
  Truck,
} from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  background: '#F9F7F4',
  surface: '#FFFFFF',
  surfaceAlt: '#F1EDE7',

  primary: '#9A4B23',
  primarySoft: '#F6E6DC',

  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',

  border: '#E0D8CE',
  divider: '#EEE9E3',

  success: '#1F6B45',
};

type NotificationSettings = {
  master: boolean;
  newOrders: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  completedOrders: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  master: true,
  newOrders: true,
  orderUpdates: true,
  deliveryUpdates: true,
  completedOrders: true,
};

export default function NotificationsScreen() {
  const [settings, setSettings] =
    useState<NotificationSettings>(
      DEFAULT_SETTINGS
    );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored =
        await AsyncStorage.getItem(
          'medbuy_notification_settings'
        );

      if (stored) {
        setSettings(JSON.parse(stored));
      } else {
        const oldValue =
          await AsyncStorage.getItem(
            'medbuy_notifications_enabled'
          );

        if (oldValue !== null) {
          setSettings({
            ...DEFAULT_SETTINGS,
            master: oldValue === 'true',
          });
        }
      }
    } catch (error) {
      console.log(
        'Failed to load notification settings:',
        error
      );
    }
  };

  const saveSettings = async (
    updated: NotificationSettings
  ) => {
    try {
      await AsyncStorage.setItem(
        'medbuy_notification_settings',
        JSON.stringify(updated)
      );

      await AsyncStorage.setItem(
        'medbuy_notifications_enabled',
        String(updated.master)
      );
    } catch (error) {
      console.log(
        'Failed to save notification settings:',
        error
      );
    }
  };

  const updateSetting = (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    const updated = {
      ...settings,
      [key]: value,
    };

    setSettings(updated);
    saveSettings(updated);
  };

  const toggleMaster = (value: boolean) => {
    const updated = {
      master: value,
      newOrders: value
        ? settings.newOrders
        : false,
      orderUpdates: value
        ? settings.orderUpdates
        : false,
      deliveryUpdates: value
        ? settings.deliveryUpdates
        : false,
      completedOrders: value
        ? settings.completedOrders
        : false,
    };

    setSettings(updated);
    saveSettings(updated);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

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
              hitSlop={8}
            >
              <ArrowLeft
                size={22}
                color={COLORS.textPrimary}
                weight="regular"
              />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>
                Notifications
              </Text>

              <Text style={styles.subtitle}>
                Manage your notification preferences
              </Text>
            </View>
          </View>

          {/* MASTER NOTIFICATIONS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              General
            </Text>

            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.iconBox}>
                  <Bell
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                </View>

                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>
                    Notifications
                  </Text>

                  <Text style={styles.settingSubtitle}>
                    Allow MedBuy to send you notifications
                  </Text>
                </View>

                <Switch
                  value={settings.master}
                  onValueChange={toggleMaster}
                  trackColor={{
                    false: '#D7D0C8',
                    true: '#CFAE9C',
                  }}
                  thumbColor={
                    settings.master
                      ? COLORS.primary
                      : '#FFFFFF'
                  }
                  ios_backgroundColor="#D7D0C8"
                />
              </View>
            </View>
          </View>

          {/* ORDER NOTIFICATIONS */}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Order Notifications
            </Text>

            <View style={styles.card}>

              {/* NEW ORDERS */}

              <NotificationRow
                icon={
                  <ShoppingBag
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="New Orders"
                subtitle="Get notified when a new order arrives"
                value={settings.newOrders}
                disabled={!settings.master}
                onValueChange={(value) =>
                  updateSetting(
                    'newOrders',
                    value
                  )
                }
              />

              <View style={styles.divider} />

              {/* ORDER UPDATES */}

              <NotificationRow
                icon={
                  <Package
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Order Updates"
                subtitle="Updates about accepted and active orders"
                value={settings.orderUpdates}
                disabled={!settings.master}
                onValueChange={(value) =>
                  updateSetting(
                    'orderUpdates',
                    value
                  )
                }
              />

              <View style={styles.divider} />

              {/* DELIVERY */}

              <NotificationRow
                icon={
                  <Truck
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Delivery Updates"
                subtitle="Updates from your delivery partner"
                value={settings.deliveryUpdates}
                disabled={!settings.master}
                onValueChange={(value) =>
                  updateSetting(
                    'deliveryUpdates',
                    value
                  )
                }
              />

              <View style={styles.divider} />

              {/* COMPLETED */}

              <NotificationRow
                icon={
                  <CheckCircle
                    size={21}
                    color={COLORS.success}
                    weight="regular"
                  />
                }
                title="Completed Orders"
                subtitle="Get notified when an order is completed"
                value={settings.completedOrders}
                disabled={!settings.master}
                onValueChange={(value) =>
                  updateSetting(
                    'completedOrders',
                    value
                  )
                }
              />

            </View>
          </View>

          {/* INFO */}

          <View style={styles.infoBox}>
            <Bell
              size={18}
              color={COLORS.primary}
              weight="regular"
            />

            <Text style={styles.infoText}>
              Notifications help you stay updated about
              new orders, delivery activity, and order
              completion.
            </Text>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   NOTIFICATION ROW
============================================================ */

function NotificationRow({
  icon,
  title,
  subtitle,
  value,
  disabled,
  onValueChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.iconBox}>
        {icon}
      </View>

      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            disabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingSubtitle,
            disabled && styles.disabledText,
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: '#D7D0C8',
          true: '#CFAE9C',
        }}
        thumbColor={
          value && !disabled
            ? COLORS.primary
            : '#FFFFFF'
        }
        ios_backgroundColor="#D7D0C8"
      />
    </View>
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 35,
  },

  /* HEADER */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
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
    backgroundColor: COLORS.surfaceAlt,
    transform: [{ scale: 0.97 }],
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  /* SECTION */

  section: {
    marginTop: 4,
    marginBottom: 22,
  },

  sectionTitle: {
    marginBottom: 9,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  /* CARD */

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: 'hidden',
  },

  /* SETTING ROW */

  settingRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  settingContent: {
    flex: 1,
    marginRight: 10,
  },

  settingTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  settingSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    color: COLORS.textSecondary,
  },

  disabledText: {
    color: COLORS.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 66,
  },

  /* INFO */

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primarySoft,
    borderRadius: 12,
    padding: 14,
    marginTop: 2,
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },
});