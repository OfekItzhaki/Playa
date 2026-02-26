import * as Notifications from 'expo-notifications';
import { ScheduledEvent, Recipient } from '../types';

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function checkPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export async function scheduleNotification(
  event: ScheduledEvent,
  recipient: Recipient
): Promise<string> {
  const messagePreview = 
    event.message.length > 100
      ? `${event.message.substring(0, 100)}...`
      : event.message;

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `Message for ${recipient.name}`,
      body: messagePreview,
      data: {
        eventId: event.id,
        recipientId: event.recipientId,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(event.scheduledTime),
    },
  });

  return notificationId;
}

export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function updateNotification(
  notificationId: string,
  event: ScheduledEvent,
  recipient: Recipient
): Promise<void> {
  await cancelNotification(notificationId);
  await scheduleNotification(event, recipient);
}

export async function scheduleNotifications(
  events: ScheduledEvent[],
  recipients: Record<string, Recipient>
): Promise<Map<string, string>> {
  const notificationMap = new Map<string, string>();

  for (const event of events) {
    const recipient = recipients[event.recipientId];
    if (!recipient) continue;

    try {
      const notificationId = await scheduleNotification(event, recipient);
      notificationMap.set(event.id, notificationId);
    } catch (error) {
      console.error(`Failed to schedule notification for event ${event.id}:`, error);
    }
  }

  return notificationMap;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
