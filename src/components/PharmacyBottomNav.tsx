import { useRouter } from 'expo-router';
import {
  Clock,
  House,
  Receipt,
  User,
} from 'phosphor-react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  primary: '#9A4B23',
  activeBackground: '#F6E6DC',
  textSecondary: '#6B615A',
  surface: '#FFFFFF',
  border: '#E0D8CE',
};

type ActiveTab = 'home' | 'orders' | 'history' | 'profile';

type Props = {
  activeTab: ActiveTab;
};

export default function PharmacyBottomNav({ activeTab }: Props) {
  const router = useRouter();

  const tabs = [
    {
      key: 'home' as const,
      label: 'Home',
      icon: House,
      route: '/pharmacy-side/home',
    },
    {
      key: 'orders' as const,
      label: 'Orders',
      icon: Receipt,
      route: '/pharmacy-side/orders',
    },
    {
      key: 'history' as const,
      label: 'History',
      icon: Clock,
      route: '/pharmacy-side/history',
    },
    {
      key: 'profile' as const,
      label: 'Profile',
      icon: User,
      route: '/pharmacy-side/profile',
    },
  ];

  const handlePress = (route: string) => {
    router.replace(route as any);
  };

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            style={styles.navItem}
            onPress={() => handlePress(tab.route)}
          >
            <View
              style={[
                styles.iconWrapper,
                isActive && styles.iconWrapperActive,
              ]}
            >
              <Icon
                size={30}
                weight="regular"
                color={
                  isActive
                    ? COLORS.primary
                    : COLORS.textSecondary
                }
              />
            </View>

            <Text
              style={[
                styles.navText,
                isActive && styles.navTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    height: 76,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,

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

  iconWrapper: {
    width: 36,
    height: 30,
    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapperActive: {
    backgroundColor: COLORS.activeBackground,
  },

  navText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  navTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});