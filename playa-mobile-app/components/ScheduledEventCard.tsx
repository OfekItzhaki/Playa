import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect, memo } from 'react';
import { ScheduledEvent } from '../types';

interface ScheduledEventCardProps {
  event: ScheduledEvent;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  onTrigger: (eventId: string) => void;
}

const PLATFORM_COLORS = {
  whatsapp: 'bg-green-100 border-green-500',
  sms: 'bg-blue-100 border-blue-500',
  instagram: 'bg-purple-100 border-purple-500',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

function ScheduledEventCard({
  event,
  onEdit,
  onDelete,
  onTrigger,
}: ScheduledEventCardProps) {
  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const scheduled = new Date(event.scheduledTime).getTime();
      const diff = scheduled - now;

      if (diff > 0 && diff <= 30 * 60 * 1000) {
        const minutes = Math.floor(diff / 60000);
        setCountdown(`in ${minutes} minute${minutes !== 1 ? 's' : ''}`);
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [event.scheduledTime]);

  const formatTime = (date: string) => {
    const now = new Date();
    const scheduled = new Date(date);
    const isToday = now.toDateString() === scheduled.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = tomorrow.toDateString() === scheduled.toDateString();

    const timeStr = scheduled.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) return `Today ${timeStr}`;
    if (isTomorrow) return `Tomorrow ${timeStr}`;
    return scheduled.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const platformColor = PLATFORM_COLORS[event.platform];
  const statusColor = STATUS_COLORS[event.status];

  return (
    <View
      className={`p-4 mb-3 rounded-lg border-l-4 ${platformColor}`}
      accessibilityLabel={`Scheduled message for ${event.recipientName}`}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">{event.recipientName}</Text>
          <Text className="text-sm text-gray-600 capitalize">{event.platform}</Text>
        </View>
        <View className={`px-2 py-1 rounded ${statusColor}`}>
          <Text className="text-xs font-medium capitalize">{event.status}</Text>
        </View>
      </View>

      {/* Time */}
      <View className="flex-row items-center mb-2">
        <Text className="text-sm font-medium text-gray-700">
          {formatTime(event.scheduledTime)}
        </Text>
        {countdown && (
          <Text className="text-sm text-orange-600 ml-2">({countdown})</Text>
        )}
      </View>

      {/* Message Preview */}
      <Text className="text-gray-700 mb-3" numberOfLines={3}>
        {event.message.length > 100
          ? `${event.message.substring(0, 100)}...`
          : event.message}
      </Text>

      {/* Action Buttons */}
      <View className="flex-row space-x-2">
        <TouchableOpacity
          className="flex-1 py-2 bg-blue-500 rounded"
          onPress={() => onTrigger(event.id)}
          accessibilityLabel="Send message now"
        >
          <Text className="text-white text-center font-medium">Send Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-4 py-2 bg-gray-200 rounded"
          onPress={() => onEdit(event.id)}
          accessibilityLabel="Edit message"
        >
          <Text className="text-gray-700 text-center">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="px-4 py-2 bg-red-100 rounded"
          onPress={() => onDelete(event.id)}
          accessibilityLabel="Delete message"
        >
          <Text className="text-red-600 text-center">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default memo(ScheduledEventCard);
