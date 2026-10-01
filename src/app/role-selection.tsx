import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function RoleSelection() {
  const openPharmacyLogin = () => {
    router.replace('/pharmacy-side/login');
  };

  const openDeliveryLogin = () => {
    router.replace('/delivery-side/delivery-login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>
          Choose your role
        </Text>

        <Text style={styles.subtitle}>
          Select how you want to use the MedBuy Partner App
        </Text>

        {/* Pharmacy Store */}
        <Pressable
          onPress={openPharmacyLogin}
          style={({ pressed }) => [
            styles.roleCard,
            pressed && styles.roleCardPressed,
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>✚</Text>
          </View>

          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>
              Pharmacy Store
            </Text>

            <Text style={styles.roleDescription}>
              Receive and manage medicine orders from customers
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* Delivery Agent */}
        <Pressable
          onPress={openDeliveryLogin}
          style={({ pressed }) => [
            styles.roleCard,
            pressed && styles.roleCardPressed,
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>→</Text>
          </View>

          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>
              Delivery Agent
            </Text>

            <Text style={styles.roleDescription}>
              Accept assignments and deliver orders to customers
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        You can change your role later from Profile
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F4',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '600',
    color: '#1A1512',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#5C534C',
    marginBottom: 32,
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
    transform: [{ scale: 0.98 }],
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

  icon: {
    fontSize: 28,
    fontWeight: '600',
    color: '#9A4B23',
  },

  roleTextContainer: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#1A1512',
  },

  roleDescription: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#5C534C',
  },

  arrow: {
    fontSize: 32,
    fontWeight: '300',
    color: '#6B615A',
    marginLeft: 8,
  },

  footer: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,

    textAlign: 'center',

    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B615A',
  },
});