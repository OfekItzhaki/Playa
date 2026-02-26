import { z } from 'zod';
import { RecipientFormData, RecipientFormErrors } from '../types';

// Phone number validation (E.164 format)
const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code (e.g., +1234567890)');

// Instagram username validation
const instagramUsernameSchema = z
  .string()
  .regex(
    /^[a-zA-Z0-9._]{1,30}$/,
    'Instagram username can only contain letters, numbers, underscores, and periods'
  );

// Message template validation
const messageSchema = z.string().min(1, 'Message cannot be empty').max(500, 'Message must be 500 characters or less');

// Schedule config validation
const scheduleConfigSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('random'),
    frequency: z.number().int().min(1, 'Frequency must be at least 1').max(10, 'Frequency must be at most 10'),
  }),
  z.object({
    mode: z.literal('fixed'),
    fixedTimes: z
      .array(z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'))
      .min(1, 'Please select at least one time for fixed schedule'),
  }),
]);

// Recipient validation schema
const recipientSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').trim(),
    platform: z.enum(['whatsapp', 'sms', 'instagram']),
    identifier: z.string(),
    scheduleConfig: scheduleConfigSchema,
    messagePool: z
      .array(messageSchema)
      .min(1, 'At least one message template is required')
      .max(100, 'Maximum 100 message templates allowed'),
  })
  .refine(
    (data) => {
      if (data.platform === 'instagram') {
        return instagramUsernameSchema.safeParse(data.identifier).success;
      } else {
        return phoneSchema.safeParse(data.identifier).success;
      }
    },
    {
      message: 'Invalid identifier for selected platform',
      path: ['identifier'],
    }
  );

export function validateRecipient(
  data: unknown
): { data?: RecipientFormData; errors?: RecipientFormErrors } {
  const result = recipientSchema.safeParse(data);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name?.[0],
        identifier: fieldErrors.identifier?.[0],
        scheduleConfig: fieldErrors.scheduleConfig?.[0],
        messagePool: fieldErrors.messagePool?.[0],
      },
    };
  }

  return { data: result.data };
}

export function validatePhoneNumber(phone: string): { success: boolean; error?: string } {
  const result = phoneSchema.safeParse(phone);
  if (result.success) {
    return { success: true };
  }
  const errorMessage = result.error.errors.length > 0 ? result.error.errors[0].message : 'Invalid phone number';
  return { success: false, error: errorMessage };
}

export function validateInstagramUsername(username: string): { success: boolean; error?: string } {
  const result = instagramUsernameSchema.safeParse(username);
  if (result.success) {
    return { success: true };
  }
  const errorMessage = result.error.errors.length > 0 ? result.error.errors[0].message : 'Invalid username';
  return { success: false, error: errorMessage };
}

export function validateMessage(message: string): { success: boolean; error?: string } {
  const result = messageSchema.safeParse(message);
  if (result.success) {
    return { success: true };
  }
  const errorMessage = result.error.errors.length > 0 ? result.error.errors[0].message : 'Invalid message';
  return { success: false, error: errorMessage };
}
