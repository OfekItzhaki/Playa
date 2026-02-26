import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as NotificationService from '../services/NotificationService';
import * as BackgroundTaskService from '../services/BackgroundTaskService';
import * as DeepLinkService from '../services/DeepLinkService';
import * as StorageService from '../services/StorageService';
import OnboardingModal from '../components/OnboardingModal';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export default function RootLayout() {
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Check if onboarding completed
      const hasCompleted = await StorageService.getMetadata(ONBOARDING_KEY);
      if (!hasCompleted) {
        setShowOnboarding(true);
      }

      // Request notification permissions
      const hasPermissions = await NotificationService.checkPermissions();
      
      if (!hasPermissions) {
        const granted = await NotificationService.requestPermissions();
        
        if (!granted) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in Settings to receive message reminders.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => Linking.openSettings() 
              },
            ]
          );
        }
      }

      // Register background task
      await BackgroundTaskService.registerBackgroundTask();
      
      // Check and generate events if needed
      await BackgroundTaskService.checkAndGenerateIfNeeded();
      
      setPermissionsChecked(true);
    };

    initializeApp();

    // Set up notification response listener
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const { eventId } = response.notification.request.content.data as { eventId: string };
        
        try {
          const event = await StorageService.getEvent(eventId);
          
          if (!event) {
            Alert.alert('Error', 'Event not found');
            return;
          }

          const deepLink = DeepLinkService.constructDeepLink(event);
          const canOpen = await DeepLinkService.canOpenURL(deepLink);

          if (!canOpen) {
            Alert.alert(
              'App Not Installed',
              `Please install ${event.platform} to send this message.`,
              [
                { text: 'OK', style: 'cancel' },
              ]
            );
            return;
          }

          await DeepLinkService.openDeepLink(deepLink);
          
          // Update event status
          const updatedEvent = {
            ...event,
            status: 'sent' as const,
            executedAt: new Date().toISOString(),
          };
          await StorageService.saveEvent(updatedEvent);
        } catch (error) {
          console.error('Failed to handle notification response:', error);
          Alert.alert('Error', 'Failed to open message');
        }
      }
    );

    return () => subscription.remove();
  }, []);

  const handleOnboardingComplete = async () => {
    await StorageService.setMetadata(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  if (!permissionsChecked) {
    return null;
  }

  const modalPresentation = Platform.OS === 'ios' ? 'modal' : 'card';

  return (
    <SafeAreaProvider>
      <OnboardingModal visible={showOnboarding} onComplete={handleOnboardingComplete} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modals/add-recipient" options={{ presentation: modalPresentation, title: 'Add Contact' }} />
        <Stack.Screen name="modals/edit-recipient" options={{ presentation: modalPresentation, title: 'Edit Contact' }} />
        <Stack.Screen name="modals/clone-selector" options={{ presentation: modalPresentation, title: 'Import From' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
