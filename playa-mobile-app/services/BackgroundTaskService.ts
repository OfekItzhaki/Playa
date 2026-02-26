import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Recipient } from '../types';
import * as SchedulingService from './SchedulingService';
import * as StorageService from './StorageService';
import * as NotificationService from './NotificationService';

const DAILY_GENERATION_TASK = 'DAILY_EVENT_GENERATION';

TaskManager.defineTask(DAILY_GENERATION_TASK, async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastGeneration = await StorageService.getLastGenerationDate();

    if (lastGeneration === today) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const events = await SchedulingService.generateDailyEvents(today);
    
    // Schedule notifications for events
    const recipients = await StorageService.getAllRecipients();
    const recipientsMap: Record<string, Recipient> = {};
    recipients.forEach((r) => {
      recipientsMap[r.id] = r;
    });
    
    const notificationMap = await NotificationService.scheduleNotifications(events, recipientsMap);
    
    // Update events with notification IDs
    const eventsWithNotifications = events.map((event) => ({
      ...event,
      notificationId: notificationMap.get(event.id),
    }));
    
    await StorageService.saveEvents(eventsWithNotifications);
    await StorageService.setLastGenerationDate(today);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Daily generation task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundTask(): Promise<void> {
  try {
    await BackgroundFetch.registerTaskAsync(DAILY_GENERATION_TASK, {
      minimumInterval: 24 * 60 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
}

export async function unregisterBackgroundTask(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(DAILY_GENERATION_TASK);
  } catch (error) {
    console.error('Failed to unregister background task:', error);
  }
}

export async function checkAndGenerateIfNeeded(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastGeneration = await StorageService.getLastGenerationDate();

    if (lastGeneration !== today) {
      const events = await SchedulingService.generateDailyEvents(today);
      
      // Schedule notifications for events
      const recipients = await StorageService.getAllRecipients();
      const recipientsMap: Record<string, Recipient> = {};
      recipients.forEach((r) => {
        recipientsMap[r.id] = r;
      });
      
      const notificationMap = await NotificationService.scheduleNotifications(events, recipientsMap);
      
      // Update events with notification IDs
      const eventsWithNotifications = events.map((event) => ({
        ...event,
        notificationId: notificationMap.get(event.id),
      }));
      
      await StorageService.saveEvents(eventsWithNotifications);
      await StorageService.setLastGenerationDate(today);
    }
  } catch (error) {
    console.error('Fallback generation failed:', error);
  }
}
