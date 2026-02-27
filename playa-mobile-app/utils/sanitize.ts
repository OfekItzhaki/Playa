export function sanitizeInput(input: string, maxLength?: number): string {
  // Remove leading/trailing whitespace
  let sanitized = input.trim();

  // Remove event handlers and dangerous attributes
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Escape HTML tags
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Enforce max length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

export function sanitizeRecipientName(name: string): string {
  return sanitizeInput(name);
}

export function sanitizeMessage(message: string): string {
  return message.trim();
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.trim().replace(/\s+/g, '');
}

export function sanitizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
