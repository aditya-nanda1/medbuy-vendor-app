import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CaretRight,
  FirstAid,
  Motorcycle,
} from 'phosphor-react-native';

export default function Index() {
  const [showRoleSelection, setShowRoleSelection] =
    useState(false);

  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const scale = useRef(
    new Animated.Value(0.92)
  ).current;

  /* ============================================================
     STARTUP
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const startApp = async () => {
      // --------------------------------------------------------
      // Splash animation
      // --------------------------------------------------------

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),

        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // --------------------------------------------------------
      // Keep splash visible
      // --------------------------------------------------------

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 2500);
      });

      if (!mounted) {
        return;
      }

      // --------------------------------------------------------
      // Check existing login session
      // --------------------------------------------------------

      try {
        const storedUser =
          await AsyncStorage.getItem(
            'medbuy_user'
          );

        // ------------------------------------------------------
        // User is already logged in
        // ------------------------------------------------------

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);

            // --------------------------------------------------
            // Pharmacy session
            // --------------------------------------------------

            if (
              user &&
              user.role === 'pharmacy'
            ) {
              router.replace(
                '/pharmacy-side/home'
              );

              return;
            }

            // --------------------------------------------------
            // Delivery Agent session
            // --------------------------------------------------

            if (
              user &&
              user.role === 'delivery_agent'
            ) {
              router.replace(
                '/delivery-side/delivery-home'
              );

              return;
            }

            // --------------------------------------------------
            // Unknown / unsupported session
            // --------------------------------------------------

            await AsyncStorage.removeItem(
              'medbuy_user'
            );

          } catch (parseError) {
            console.log(
              'Invalid stored user session:',
              parseError
            );

            await AsyncStorage.removeItem(
              'medbuy_user'
            );
          }
        }

        // ------------------------------------------------------
        // No logged-in user
        // Show role selection
        // ------------------------------------------------------

        setShowRoleSelection(true);

      } catch (error) {
        console.log(
          'Session check error:',
          error
        );

        // If AsyncStorage fails, don't leave the
        // user stuck on the splash screen.
        setShowRoleSelection(true);
      }
    };

    startApp();

    return () => {
      mounted = false;
    };
  }, [opacity, scale]);

  /* ============================================================
     ROLE SELECTION SCREEN
  ============================================================ */

  if (showRoleSelection) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.roleContent}>

          {/* ==================================================
              HEADER
          ================================================== */}

          <Text style={styles.roleTitle}>
            Choose your role
          </Text>

          <Text style={styles.roleSubtitle}>
            Select how you want to use the MedBuy
            Partner App
          </Text>

          {/* ==================================================
              PHARMACY STORE
          ================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              pressed &&
              styles.roleCardPressed,
            ]}
            onPress={() =>
              router.push(
                '/pharmacy-side/login'
              )
            }
          >
            <View style={styles.iconContainer}>
              <FirstAid
                size={24}
                color="#9A4B23"
                weight="regular"
              />
            </View>

            <View style={styles.roleText}>
              <Text style={styles.cardTitle}>
                Pharmacy Store
              </Text>

              <Text
                style={styles.cardDescription}
              >
                Receive and manage medicine
                orders from customers
              </Text>
            </View>

            <CaretRight
              size={24}
              color="#6B615A"
              weight="regular"
            />
          </Pressable>

          {/* ==================================================
              DELIVERY AGENT
          ================================================== */}

          <Pressable
            style={({ pressed }) => [
              styles.roleCard,
              pressed &&
              styles.roleCardPressed,
            ]}
            onPress={() =>
              router.push(
                '/delivery-side/delivery-login'
              )
            }
          >
            <View style={styles.iconContainer}>
              <Motorcycle
                size={24}
                color="#9A4B23"
                weight="regular"
              />
            </View>

            <View style={styles.roleText}>
              <Text style={styles.cardTitle}>
                Delivery Agent
              </Text>

              <Text
                style={styles.cardDescription}
              >
                Accept assignments and deliver
                orders to customers
              </Text>
            </View>

            <CaretRight
              size={24}
              color="#6B615A"
              weight="regular"
            />
          </Pressable>

        </View>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <Text style={styles.footer}>
          MedBuy Partner App
        </Text>
      </View>
    );
  }

  /* ============================================================
     SPLASH SCREEN
  ============================================================ */

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Animated.View
        style={[
          styles.splashContent,
          {
            opacity,
            transform: [
              {
                scale,
              },
            ],
          },
        ]}
      >

        {/* ==================================================
            MEDBUY LOGO
        ================================================== */}

        <View style={styles.logo}>
          <View style={styles.logoVertical} />
          <View style={styles.logoHorizontal} />
        </View>

        {/* ==================================================
            BRAND
        ================================================== */}

        <Text style={styles.brand}>
          MedBuy
        </Text>

        {/* ==================================================
            PARTNER LABEL
        ================================================== */}

        <Text style={styles.partner}>
          PARTNER APP
        </Text>

        {/* ==================================================
            TAGLINE
        ================================================== */}

        <Text style={styles.tagline}>
          Pharmacy & Delivery Partner
        </Text>

      </Animated.View>

      {/* ======================================================
          BOTTOM LABEL
      ====================================================== */}

      <Text style={styles.bottomText}>
        Partner App
      </Text>
    </View>
  );
}

/* ==============================================================
   STYLES
============================================================== */

const styles = StyleSheet.create({

  /* ============================================================
     COMMON
  ============================================================ */

  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },

  /* ============================================================
     SPLASH
  ============================================================ */

  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: '#9A4B23',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  logoVertical: {
    position: 'absolute',
    width: 18,
    height: 52,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  logoHorizontal: {
    position: 'absolute',
    width: 52,
    height: 18,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  brand: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: '#1A1512',
    letterSpacing: -0.6,
  },

  partner: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    letterSpacing: 1.8,
    color: '#9A4B23',
  },

  tagline: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: '#5C534C',
  },

  bottomText: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: '#6B615A',
  },

  /* ============================================================
     ROLE SELECTION
  ============================================================ */

  roleContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  roleTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: '#1A1512',
  },

  roleSubtitle: {
    marginTop: 8,
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: '#5C534C',
  },

  roleCard: {
    minHeight: 128,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0D8CE',
    borderRadius: 14,
    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 16,
  },

  roleCardPressed: {
    backgroundColor: '#F6E6DC',
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F6E6DC',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 16,
  },

  roleText: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily:
      'IBMPlexSans_600SemiBold',
    color: '#1A1512',
  },

  cardDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily:
      'IBMPlexSans_400Regular',
    color: '#5C534C',
  },

  footer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
    fontFamily:
      'IBMPlexSans_500Medium',
    color: '#6B615A',
  },
});