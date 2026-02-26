import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useRecipientStore } from '../../stores/RecipientStore';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';

interface CloneOptions {
  copyScheduleConfig: boolean;
  copyMessagePool: boolean;
}

export default function CloneSelector() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { recipients } = useRecipientStore();
  
  const currentRecipientId = typeof params.currentId === 'string' ? params.currentId : undefined;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [options, setOptions] = useState<CloneOptions>({
    copyScheduleConfig: true,
    copyMessagePool: true,
  });

  const availableRecipients = Object.values(recipients).filter(
    (r) => r.id !== currentRecipientId
  );

  const handleSelect = () => {
    if (!selectedId) return;
    
    // Navigate back with clone parameters
    router.back();
    router.push({
      pathname: '/modals/add-recipient',
      params: {
        cloneFrom: selectedId,
        copyScheduleConfig: options.copyScheduleConfig.toString(),
        copyMessagePool: options.copyMessagePool.toString(),
      },
    });
  };

  return (
    <Modal visible onClose={() => router.back()} title="Clone from Contact">
      <ScrollView className="flex-1">
        {availableRecipients.length === 0 ? (
          <View className="p-4">
            <Text className="text-gray-500 text-center">
              No contacts available to clone from
            </Text>
          </View>
        ) : (
          <>
            {/* Recipient List */}
            <View className="mb-4">
              {availableRecipients.map((recipient) => (
                <TouchableOpacity
                  key={recipient.id}
                  className={`p-4 border-b border-gray-200 ${
                    selectedId === recipient.id ? 'bg-blue-50' : 'bg-white'
                  }`}
                  onPress={() => setSelectedId(recipient.id)}
                  accessibilityLabel={`Select ${recipient.name}`}
                  accessibilityState={{ selected: selectedId === recipient.id }}
                >
                  <Text className="font-medium text-gray-900">{recipient.name}</Text>
                  <Text className="text-sm text-gray-500 capitalize mt-1">
                    {recipient.platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clone Options */}
            {selectedId && (
              <View className="px-4 mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-3">
                  What to copy:
                </Text>
                
                <TouchableOpacity
                  className="flex-row items-center mb-3"
                  onPress={() =>
                    setOptions({ ...options, copyScheduleConfig: !options.copyScheduleConfig })
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: options.copyScheduleConfig }}
                >
                  <View
                    className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                      options.copyScheduleConfig
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {options.copyScheduleConfig && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700">Copy schedule configuration</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() =>
                    setOptions({ ...options, copyMessagePool: !options.copyMessagePool })
                  }
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: options.copyMessagePool }}
                >
                  <View
                    className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
                      options.copyMessagePool
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {options.copyMessagePool && (
                      <Text className="text-white text-xs">✓</Text>
                    )}
                  </View>
                  <Text className="text-gray-700">Copy message pool</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 border-t border-gray-200">
        <Button
          title="Select"
          onPress={handleSelect}
          disabled={!selectedId}
        />
        <View className="mt-2">
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
          />
        </View>
      </View>
    </Modal>
  );
}
