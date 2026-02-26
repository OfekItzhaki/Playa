import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useRecipientStore } from '../../stores/RecipientStore';
import { validateRecipient } from '../../services/ValidationService';
import { Platform, ScheduleConfig, RecipientFormData, RecipientFormErrors } from '../../types';
import Input from '../../components/shared/Input';
import Button from '../../components/shared/Button';
import ScheduleConfigEditor from '../../components/ScheduleConfigEditor';
import MessagePoolEditor from '../../components/MessagePoolEditor';

export default function AddRecipient() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addRecipient, recipients, isLoading } = useRecipientStore();

  const [formData, setFormData] = useState<RecipientFormData>({
    name: '',
    platform: 'whatsapp' as Platform,
    identifier: '',
    scheduleConfig: { mode: 'random', frequency: 3 } as ScheduleConfig,
    messagePool: [],
  });

  const [errors, setErrors] = useState<RecipientFormErrors>({});

  // Handle clone from existing recipient
  useEffect(() => {
    if (params.cloneFrom && typeof params.cloneFrom === 'string') {
      const sourceRecipient = recipients[params.cloneFrom];
      if (sourceRecipient) {
        const copyScheduleConfig = params.copyScheduleConfig === 'true';
        const copyMessagePool = params.copyMessagePool === 'true';

        setFormData((prev) => ({
          ...prev,
          scheduleConfig: copyScheduleConfig
            ? JSON.parse(JSON.stringify(sourceRecipient.scheduleConfig))
            : prev.scheduleConfig,
          messagePool: copyMessagePool ? [...sourceRecipient.messagePool] : prev.messagePool,
        }));

        // Show confirmation toast
        Alert.alert(
          'Configuration Imported',
          `Configuration imported from ${sourceRecipient.name}`
        );
      }
    }
  }, [params.cloneFrom, params.copyScheduleConfig, params.copyMessagePool]);

  const handleSubmit = async () => {
    // Validate
    const validation = validateRecipient(formData);
    
    if (validation.errors) {
      setErrors(validation.errors);
      return;
    }

    try {
      await addRecipient(formData);
      Alert.alert('Success', 'Contact created successfully');
      router.back();
    } catch (_error) {
      Alert.alert('Error', 'Failed to create contact. Please try again.');
    }
  };

  const platformOptions: Platform[] = ['whatsapp', 'sms', 'instagram'];

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        {/* Name Input */}
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) => {
            setFormData({ ...formData, name: text });
            setErrors({ ...errors, name: undefined });
          }}
          placeholder="Enter contact name"
          error={errors.name}
          required
        />

        {/* Platform Selection */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Platform <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row space-x-2">
            {platformOptions.map((platform) => (
              <TouchableOpacity
                key={platform}
                className={`flex-1 py-3 rounded-lg border ${
                  formData.platform === platform
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
                onPress={() => {
                  setFormData({ ...formData, platform, identifier: '' });
                  setErrors({ ...errors, identifier: undefined });
                }}
                accessibilityLabel={`Select ${platform}`}
                accessibilityState={{ selected: formData.platform === platform }}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    formData.platform === platform ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {platform}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Identifier Input */}
        <Input
          label={formData.platform === 'instagram' ? 'Instagram Username' : 'Phone Number'}
          value={formData.identifier}
          onChangeText={(text) => {
            setFormData({ ...formData, identifier: text });
            setErrors({ ...errors, identifier: undefined });
          }}
          placeholder={
            formData.platform === 'instagram' ? 'username' : '+1234567890'
          }
          keyboardType={formData.platform === 'instagram' ? 'default' : 'phone-pad'}
          error={errors.identifier}
          required
        />

        {/* Import from Contact Button */}
        <View className="mb-4">
          <Button
            title="Import from Contact..."
            onPress={() => router.push('/modals/clone-selector')}
            variant="secondary"
          />
        </View>

        {/* Schedule Configuration */}
        <ScheduleConfigEditor
          config={formData.scheduleConfig}
          onChange={(config) => {
            setFormData({ ...formData, scheduleConfig: config });
            setErrors({ ...errors, scheduleConfig: undefined });
          }}
          error={errors.scheduleConfig}
        />

        {/* Message Pool */}
        <MessagePoolEditor
          messages={formData.messagePool}
          onChange={(messages) => {
            setFormData({ ...formData, messagePool: messages });
            setErrors({ ...errors, messagePool: undefined });
          }}
          error={errors.messagePool}
        />

        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          <Button
            title="Create Contact"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
}
