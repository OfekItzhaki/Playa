import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { ScheduleConfig } from '../types';

interface ScheduleConfigEditorProps {
  config: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  error?: string;
}

export default function ScheduleConfigEditor({ config, onChange, error }: ScheduleConfigEditorProps) {
  const [mode, setMode] = useState<'random' | 'fixed'>(config.mode);

  const handleModeChange = (newMode: 'random' | 'fixed') => {
    setMode(newMode);
    if (newMode === 'random') {
      onChange({ mode: 'random', frequency: 3 });
    } else {
      onChange({ mode: 'fixed', fixedTimes: ['09:00'] });
    }
  };

  const handleFrequencyChange = (value: string) => {
    const frequency = parseInt(value) || 1;
    const clampedFrequency = Math.max(1, Math.min(10, frequency));
    onChange({ mode: 'random', frequency: clampedFrequency });
  };

  const handleAddTime = () => {
    if (config.mode === 'fixed') {
      const newTimes = [...(config.fixedTimes || []), '12:00'];
      onChange({ mode: 'fixed', fixedTimes: newTimes });
    }
  };

  const handleRemoveTime = (index: number) => {
    if (config.mode === 'fixed' && config.fixedTimes) {
      const newTimes = config.fixedTimes.filter((_, i) => i !== index);
      onChange({ mode: 'fixed', fixedTimes: newTimes });
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    if (config.mode === 'fixed' && config.fixedTimes) {
      const newTimes = [...config.fixedTimes];
      newTimes[index] = value;
      onChange({ mode: 'fixed', fixedTimes: newTimes });
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-2">Schedule Mode</Text>

      {/* Mode Toggle */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-l-lg border ${
            mode === 'random'
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-gray-300'
          }`}
          onPress={() => handleModeChange('random')}
          accessibilityLabel="Random schedule mode"
          accessibilityState={{ selected: mode === 'random' }}
        >
          <Text
            className={`text-center font-medium ${
              mode === 'random' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Random
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 rounded-r-lg border ${
            mode === 'fixed'
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-gray-300'
          }`}
          onPress={() => handleModeChange('fixed')}
          accessibilityLabel="Fixed schedule mode"
          accessibilityState={{ selected: mode === 'fixed' }}
        >
          <Text
            className={`text-center font-medium ${
              mode === 'fixed' ? 'text-white' : 'text-gray-700'
            }`}
          >
            Fixed Times
          </Text>
        </TouchableOpacity>
      </View>

      {/* Random Mode - Frequency Slider */}
      {mode === 'random' && (
        <View>
          <Text className="text-sm text-gray-600 mb-2">Messages per day</Text>
          <View className="flex-row items-center">
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-2 text-center w-20"
              keyboardType="number-pad"
              value={config.mode === 'random' ? config.frequency.toString() : '3'}
              onChangeText={handleFrequencyChange}
              maxLength={2}
              accessibilityLabel="Frequency per day"
            />
            <Text className="ml-3 text-gray-600">
              (1-10 messages)
            </Text>
          </View>
        </View>
      )}

      {/* Fixed Mode - Time Picker List */}
      {mode === 'fixed' && (
        <View>
          <Text className="text-sm text-gray-600 mb-2">Specific times (HH:MM)</Text>
          {config.mode === 'fixed' && config.fixedTimes?.map((time, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                value={time}
                onChangeText={(value) => handleTimeChange(index, value)}
                placeholder="09:00"
                maxLength={5}
                accessibilityLabel={`Time ${index + 1}`}
              />
              {config.fixedTimes && config.fixedTimes.length > 1 && (
                <TouchableOpacity
                  className="ml-2 w-10 h-10 bg-red-100 rounded-lg items-center justify-center"
                  onPress={() => handleRemoveTime(index)}
                  accessibilityLabel={`Remove time ${index + 1}`}
                >
                  <Text className="text-red-600 text-xl">×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            className="py-2 px-4 bg-gray-100 rounded-lg items-center"
            onPress={handleAddTime}
            accessibilityLabel="Add another time"
          >
            <Text className="text-gray-700">+ Add Time</Text>
          </TouchableOpacity>
        </View>
      )}

      {error && (
        <Text className="text-sm text-red-600 mt-2" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}
