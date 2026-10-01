import { router } from 'expo-router';
import {
  ArrowLeft,
  CaretRight,
  ChatCircle,
  Envelope,
  Question,
  WarningCircle,
} from 'phosphor-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Linking,
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
  info: '#2A5A96',
  infoSoft: '#EAF1F8',
  warning: '#8A5A00',
  warningSoft: '#FFF5DE',
  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',
  border: '#E0D8CE',
  divider: '#EEE9E3',
};

export default function HelpSupportScreen() {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const openEmail = () => {
    Linking.openURL(
      'mailto:support@medbuy.com'
    );
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
                  Help & Support
                </Text>

                <Text style={styles.subtitle}>
                  We're here to help
                </Text>
              </View>
            </View>

            <View style={styles.supportCard}>
              <View style={styles.supportIcon}>
                <Question
                  size={27}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <Text style={styles.supportTitle}>
                Need help?
              </Text>

              <Text style={styles.supportText}>
                Find answers to common questions or contact
                the MedBuy support team.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>
              Support
            </Text>

            <View style={styles.card}>
              <SupportItem
                icon={
                  <Question
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Frequently Asked Questions"
                subtitle="Find answers to common questions"
                onPress={() => { }}
              />

              <View style={styles.divider} />

              <SupportItem
                icon={
                  <Envelope
                    size={21}
                    color={COLORS.info}
                    weight="regular"
                  />
                }
                title="Email Support"
                subtitle="Contact the MedBuy support team"
                onPress={openEmail}
              />

              <View style={styles.divider} />

              <SupportItem
                icon={
                  <ChatCircle
                    size={21}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Contact Support"
                subtitle="Support chat will be available soon"
                onPress={() => { }}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Report an Issue
            </Text>

            <View style={styles.issueCard}>
              <View style={styles.issueIcon}>
                <WarningCircle
                  size={22}
                  color={COLORS.warning}
                  weight="regular"
                />
              </View>

              <View style={styles.issueContent}>
                <Text style={styles.issueTitle}>
                  Something not working?
                </Text>

                <Text style={styles.issueText}>
                  Contact support and include the order
                  number or screen where you experienced
                  the issue.
                </Text>
              </View>
            </View>

            <Text style={styles.footer}>
              MedBuy Pharmacy Partner · Support
            </Text>
          </ScrollView>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function SupportItem({
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
        styles.item,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconBox}>
        {icon}
      </View>

      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>
          {title}
        </Text>

        <Text style={styles.itemSubtitle}>
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

  supportCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  supportTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  supportText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
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

  item: {
    minHeight: 73,
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

  itemContent: {
    flex: 1,
    marginRight: 8,
  },

  itemTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  itemSubtitle: {
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

  issueCard: {
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: '#EED9A7',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
  },

  issueIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  issueContent: {
    flex: 1,
    marginLeft: 11,
  },

  issueTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  issueText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.textMuted,
  },
});