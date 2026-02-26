import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = '📭', title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-xl font-semibold text-gray-800 text-center mb-2">{title}</Text>
      {description && (
        <Text className="text-base text-gray-600 text-center">{description}</Text>
      )}
    </View>
  );
}
