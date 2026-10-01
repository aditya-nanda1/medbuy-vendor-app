import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  Gear,
  Moon,
  WifiHigh,
} from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
  primary: '#9A4B23',
  primarySoft: '#F6E6DC',
  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',
  border: '#E0D8CE',
  divider: '#EEE9E3',
};

export default function SettingsScreen() {
  const entrance = useRef(new Animated.Value(0)).current;

  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [autoOnline, setAutoOnline] = useState(false);

  useEffect(() => {
    loadSettings();

    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const loadSettings = async () => {
    try {
      const values =
        await AsyncStorage.multiGet([
          'medbuy_notification_sound',
          'medbuy_notification_vibration',
          'medbuy_auto_online',
        ]);

      if (values[0][1] !== null) {
        setSound(values[0][1] === 'true');
      }

      if (values[1][1] !== null) {
        setVibration(values[1][1] === 'true');
      }

      if (values[2][1] !== null) {
        setAutoOnline(values[2][1] === 'true');
      }
    } catch (error) {
      console.log(
        'Failed to load settings:',
        error
      );
    }
  };

  const save = async (
    key: string,
    value: boolean
  ) => {
    try {
      await AsyncStorage.setItem(
        key,
        String(value)
      );
    } catch (error) {
      console.log(
        'Failed to save setting:',
        error
      );
    }
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
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <ArrowLeft
                  size={22}
                  color={COLORS.textPrimary}
                  weight="regular"
                />
              </Pressable>

              <View style={styles.headerText}>
                <Text style={styles.title}>
                  Settings
                </Text>

                <Text style={styles.subtitle}>
                  Manage your app preferences
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Gear
                  size={24}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>
                  Pharmacy Partner Settings
                </Text>

                <Text style={styles.infoText}>
                  Configure how the MedBuy partner app
                  behaves on this device.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Notifications
            </Text>

            <View style={styles.card}>
              <SettingRow
                icon={
                  <Bell
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Notification Sound"
                subtitle="Play a sound for important alerts"
                value={sound}
                onChange={(value) => {
                  setSound(value);
                  save(
                    'medbuy_notification_sound',
                    value
                  );
                }}
              />

              <View style={styles.divider} />

              <SettingRow
                icon={
                  <WifiHigh
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Vibration"
                subtitle="Vibrate when important alerts arrive"
                value={vibration}
                onChange={(value) => {
                  setVibration(value);
                  save(
                    'medbuy_notification_vibration',
                    value
                  );
                }}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Pharmacy
            </Text>

            <View style={styles.card}>
              <SettingRow
                icon={
                  <WifiHigh
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Auto Online"
                subtitle="Automatically appear online when opening the app"
                value={autoOnline}
                onChange={(value) => {
                  setAutoOnline(value);
                  save(
                    'medbuy_auto_online',
                    value
                  );
                }}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Appearance
            </Text>

            <View style={styles.card}>
              <View style={styles.staticRow}>
                <View style={styles.iconBox}>
                  <Moon
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                </View>

                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>
                    Appearance
                  </Text>

                  <Text style={styles.settingSubtitle}>
                    Light mode
                  </Text>
                </View>

                <Text style={styles.currentValue}>
                  Light
                </Text>
              </View>
            </View>

            <Text style={styles.version}>
              MedBuy Pharmacy Partner · Version 1.0.0
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.iconBox}>
        {icon}
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text style={styles.settingSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: '#D7D0C8',
          true: '#CFAE9C',
        }}
        thumbColor={
          value ? COLORS.primary : '#FFFFFF'
        }
        ios_backgroundColor="#D7D0C8"
      />
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
    paddingBottom: 35,
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

  headerText: {
    flex: 1,
    marginLeft: 12,
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

  infoCard: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#E8CFC0',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  infoText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: 'hidden',
  },

  settingRow: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  staticRow: {
    minHeight: 70,
    paddingHorizontal: 14,
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
    marginRight: 8,
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

  currentValue: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 66,
  },

  version: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textMuted,
  },
});