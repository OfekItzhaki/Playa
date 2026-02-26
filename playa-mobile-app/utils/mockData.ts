import { v4 as uuidv4 } from 'uuid';
import { Recipient } from '../types';

export const EXAMPLE_RECIPIENTS: Recipient[] = [
  {
    id: uuidv4(),
    name: 'Mom',
    platform: 'whatsapp',
    identifier: '+1234567890',
    scheduleConfig: {
      mode: 'random',
      frequency: 2,
    },
    messagePool: [
      'Hey Mom! Just checking in. How are you doing today?',
      'Thinking of you! Hope you\'re having a great day ❤️',
      'Love you Mom! Let me know if you need anything',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Best Friend',
    platform: 'sms',
    identifier: '+1987654321',
    scheduleConfig: {
      mode: 'fixed',
      fixedTimes: ['12:00', '18:00'],
    },
    messagePool: [
      'Hey! What are you up to?',
      'Wanna grab coffee sometime this week?',
      'Hope you\'re doing well! Miss you!',
      'Let\'s catch up soon!',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'College Buddy',
    platform: 'instagram',
    identifier: 'collegebuddy',
    scheduleConfig: {
      mode: 'random',
      frequency: 1,
    },
    messagePool: [
      'Hey! Saw your latest post, looks awesome!',
      'How have you been? We should catch up!',
      'Hope all is well with you!',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const EXAMPLE_MESSAGE_TEMPLATES = [
  'Hey! How are you doing?',
  'Just wanted to check in and see how you\'re doing',
  'Hope you\'re having a great day!',
  'Thinking of you! Let\'s catch up soon',
  'Miss you! How have you been?',
  'What have you been up to lately?',
  'Hope everything is going well!',
  'Let me know if you need anything',
  'Would love to hear from you!',
  'Sending good vibes your way! ✨',
];
