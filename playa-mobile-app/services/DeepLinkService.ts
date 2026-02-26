import { Linking } from 'react-native';
import { ScheduledEvent } from '../types';

const MAX_URL_LENGTH = 2048;

export function constructDeepLink(event: ScheduledEvent): string {
  const { platform, identifier, message } = event;
  const encodedMessage = encodeURIComponent(message);

  let url: string;

  switch (platform) {
    case 'whatsapp':
      url = `whatsapp://send?phone=${identifier}&text=${encodedMessage}`;
      break;
    case 'sms':
      url = `sms:${identifier}?body=${encodedMessage}`;
      break;
    case 'instagram':
      url = `instagram://user?username=${identifier}`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  if (url.length > MAX_URL_LENGTH) {
    throw new Error(`URL exceeds maximum length of ${MAX_URL_LENGTH} characters`);
  }

  return url;
}

export function validateDeepLink(url: string): boolean {
  if (url.length > MAX_URL_LENGTH) {
    return false;
  }

  const validPatterns = [
    /^whatsapp:\/\/send\?phone=.+&text=.+$/,
    /^sms:.+\?body=.+$/,
    /^instagram:\/\/user\?username=.+$/,
  ];

  return validPatterns.some((pattern) => pattern.test(url));
}

export async function canOpenURL(url: string): Promise<boolean> {
  try {
    return await Linking.canOpenURL(url);
  } catch (_error) {
    return false;
  }
}

export async function openDeepLink(url: string): Promise<void> {
  const canOpen = await canOpenURL(url);
  
  if (!canOpen) {
    throw new Error('Cannot open URL - app not installed or URL invalid');
  }

  await Linking.openURL(url);
}
