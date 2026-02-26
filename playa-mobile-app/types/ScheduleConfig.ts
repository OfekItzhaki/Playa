export type ScheduleMode = 'random' | 'fixed';

export type ScheduleConfig =
  | {
      mode: 'random';
      frequency: number; // 1-10 messages per day
    }
  | {
      mode: 'fixed';
      fixedTimes: string[]; // Array of HH:mm format times
    };
