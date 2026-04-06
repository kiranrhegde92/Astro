import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../src/constants/theme';

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.deepSpace,
          borderTopColor: COLORS.cardBorder,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
          paddingBottom: 28,
        },
        tabBarActiveTintColor: COLORS.starGold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => <TabIcon emoji={'\u2B50'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <TabIcon emoji={'\u{1F30C}'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compatibility"
        options={{
          title: t('tabs.compatibility'),
          tabBarIcon: ({ color }) => <TabIcon emoji={'\u{1F496}'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.explore'),
          tabBarIcon: ({ color }) => <TabIcon emoji={'\u{1F52D}'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cosmos"
        options={{
          title: t('tabs.cosmos'),
          tabBarIcon: ({ color }) => <TabIcon emoji={'\u{1F30D}'} color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 22, opacity: color === COLORS.starGold ? 1 : 0.5 }}>{emoji}</Text>;
}
