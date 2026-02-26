import { View, Text, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useRecipientStore } from '../../stores/RecipientStore';
import RecipientCard from '../../components/RecipientCard';
import EmptyState from '../../components/shared/EmptyState';

export default function Dashboard() {
  const router = useRouter();
  const { recipients, loadRecipients, deleteRecipient, isLoading } = useRecipientStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecipients();
    setRefreshing(false);
  };

  const handleEdit = (id: string) => {
    router.push(`/modals/edit-recipient?id=${id}`);
  };

  const handleDelete = (id: string) => {
    const recipient = recipients[id];
    Alert.alert(
      'Delete Contact',
      `Delete ${recipient.name}? This will also delete all scheduled messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipient(id);
          },
        },
      ]
    );
  };

  const handleClone = (id: string) => {
    router.push(`/modals/add-recipient?cloneFrom=${id}`);
  };

  const recipientList = Object.values(recipients);

  return (
    <View className="flex-1 bg-gray-50">
      {recipientList.length === 0 && !isLoading ? (
        <EmptyState
          icon="👋"
          title="No contacts yet"
          description="Tap + to add your first contact"
        />
      ) : (
        <FlatList
          data={recipientList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipientCard
              recipient={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClone={handleClone}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
        onPress={() => router.push('/modals/add-recipient')}
        accessibilityLabel="Add new contact"
        accessibilityRole="button"
      >
        <Text className="text-white text-3xl">+</Text>
      </TouchableOpacity>
    </View>
  );
}
