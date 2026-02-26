import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Playa',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'Queue',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
