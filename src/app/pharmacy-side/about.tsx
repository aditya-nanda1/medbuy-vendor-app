import React, { useEffect, useRef } from 'react';
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

import {
  ArrowLeft,
  FirstAid,
  Heart,
  Info,
  ShieldCheck,
  Storefront,
  Truck,
  UserCircle,
} from 'phosphor-react-native';

import { router } from 'expo-router';

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  background: '#F9F7F4',
  surface: '#FFFFFF',

  primary: '#9A4B23',
  primarySoft: '#F6E6DC',

  success: '#1F6B45',
  successSoft: '#E4F1EA',

  info: '#2A5A96',
  infoSoft: '#EAF1F8',

  textPrimary: '#1A1512',
  textSecondary: '#5C534C',
  textMuted: '#91877F',

  border: '#E0D8CE',
  divider: '#EEE9E3',
};

/* ============================================================
   SCREEN
============================================================ */

export default function AboutScreen() {
  const entrance = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const animatedStyle = {
    opacity: entrance,

    transform: [
      {
        translateY: entrance.interpolate({
          inputRange: [0, 1],
          outputRange: [8, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        <Animated.View
          style={[
            styles.flex,
            animatedStyle,
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              styles.content
            }
          >

            {/* ==================================================
                HEADER
            ================================================== */}

            <View style={styles.header}>

              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed &&
                  styles.backButtonPressed,
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
                  About MedBuy
                </Text>

                <Text style={styles.subtitle}>
                  Learn more about MedBuy
                </Text>
              </View>

            </View>

            {/* ==================================================
                MEDBUY BRAND
            ================================================== */}

            <View style={styles.brandCard}>

              <View style={styles.logoContainer}>
                <FirstAid
                  size={34}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <Text style={styles.brandName}>
                MedBuy
              </Text>

              <Text style={styles.brandTagline}>
                Healthcare, made simpler.
              </Text>

              <View style={styles.versionBadge}>
                <Text style={styles.versionBadgeText}>
                  Pharmacy Partner · v1.0.0
                </Text>
              </View>

            </View>

            {/* ==================================================
                WHAT IS MEDBUY
            ================================================== */}

            <Text style={styles.sectionTitle}>
              What is MedBuy?
            </Text>

            <View style={styles.card}>

              <View style={styles.cardIcon}>
                <Info
                  size={22}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <Text style={styles.cardTitle}>
                A connected healthcare marketplace
              </Text>

              <Text style={styles.cardText}>
                MedBuy is a healthcare platform designed
                to connect customers with pharmacies and
                delivery partners through a simple digital
                ordering and delivery experience.
              </Text>

              <Text style={styles.cardText}>
                The platform helps pharmacies receive and
                manage orders, coordinate medicine
                handovers with delivery partners, and keep
                customers informed throughout the order
                journey.
              </Text>

            </View>

            {/* ==================================================
                HOW MEDBUY WORKS
            ================================================== */}

            <Text style={styles.sectionTitle}>
              How MedBuy Works
            </Text>

            <View style={styles.card}>

              <PlatformStep
                number="01"
                icon={
                  <UserCircle
                    size={22}
                    color={COLORS.info}
                    weight="regular"
                  />
                }
                title="Customer"
                text="Customers place medicine orders through the MedBuy platform."
              />

              <View style={styles.stepDivider} />

              <PlatformStep
                number="02"
                icon={
                  <Storefront
                    size={22}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Pharmacy"
                text="Partner pharmacies receive, review, and manage incoming orders."
              />

              <View style={styles.stepDivider} />

              <PlatformStep
                number="03"
                icon={
                  <Truck
                    size={22}
                    color={COLORS.primary}
                    weight="regular"
                  />
                }
                title="Delivery Partner"
                text="A delivery partner coordinates pickup and delivery of the order."
              />

              <View style={styles.stepDivider} />

              <PlatformStep
                number="04"
                icon={
                  <ShieldCheck
                    size={22}
                    color={COLORS.success}
                    weight="regular"
                  />
                }
                title="Verified Handover"
                text="Order handover and delivery are completed through verification steps."
              />

            </View>

            {/* ==================================================
                FOR PHARMACY PARTNERS
            ================================================== */}

            <Text style={styles.sectionTitle}>
              For Pharmacy Partners
            </Text>

            <View style={styles.partnerCard}>

              <View style={styles.partnerIcon}>
                <Storefront
                  size={25}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <Text style={styles.partnerTitle}>
                Your pharmacy, connected to MedBuy
              </Text>

              <Text style={styles.partnerText}>
                The MedBuy Pharmacy Partner app gives
                pharmacies a dedicated place to manage
                incoming orders and coordinate their
                fulfillment journey.
              </Text>

              <View style={styles.partnerPoints}>

                <BenefitRow
                  text="Manage incoming customer orders"
                />

                <BenefitRow
                  text="Track active and completed orders"
                />

                <BenefitRow
                  text="Coordinate delivery handovers"
                />

                <BenefitRow
                  text="Manage your pharmacy profile"
                />

                <BenefitRow
                  text="Configure pharmacy business hours"
                />

              </View>

            </View>

            {/* ==================================================
                OUR APPROACH
            ================================================== */}

            <Text style={styles.sectionTitle}>
              Our Approach
            </Text>

            <View style={styles.approachCard}>

              <View style={styles.approachIcon}>
                <Heart
                  size={24}
                  color={COLORS.primary}
                  weight="regular"
                />
              </View>

              <Text style={styles.approachTitle}>
                Simple. Connected. Reliable.
              </Text>

              <Text style={styles.approachText}>
                MedBuy is designed around making the
                healthcare ordering journey easier for
                customers while giving pharmacies and
                delivery partners the tools they need to
                coordinate orders efficiently.
              </Text>

            </View>

            {/* ==================================================
                SECURITY
            ================================================== */}

            <View style={styles.securityCard}>

              <View style={styles.securityIcon}>
                <ShieldCheck
                  size={23}
                  color={COLORS.success}
                  weight="regular"
                />
              </View>

              <View style={styles.securityContent}>

                <Text style={styles.securityTitle}>
                  Built with account security in mind
                </Text>

                <Text style={styles.securityText}>
                  MedBuy uses account authentication and
                  verification steps to help protect
                  pharmacy accounts and order handovers.
                </Text>

              </View>

            </View>

            {/* ==================================================
                APP INFORMATION
            ================================================== */}

            <Text style={styles.sectionTitle}>
              App Information
            </Text>

            <View style={styles.infoCard}>

              <InfoRow
                label="Application"
                value="MedBuy Pharmacy Partner"
              />

              <View style={styles.divider} />

              <InfoRow
                label="Version"
                value="1.0.0"
              />

              <View style={styles.divider} />

              <InfoRow
                label="Platform"
                value="MedBuy"
              />

            </View>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <View style={styles.footer}>

              <FirstAid
                size={20}
                color={COLORS.primary}
                weight="regular"
              />

              <Text style={styles.footerText}>
                MedBuy
              </Text>

              <Text style={styles.copyright}>
                © 2026 MedBuy. All rights reserved.
              </Text>

            </View>

          </ScrollView>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   PLATFORM STEP
============================================================ */

function PlatformStep({
  number,
  icon,
  title,
  text,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.step}>

      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>
          {number}
        </Text>
      </View>

      <View style={styles.stepIcon}>
        {icon}
      </View>

      <View style={styles.stepContent}>

        <Text style={styles.stepTitle}>
          {title}
        </Text>

        <Text style={styles.stepText}>
          {text}
        </Text>

      </View>

    </View>
  );
}

/* ============================================================
   BENEFIT ROW
============================================================ */

function BenefitRow({
  text,
}: {
  text: string;
}) {
  return (
    <View style={styles.benefitRow}>

      <View style={styles.benefitDot} />

      <Text style={styles.benefitText}>
        {text}
      </Text>

    </View>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text style={styles.infoValue}>
        {value}
      </Text>

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

  flex: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* HEADER */

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

  backButtonPressed: {
    backgroundColor: '#F1EDE7',
    transform: [{ scale: 0.97 }],
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

  /* BRAND */

  brandCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    marginTop: 13,
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  brandTagline: {
    marginTop: 3,
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  versionBadge: {
    marginTop: 13,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
  },

  versionBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.primary,
  },

  /* SECTIONS */

  sectionTitle: {
    marginTop: 24,
    marginBottom: 9,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  /* GENERIC CARD */

  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 17,
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  cardText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  /* PLATFORM */

  step: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },

  stepNumber: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepNumberText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  stepIcon: {
    width: 42,
    height: 42,
    marginLeft: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepContent: {
    flex: 1,
    marginLeft: 11,
  },

  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  stepText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  stepDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 79,
  },

  /* PHARMACY PARTNER */

  partnerCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 17,
  },

  partnerIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  partnerTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  partnerText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  partnerPoints: {
    marginTop: 13,
  },

  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 9,
  },

  benefitText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  /* APPROACH */

  approachCard: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#E8CFC0',
    borderRadius: 14,
    padding: 17,
  },

  approachIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  approachTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  approachText: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  /* SECURITY */

  securityCard: {
    marginTop: 14,
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: '#CFE4D8',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  securityIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  securityContent: {
    flex: 1,
    marginLeft: 11,
  },

  securityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  securityText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.textSecondary,
  },

  /* APP INFO */

  infoCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 52,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 15,
  },

  /* FOOTER */

  footer: {
    marginTop: 28,
    alignItems: 'center',
  },

  footerText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  copyright: {
    marginTop: 5,
    fontSize: 10,
    color: COLORS.textMuted,
  },
});