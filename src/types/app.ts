
/**
 * Core application types for Shift Savvy
 */

// Shift object structure
export interface Shift {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  officeEndTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  departureTime: string; // "HH:MM"
  daysApplied: WeekDay[];
  remindBeforeStart: number; // minutes
  remindAfterEnd: number; // minutes
  showPunch: boolean;
  breakMinutes: number;
  penaltyRoundingMinutes: number;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// Work day statuses 
export enum WorkStatus {
  PENDING = "PENDING", // Not started yet
  GO_WORK = "GO_WORK", // On the way to work
  WORKING = "WORKING", // Currently working
  COMPLETED = "COMPLETED", // Completed normally
  MISSING_LOGS = "MISSING_LOGS", // Missing check-in or check-out
  LATE = "LATE", // Late to work
  EARLY_LEAVE = "EARLY_LEAVE", // Left early
  LATE_EARLY = "LATE_EARLY", // Both late and left early
  ABSENT = "ABSENT", // Absent
  HOLIDAY = "HOLIDAY", // Holiday
  WEEKEND = "WEEKEND", // Weekend
  VACATION = "VACATION" // Vacation
}

// Days of the week type
export type WeekDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

// Attendance log types
export type LogType = "go_work" | "check_in" | "punch" | "check_out" | "complete";

// Attendance log structure
export interface AttendanceLog {
  type: LogType;
  time: string; // ISO timestamp
}

// Daily work status object structure
export interface DailyWorkStatus {
  date: string; // "YYYY-MM-DD"
  shiftId: string | null;
  shiftName: string | null;
  status: WorkStatus;
  remarks?: string;
  vaoLogTime?: string; // ISO timestamp for check_in
  raLogTime?: string; // ISO timestamp for check_out
  shiftStartTime?: string; // ISO timestamp
  shiftEndTime?: string; // ISO timestamp
  officeEndTime?: string; // ISO timestamp
  totalHours?: number;
  grossHours?: number;
  lateMinutes?: number;
  earlyMinutes?: number;
  penaltyMinutes?: number;
  otHours?: number;
  breakMinutesConfig?: number;
  logs?: AttendanceLog[];
  calculatedAt: string; // ISO timestamp
}

// Note object structure
export interface Note {
  id: string;
  title: string;
  content: string;
  reminderTime: string; // "HH:MM"
  associatedShiftIds: string[];
  explicitReminderDays: WeekDay[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// User settings structure
export interface UserSettings {
  language: "vi" | "en";
  theme: "light" | "dark";
  multiButtonMode: "full" | "simple";
  alarmSoundEnabled: boolean;
  alarmVibrationEnabled: boolean;
  weatherWarningEnabled: boolean;
  weatherLocation?: {
    lat?: number;
    lon?: number;
    city?: string;
  };
  changeShiftReminderMode: "ask_weekly" | "rotate" | "disabled";
  timeFormat?: "12h" | "24h";
  firstDayOfWeek: "Mon" | "Sun";
}

// Status for multi-function button
export enum ButtonStatus {
  GO_WORK = "GO_WORK",
  WAITING_CHECK_IN = "WAITING_CHECK_IN",
  CHECK_IN = "CHECK_IN", 
  WORKING = "WORKING",
  CHECK_OUT = "CHECK_OUT",
  READY_COMPLETE = "READY_COMPLETE",
  COMPLETE = "COMPLETE",
  COMPLETED = "COMPLETED"
}

// Weather alert types
export interface WeatherAlert {
  type: "rain" | "snow" | "extreme_heat" | "extreme_cold" | "storm" | "wind" | "other";
  time: string; // ISO timestamp
  description: string;
  suggestion: string;
  acknowledged: boolean;
}
