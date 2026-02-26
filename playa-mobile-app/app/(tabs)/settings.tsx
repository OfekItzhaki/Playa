import { View, Text, ScrollView, Alert, Share } from 'react-native';
import { useState } from 'react';
import Button from '../../components/shared/Button';
import * as StorageService from '../../services/StorageService';

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await StorageService.exportData();
      
      Alert.alert(
        'Export Data',
        'Exported file contains sensitive data. Store securely.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share',
            onPress: async () => {
              try {
                await Share.share({
                  message: data,
                  title: 'Playa Data Export',
                });
              } catch (_error) {
                Alert.alert('Error', 'Failed to share data');
              }
            },
          },
        ]
      );
    } catch (_error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = () => {
    setIsImporting(true);
    Alert.alert(
      'Import Data',
      'This feature requires file picker implementation. Coming soon!',
      [{ text: 'OK', onPress: () => setIsImporting(false) }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all contacts and scheduled messages. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data cleared');
            } catch (_error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Settings</Text>

        {/* Data Management Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Data Management
          </Text>
          
          <View className="space-y-3">
            <Button
              title="Export Data"
              onPress={handleExport}
              loading={isExporting}
              disabled={isExporting}
              variant="secondary"
            />
            
            <Button
              title="Import Data"
              onPress={handleImport}
              loading={isImporting}
              disabled={isImporting}
              variant="secondary"
            />
            
            <Button
              title="Clear All Data"
              onPress={handleClearData}
              variant="danger"
            />
          </View>
        </View>

        {/* App Info Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            About
          </Text>
          <Text className="text-gray-600">Playa v1.0.0</Text>
          <Text className="text-gray-500 mt-2">
            Stay connected with the people who matter
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
