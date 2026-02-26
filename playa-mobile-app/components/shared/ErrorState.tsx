import { View, Text } from 'react-native';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-6xl mb-4">⚠️</Text>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {title}
      </Text>
      <Text className="text-gray-600 text-center mb-6">
        {message}
      </Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} />
      )}
    </View>
  );
}
