import { View, Text, Modal } from 'react-native';
import { useState } from 'react';
import Button from './shared/Button';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

const ONBOARDING_SCREENS = [
  {
    emoji: '👋',
    title: 'Welcome to Playa',
    description: 'Stay connected with the people who matter through scheduled messaging reminders.',
  },
  {
    emoji: '📱',
    title: 'Add Your Contacts',
    description: 'Create contacts for WhatsApp, SMS, or Instagram. Set up their schedule and message templates.',
  },
  {
    emoji: '⏰',
    title: 'Schedule Messages',
    description: 'Choose random frequency or fixed times. Messages are generated daily and sent as notifications.',
  },
  {
    emoji: '🔔',
    title: 'Tap to Send',
    description: 'When you receive a notification, tap it to open the messaging app with your message pre-filled.',
  },
];

export default function OnboardingModal({ visible, onComplete }: OnboardingModalProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < ONBOARDING_SCREENS.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const screen = ONBOARDING_SCREENS[currentScreen];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-8xl mb-8">{screen.emoji}</Text>
        
        <Text className="text-3xl font-bold text-gray-900 mb-4 text-center">
          {screen.title}
        </Text>
        
        <Text className="text-lg text-gray-600 text-center mb-12 px-4">
          {screen.description}
        </Text>

        {/* Progress Dots */}
        <View className="flex-row mb-8">
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentScreen ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="w-full space-y-3">
          <Button
            title={currentScreen === ONBOARDING_SCREENS.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
          />
          
          {currentScreen < ONBOARDING_SCREENS.length - 1 && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="secondary"
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
