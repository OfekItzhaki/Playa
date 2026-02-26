import { View, Text, TouchableOpacity } from 'react-native';
import { Recipient } from '../types';

interface RecipientCardProps {
  recipient: Recipient;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClone: (id: string) => void;
}

export default function RecipientCard({ recipient, onEdit, onDelete, onClone }: RecipientCardProps) {
  const platformColors = {
    whatsapp: 'bg-green-100 text-green-800',
    sms: 'bg-blue-100 text-blue-800',
    instagram: 'bg-pink-100 text-pink-800',
  };

  const scheduleText = recipient.scheduleConfig.mode === 'random'
    ? `Random: ${recipient.scheduleConfig.frequency}/day`
    : `Fixed: ${recipient.scheduleConfig.fixedTimes?.join(', ')}`;

  return (
    <View 
      className="bg-white p-4 mb-2 mx-4 rounded-lg shadow-sm border border-gray-200"
      accessibilityLabel={`Contact card for ${recipient.name}`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{recipient.name}</Text>
          <Text className="text-sm text-gray-600 mt-1">{recipient.identifier}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${platformColors[recipient.platform]}`}>
          <Text className="text-xs font-medium capitalize">{recipient.platform}</Text>
        </View>
      </View>

      {/* Schedule Info */}
      <View className="mb-3">
        <Text className="text-sm text-gray-700">{scheduleText}</Text>
        <Text className="text-sm text-gray-500 mt-1">
          {recipient.messagePool.length} message{recipient.messagePool.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          className="px-4 py-2 bg-gray-100 rounded-md"
          onPress={() => onClone(recipient.id)}
          accessibilityLabel="Clone recipient configuration"
          accessibilityHint="Copy schedule and messages to a new contact"
        >
          <Text className="text-sm text-gray-700">Clone</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="px-4 py-2 bg-blue-100 rounded-md"
          onPress={() => onEdit(recipient.id)}
          accessibilityLabel="Edit recipient"
          accessibilityHint="Modify contact details and settings"
        >
          <Text className="text-sm text-blue-700">Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="px-4 py-2 bg-red-100 rounded-md"
          onPress={() => onDelete(recipient.id)}
          accessibilityLabel="Delete recipient"
          accessibilityHint="Remove this contact permanently"
        >
          <Text className="text-sm text-red-700">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
