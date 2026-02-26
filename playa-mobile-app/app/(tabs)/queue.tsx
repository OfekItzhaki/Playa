import { View, FlatList, RefreshControl, Alert } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useEventStore } from '../../stores/EventStore';
import EmptyState from '../../components/shared/EmptyState';
import ScheduledEventCard from '../../components/ScheduledEventCard';
import * as DeepLinkService from '../../services/DeepLinkService';

export default function Queue() {
  const { events, loadEvents, updateEvent, isLoading } = useEventStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const handleEdit = (eventId: string) => {
    const event = events[eventId];
    if (!event) return;

    Alert.prompt(
      'Edit Message',
      'Update the message content',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newMessage?: string) => {
            if (!newMessage || newMessage.length === 0) {
              Alert.alert('Error', 'Message cannot be empty');
              return;
            }
            if (newMessage.length > 500) {
              Alert.alert('Error', 'Message must be 500 characters or less');
              return;
            }
            try {
              await updateEvent(eventId, { message: newMessage });
              Alert.alert('Success', 'Message updated successfully');
            } catch (_error) {
              Alert.alert('Error', 'Failed to update message');
            }
          },
        },
      ],
      'plain-text',
      event.message
    );
  };

  const handleDelete = (eventId: string) => {
    Alert.alert(
      'Delete Message',
      'Delete this scheduled message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateEvent(eventId, { status: 'cancelled' });
              Alert.alert('Success', 'Message cancelled');
            } catch (_error) {
              Alert.alert('Error', 'Failed to cancel message');
            }
          },
        },
      ]
    );
  };

  const handleTrigger = async (eventId: string) => {
    const event = events[eventId];
    if (!event) return;

    try {
      const deepLink = DeepLinkService.constructDeepLink(event);
      const canOpen = await DeepLinkService.canOpenURL(deepLink);

      if (!canOpen) {
        Alert.alert(
          'App Not Installed',
          `Please install ${event.platform} to send this message.`
        );
        return;
      }

      await DeepLinkService.openDeepLink(deepLink);
      
      // Update event status
      await updateEvent(eventId, {
        status: 'sent',
        executedAt: new Date().toISOString(),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open message');
      console.error('Manual trigger failed:', error);
    }
  };

  const sortedEvents = useMemo(() => {
    return Object.values(events)
      .filter((e) => e.status === 'pending')
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [events]);

  if (sortedEvents.length === 0 && !isLoading) {
    return (
      <View className="flex-1 bg-white">
        <EmptyState
          icon="📅"
          title="No scheduled messages yet"
          description="Messages will appear here once you generate events"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4 pt-4">
            <ScheduledEventCard
              event={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTrigger={handleTrigger}
            />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
