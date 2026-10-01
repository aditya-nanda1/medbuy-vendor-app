import { router } from 'expo-router';
import {
  ArrowLeft,
  CaretRight,
  DeviceMobile,
  Key,
  LockKey,
  ShieldCheck,
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

const COLORS = {
  background: '#F9F7F4',
  surface: '#FFFFFF',
  primary: '#9A4B23',
  primarySoft: '#F6E6DC',
  success: '#1F6B45',
  successSoft: '#E4F1EA',
  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',
  border: '#E0D8CE',
  divider: '#EEE9E3',
};

export default function PrivacySecurityScreen() {
  const entrance = useRef(new Animated.Value(0)).current;

  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

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
                  Privacy & Security
                </Text>

                <Text style={styles.subtitle}>
                  Protect your MedBuy account
                </Text>
              </View>
            </View>

            <View style={styles.securityBanner}>
              <View style={styles.securityIcon}>
                <ShieldCheck
                  size={26}
                  color={COLORS.success}
                  weight="regular"
                />
              </View>

              <View style={styles.securityContent}>
                <Text style={styles.securityTitle}>
                  Account security
                </Text>

                <Text style={styles.securityText}>
                  Your account is protected with secure
                  authentication.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Account Security
            </Text>

            <View style={styles.card}>
              <SettingItem
                icon={
                  <Key
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Change Password"
                subtitle="Update your account password"
                onPress={() =>
                  router.push(
                    '/pharmacy-side/change-password'
                  )
                }
              />

              <View style={styles.divider} />

              <SettingItem
                icon={
                  <DeviceMobile
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Login Security"
                subtitle="Review your account login settings"
                onPress={() => { }}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Privacy
            </Text>

            <View style={styles.card}>
              <SettingItem
                icon={
                  <LockKey
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Account Data"
                subtitle="Your account information is stored securely"
                onPress={() => { }}
              />
            </View>

            <Text style={styles.note}>
              MedBuy only uses account information required
              to operate your pharmacy partner account.
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && styles.pressed,
      ]}
    >
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

      <CaretRight
        size={18}
        color={COLORS.textMuted}
        weight="regular"
      />
    </Pressable>
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

  securityBanner: {
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: '#CFE4D8',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  securityIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityContent: {
    flex: 1,
    marginLeft: 12,
  },

  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  securityText: {
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

  settingItem: {
    minHeight: 72,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pressed: {
    backgroundColor: '#FBF9F6',
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

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 65,
  },

  note: {
    marginTop: 14,
    paddingHorizontal: 4,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textMuted,
  },
});