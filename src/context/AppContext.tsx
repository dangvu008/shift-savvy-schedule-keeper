
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, parse, addMinutes, isAfter, isBefore, isSameDay } from 'date-fns';
import { 
  UserSettings, 
  Shift, 
  Note, 
  AttendanceLog, 
  DailyWorkStatus,
  WorkStatus,
  ButtonStatus,
  WeatherAlert
} from '@/types/app';

// Initial state structure
interface AppState {
  userSettings: UserSettings;
  shifts: Shift[];
  activeShiftId: string | null;
  attendanceLogs: Record<string, AttendanceLog[]>;
  dailyWorkStatus: Record<string, DailyWorkStatus>;
  notes: Note[];
  currentButtonStatus: ButtonStatus;
  todayLogs: AttendanceLog[];
  weatherAlerts: WeatherAlert[];
  isLoading: boolean;
  lastAutoResetTime: string | null;
}

// Define action types
type AppAction =
  | { type: 'SET_USER_SETTINGS'; payload: UserSettings }
  | { type: 'ADD_SHIFT'; payload: Shift }
  | { type: 'UPDATE_SHIFT'; payload: Shift }
  | { type: 'DELETE_SHIFT'; payload: string }
  | { type: 'SET_ACTIVE_SHIFT'; payload: string | null }
  | { type: 'ADD_ATTENDANCE_LOG'; payload: { date: string; log: AttendanceLog } }
  | { type: 'UPDATE_DAILY_WORK_STATUS'; payload: { date: string; status: DailyWorkStatus } }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SET_BUTTON_STATUS'; payload: ButtonStatus }
  | { type: 'RESET_TODAY_LOGS' }
  | { type: 'ADD_WEATHER_ALERT'; payload: WeatherAlert }
  | { type: 'ACKNOWLEDGE_WEATHER_ALERT'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean }
  | { type: 'INIT_STATE'; payload: Partial<AppState> }
  | { type: 'RESET_STATE' }
  | { type: 'SET_LAST_AUTO_RESET_TIME'; payload: string };

// Default user settings
const defaultUserSettings: UserSettings = {
  language: 'vi',
  theme: 'dark',
  multiButtonMode: 'full',
  alarmSoundEnabled: true,
  alarmVibrationEnabled: true,
  weatherWarningEnabled: true,
  changeShiftReminderMode: 'disabled',
  firstDayOfWeek: 'Mon',
  timeFormat: '24h'
};

// Initial app state
const initialState: AppState = {
  userSettings: defaultUserSettings,
  shifts: [],
  activeShiftId: null,
  attendanceLogs: {},
  dailyWorkStatus: {},
  notes: [],
  currentButtonStatus: ButtonStatus.GO_WORK,
  todayLogs: [],
  weatherAlerts: [],
  isLoading: true,
  lastAutoResetTime: null
};

// App reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER_SETTINGS':
      return { ...state, userSettings: action.payload };
    case 'ADD_SHIFT':
      return { ...state, shifts: [...state.shifts, action.payload] };
    case 'UPDATE_SHIFT':
      return {
        ...state,
        shifts: state.shifts.map(shift => 
          shift.id === action.payload.id ? action.payload : shift
        )
      };
    case 'DELETE_SHIFT':
      return {
        ...state,
        shifts: state.shifts.filter(shift => shift.id !== action.payload),
        activeShiftId: state.activeShiftId === action.payload ? null : state.activeShiftId
      };
    case 'SET_ACTIVE_SHIFT':
      return { ...state, activeShiftId: action.payload };
    case 'ADD_ATTENDANCE_LOG': {
      const { date, log } = action.payload;
      const existingLogs = state.attendanceLogs[date] || [];
      const today = format(new Date(), 'yyyy-MM-dd');
      
      return {
        ...state,
        attendanceLogs: {
          ...state.attendanceLogs,
          [date]: [...existingLogs, log]
        },
        todayLogs: date === today ? [...state.todayLogs, log] : state.todayLogs
      };
    }
    case 'UPDATE_DAILY_WORK_STATUS': {
      const { date, status } = action.payload;
      return {
        ...state,
        dailyWorkStatus: {
          ...state.dailyWorkStatus,
          [date]: status
        }
      };
    }
    case 'ADD_NOTE':
      return { ...state, notes: [...state.notes, action.payload] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note => 
          note.id === action.payload.id ? action.payload : note
        )
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      };
    case 'SET_BUTTON_STATUS':
      return { ...state, currentButtonStatus: action.payload };
    case 'RESET_TODAY_LOGS': {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { [today]: _, ...restLogs } = state.attendanceLogs;
      
      return {
        ...state,
        attendanceLogs: restLogs,
        todayLogs: [],
        currentButtonStatus: ButtonStatus.GO_WORK
      };
    }
    case 'ADD_WEATHER_ALERT':
      return {
        ...state,
        weatherAlerts: [...state.weatherAlerts, action.payload]
      };
    case 'ACKNOWLEDGE_WEATHER_ALERT': {
      const alertTime = action.payload;
      return {
        ...state,
        weatherAlerts: state.weatherAlerts.map(alert => 
          alert.time === alertTime ? { ...alert, acknowledged: true } : alert
        )
      };
    }
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    case 'INIT_STATE':
      return { ...state, ...action.payload, isLoading: false };
    case 'RESET_STATE':
      return { ...initialState, isLoading: false };
    case 'SET_LAST_AUTO_RESET_TIME':
      return { ...state, lastAutoResetTime: action.payload };
    default:
      return state;
  }
};

// Create context
interface AppContextProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addShift: (shift: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShift: (shift: Shift) => void;
  deleteShift: (id: string) => void;
  setActiveShift: (id: string | null) => void;
  addAttendanceLog: (logType: AttendanceLog['type']) => void;
  calculateDailyStatus: (date: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  updateButtonStatus: (status: ButtonStatus) => void;
  resetTodayLogs: () => void;
  advanceButtonState: () => void;
  addWeatherAlert: (alert: Omit<WeatherAlert, 'acknowledged'>) => void;
  acknowledgeWeatherAlert: (time: string) => void;
  getCurrentShift: () => Shift | null;
  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  backupData: () => Promise<string>;
  restoreData: (backupData: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  USER_SETTINGS: 'userSettings',
  SHIFTS: 'shifts',
  ACTIVE_SHIFT_ID: 'activeShiftId',
  ATTENDANCE_LOGS: 'attendanceLogs',
  DAILY_WORK_STATUS: 'dailyWorkStatus',
  NOTES: 'notes',
  LAST_AUTO_RESET_TIME: 'lastAutoResetTime'
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on app start
  const loadData = async () => {
    try {
      dispatch({ type: 'SET_IS_LOADING', payload: true });
      
      const [
        userSettingsData,
        shiftsData,
        activeShiftIdData,
        attendanceLogsData,
        dailyWorkStatusData,
        notesData,
        lastAutoResetTimeData
      ] = [
        localStorage.getItem(STORAGE_KEYS.USER_SETTINGS),
        localStorage.getItem(STORAGE_KEYS.SHIFTS),
        localStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFT_ID),
        localStorage.getItem(STORAGE_KEYS.ATTENDANCE_LOGS),
        localStorage.getItem(STORAGE_KEYS.DAILY_WORK_STATUS),
        localStorage.getItem(STORAGE_KEYS.NOTES),
        localStorage.getItem(STORAGE_KEYS.LAST_AUTO_RESET_TIME)
      ];

      const newState: Partial<AppState> = {};

      if (userSettingsData) {
        newState.userSettings = { ...defaultUserSettings, ...JSON.parse(userSettingsData) };
      }
      
      if (shiftsData) {
        newState.shifts = JSON.parse(shiftsData);
      }
      
      if (activeShiftIdData) {
        newState.activeShiftId = JSON.parse(activeShiftIdData);
      }
      
      if (attendanceLogsData) {
        newState.attendanceLogs = JSON.parse(attendanceLogsData);
        
        // Set today's logs
        const today = format(new Date(), 'yyyy-MM-dd');
        newState.todayLogs = newState.attendanceLogs[today] || [];
      }
      
      if (dailyWorkStatusData) {
        newState.dailyWorkStatus = JSON.parse(dailyWorkStatusData);
      }
      
      if (notesData) {
        newState.notes = JSON.parse(notesData);
      }
      
      if (lastAutoResetTimeData) {
        newState.lastAutoResetTime = JSON.parse(lastAutoResetTimeData);
      }

      // Determine the current button status based on today's logs
      newState.currentButtonStatus = determineCurrentButtonStatus(newState.todayLogs || []);

      dispatch({ type: 'INIT_STATE', payload: newState });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  };

  // Save data to localStorage
  const saveData = async () => {
    try {
      const {
        userSettings,
        shifts,
        activeShiftId,
        attendanceLogs,
        dailyWorkStatus,
        notes,
        lastAutoResetTime
      } = state;

      localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(userSettings));
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SHIFT_ID, JSON.stringify(activeShiftId));
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE_LOGS, JSON.stringify(attendanceLogs));
      localStorage.setItem(STORAGE_KEYS.DAILY_WORK_STATUS, JSON.stringify(dailyWorkStatus));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      localStorage.setItem(STORAGE_KEYS.LAST_AUTO_RESET_TIME, JSON.stringify(lastAutoResetTime));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Backup data
  const backupData = async (): Promise<string> => {
    try {
      const { userSettings, shifts, activeShiftId, attendanceLogs, dailyWorkStatus, notes } = state;
      
      const backupObject = {
        userSettings,
        shifts,
        activeShiftId,
        attendanceLogs,
        dailyWorkStatus,
        notes,
        backupDate: new Date().toISOString()
      };
      
      return JSON.stringify(backupObject);
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup');
    }
  };

  // Restore data
  const restoreData = async (backupData: string): Promise<void> => {
    try {
      const parsedData = JSON.parse(backupData);
      
      // Validate required fields
      if (!parsedData.userSettings || !parsedData.shifts) {
        throw new Error('Invalid backup data');
      }
      
      dispatch({ type: 'INIT_STATE', payload: {
        userSettings: parsedData.userSettings,
        shifts: parsedData.shifts,
        activeShiftId: parsedData.activeShiftId,
        attendanceLogs: parsedData.attendanceLogs || {},
        dailyWorkStatus: parsedData.dailyWorkStatus || {},
        notes: parsedData.notes || [],
        currentButtonStatus: determineCurrentButtonStatus(
          getCurrentDayLogs(parsedData.attendanceLogs || {})
        )
      }});
      
      await saveData();
    } catch (error) {
      console.error('Error restoring data:', error);
      throw new Error('Failed to restore backup');
    }
  };

  // Reset all data
  const resetAllData = async (): Promise<void> => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      dispatch({ type: 'RESET_STATE' });
    } catch (error) {
      console.error('Error resetting data:', error);
      throw new Error('Failed to reset data');
    }
  };

  // Save data whenever state changes
  useEffect(() => {
    if (!state.isLoading) {
      saveData();
    }
  }, [state]);

  // Load data on initial load
  useEffect(() => {
    loadData();
  }, []);

  // Helper function to get current day logs
  const getCurrentDayLogs = (logs: Record<string, AttendanceLog[]>): AttendanceLog[] => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return logs[today] || [];
  };

  // Helper function to determine current button status based on logs
  const determineCurrentButtonStatus = (todayLogs: AttendanceLog[]): ButtonStatus => {
    if (todayLogs.length === 0) {
      return ButtonStatus.GO_WORK;
    }
    
    const logTypes = todayLogs.map(log => log.type);
    
    if (logTypes.includes('complete')) {
      return ButtonStatus.COMPLETED;
    }
    
    if (logTypes.includes('check_out')) {
      return ButtonStatus.READY_COMPLETE;
    }
    
    if (logTypes.includes('check_in')) {
      return ButtonStatus.WORKING;
    }
    
    if (logTypes.includes('go_work')) {
      return ButtonStatus.WAITING_CHECK_IN;
    }
    
    return ButtonStatus.GO_WORK;
  };

  // Helper to advance button state
  const advanceButtonState = () => {
    const { currentButtonStatus } = state;
    let nextStatus: ButtonStatus;
    
    switch (currentButtonStatus) {
      case ButtonStatus.GO_WORK:
        nextStatus = ButtonStatus.WAITING_CHECK_IN;
        addAttendanceLog('go_work');
        break;
      case ButtonStatus.WAITING_CHECK_IN:
      case ButtonStatus.CHECK_IN:
        nextStatus = ButtonStatus.WORKING;
        addAttendanceLog('check_in');
        break;
      case ButtonStatus.WORKING:
      case ButtonStatus.CHECK_OUT:
        nextStatus = ButtonStatus.READY_COMPLETE;
        addAttendanceLog('check_out');
        break;
      case ButtonStatus.READY_COMPLETE:
      case ButtonStatus.COMPLETE:
        nextStatus = ButtonStatus.COMPLETED;
        addAttendanceLog('complete');
        const today = format(new Date(), 'yyyy-MM-dd');
        calculateDailyStatus(today);
        break;
      default:
        nextStatus = currentButtonStatus;
    }
    
    dispatch({ type: 'SET_BUTTON_STATUS', payload: nextStatus });
  };

  // Add a new shift
  const addShift = (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newShift: Shift = {
      ...shiftData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    dispatch({ type: 'ADD_SHIFT', payload: newShift });
  };

  // Update an existing shift
  const updateShift = (shift: Shift) => {
    const updatedShift = {
      ...shift,
      updatedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'UPDATE_SHIFT', payload: updatedShift });
  };

  // Delete a shift
  const deleteShift = (id: string) => {
    dispatch({ type: 'DELETE_SHIFT', payload: id });
  };

  // Set active shift
  const setActiveShift = (id: string | null) => {
    dispatch({ type: 'SET_ACTIVE_SHIFT', payload: id });
  };

  // Add attendance log
  const addAttendanceLog = (logType: AttendanceLog['type']) => {
    const now = new Date();
    const todayFormatted = format(now, 'yyyy-MM-dd');
    
    const log: AttendanceLog = {
      type: logType,
      time: now.toISOString()
    };
    
    dispatch({
      type: 'ADD_ATTENDANCE_LOG',
      payload: { date: todayFormatted, log }
    });
  };

  // Calculate daily status
  const calculateDailyStatus = (date: string) => {
    const logs = state.attendanceLogs[date] || [];
    const activeShift = getCurrentShift();
    
    if (!activeShift || logs.length === 0) {
      return;
    }
    
    try {
      // Find check-in and check-out logs
      const checkInLog = logs.find(log => log.type === 'check_in');
      const checkOutLog = logs.find(log => log.type === 'check_out');
      
      if (!checkInLog || !checkOutLog) {
        const status: DailyWorkStatus = {
          date,
          shiftId: activeShift.id,
          shiftName: activeShift.name,
          status: WorkStatus.MISSING_LOGS,
          logs,
          calculatedAt: new Date().toISOString()
        };
        
        dispatch({
          type: 'UPDATE_DAILY_WORK_STATUS',
          payload: { date, status }
        });
        
        return;
      }
      
      // Parse check-in and check-out times
      const checkInTime = new Date(checkInLog.time);
      const checkOutTime = new Date(checkOutLog.time);
      
      // Parse shift times for the current date
      const dateObj = parse(date, 'yyyy-MM-dd', new Date());
      
      // Create date objects for shift start and end times
      const [startHour, startMinute] = activeShift.startTime.split(':').map(Number);
      const [officeEndHour, officeEndMinute] = activeShift.officeEndTime.split(':').map(Number);
      const [endHour, endMinute] = activeShift.endTime.split(':').map(Number);
      
      let shiftStartTime = new Date(dateObj);
      shiftStartTime.setHours(startHour, startMinute, 0, 0);
      
      let officeEndTime = new Date(dateObj);
      officeEndTime.setHours(officeEndHour, officeEndMinute, 0, 0);
      
      let shiftEndTime = new Date(dateObj);
      shiftEndTime.setHours(endHour, endMinute, 0, 0);
      
      // Handle overnight shifts
      if (officeEndHour < startHour) {
        officeEndTime = addMinutes(officeEndTime, 24 * 60); // Add 24 hours
      }
      
      if (endHour < startHour) {
        shiftEndTime = addMinutes(shiftEndTime, 24 * 60); // Add 24 hours
      }
      
      // Calculate time metrics
      const lateMinutes = Math.max(0, Math.floor((checkInTime.getTime() - shiftStartTime.getTime()) / (60 * 1000)));
      
      const earlyMinutes = Math.max(0, Math.floor((officeEndTime.getTime() - checkOutTime.getTime()) / (60 * 1000)));
      
      // Calculate penalty minutes (rounded)
      const totalPenaltyMinutes = lateMinutes + earlyMinutes;
      const roundingFactor = activeShift.penaltyRoundingMinutes;
      const penaltyMinutes = Math.ceil(totalPenaltyMinutes / roundingFactor) * roundingFactor;
      
      // Calculate gross and net work hours
      const grossHours = (checkOutTime.getTime() - checkInTime.getTime()) / (60 * 60 * 1000);
      
      // Subtract break minutes and penalty
      const totalHours = Math.max(0, grossHours - (activeShift.breakMinutes / 60) - (penaltyMinutes / 60));
      
      // Calculate overtime hours
      const otHours = Math.max(0, checkOutTime.getTime() - officeEndTime.getTime()) / (60 * 60 * 1000);
      
      // Determine work status
      let status: WorkStatus;
      if (lateMinutes > 0 && earlyMinutes > 0) {
        status = WorkStatus.LATE_EARLY;
      } else if (lateMinutes > 0) {
        status = WorkStatus.LATE;
      } else if (earlyMinutes > 0) {
        status = WorkStatus.EARLY_LEAVE;
      } else {
        status = WorkStatus.COMPLETED;
      }
      
      // Create remarks
      let remarks = '';
      if (lateMinutes > 0) {
        remarks += `Đi muộn ${lateMinutes} phút. `;
      }
      if (earlyMinutes > 0) {
        remarks += `Về sớm ${earlyMinutes} phút.`;
      }
      
      // Create daily work status
      const dailyStatus: DailyWorkStatus = {
        date,
        shiftId: activeShift.id,
        shiftName: activeShift.name,
        status,
        remarks: remarks.trim(),
        vaoLogTime: checkInLog.time,
        raLogTime: checkOutLog.time,
        shiftStartTime: shiftStartTime.toISOString(),
        officeEndTime: officeEndTime.toISOString(),
        shiftEndTime: shiftEndTime.toISOString(),
        totalHours,
        grossHours,
        lateMinutes,
        earlyMinutes,
        penaltyMinutes,
        otHours,
        breakMinutesConfig: activeShift.breakMinutes,
        logs,
        calculatedAt: new Date().toISOString()
      };
      
      dispatch({
        type: 'UPDATE_DAILY_WORK_STATUS',
        payload: { date, status: dailyStatus }
      });
    } catch (error) {
      console.error('Error calculating daily status:', error);
    }
  };

  // Add a new note
  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...noteData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    dispatch({ type: 'ADD_NOTE', payload: newNote });
  };

  // Update an existing note
  const updateNote = (note: Note) => {
    const updatedNote = {
      ...note,
      updatedAt: new Date().toISOString()
    };
    
    dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
  };

  // Delete a note
  const deleteNote = (id: string) => {
    dispatch({ type: 'DELETE_NOTE', payload: id });
  };

  // Update button status
  const updateButtonStatus = (status: ButtonStatus) => {
    dispatch({ type: 'SET_BUTTON_STATUS', payload: status });
  };

  // Reset today's logs
  const resetTodayLogs = () => {
    dispatch({ type: 'RESET_TODAY_LOGS' });
  };

  // Add weather alert
  const addWeatherAlert = (alertData: Omit<WeatherAlert, 'acknowledged'>) => {
    const alert: WeatherAlert = {
      ...alertData,
      acknowledged: false
    };
    
    dispatch({ type: 'ADD_WEATHER_ALERT', payload: alert });
  };

  // Acknowledge weather alert
  const acknowledgeWeatherAlert = (time: string) => {
    dispatch({ type: 'ACKNOWLEDGE_WEATHER_ALERT', payload: time });
  };

  // Get current shift
  const getCurrentShift = (): Shift | null => {
    if (!state.activeShiftId) return null;
    return state.shifts.find(shift => shift.id === state.activeShiftId) || null;
  };

  // Context value
  const value: AppContextProps = {
    state,
    dispatch,
    addShift,
    updateShift,
    deleteShift,
    setActiveShift,
    addAttendanceLog,
    calculateDailyStatus,
    addNote,
    updateNote,
    deleteNote,
    updateButtonStatus,
    resetTodayLogs,
    advanceButtonState,
    addWeatherAlert,
    acknowledgeWeatherAlert,
    getCurrentShift,
    loadData,
    saveData,
    backupData,
    restoreData,
    resetAllData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
};
