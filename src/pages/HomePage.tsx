import React, { useState, useEffect } from 'react';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAppContext } from '@/context/AppContext';
import { MultiButton } from '@/components/MultiButton';
import { ShiftInfo } from '@/components/ShiftInfo';
import { AttendanceLogList } from '@/components/AttendanceLogList';
import { WeeklyStatusGrid } from '@/components/WeeklyStatusGrid';
import { NotesList } from '@/components/NotesList';
import { WeatherAlert } from '@/components/WeatherAlert';
import { NextWeatherForecast } from '@/components/NextWeatherForecast';
import { Button } from '@/components/ui/button';
import { Settings, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Note, ButtonStatus } from '@/types/app';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BottomNav } from '@/components/BottomNav';

export const HomePage: React.FC = () => {
  const { 
    state, 
    advanceButtonState, 
    resetTodayLogs, 
    acknowledgeWeatherAlert,
    getCurrentShift,
    addAttendanceLog
  } = useAppContext();
  
  const [elapsedTime, setElapsedTime] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  
  const navigate = useNavigate();
  
  const currentShift = getCurrentShift();
  const currentTime = new Date();
  const formattedTime = format(currentTime, 'HH:mm');
  const formattedDate = format(currentTime, 'EEEE, dd/MM', { locale: vi });
  
  // Active weather alerts (not acknowledged)
  const activeAlerts = state.weatherAlerts.filter(alert => !alert.acknowledged);
  
  // Update elapsed time based on logs
  useEffect(() => {
    const updateElapsedTime = () => {
      if (state.todayLogs.length === 0) return;
      
      const firstLog = state.todayLogs[0];
      const firstLogTime = parseISO(firstLog.time);
      const diffMinutes = differenceInMinutes(new Date(), firstLogTime);
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      if (hours > 0) {
        setElapsedTime(`Đã đi làm ${hours}:${minutes.toString().padStart(2, '0')}`);
      } else {
        setElapsedTime(`Đã đi làm ${minutes} phút`);
      }
    };
    
    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000);
    
    return () => clearInterval(interval);
  }, [state.todayLogs]);
  
  // Handle button click
  const handleButtonClick = () => {
    advanceButtonState();
  };
  
  // Handle reset button click
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };
  
  // Handle punch button click
  const handlePunchClick = () => {
    // Add a 'punch' log
    if (state.currentButtonStatus === ButtonStatus.WORKING) {
      addAttendanceLog('punch');
    }
  };
  
  // Confirm reset
  const confirmReset = () => {
    resetTodayLogs();
    setShowResetConfirm(false);
  };
  
  // Add/edit note
  const handleAddNote = () => {
    setSelectedNote(null);
    setShowNoteForm(true);
  };
  
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setShowNoteForm(true);
  };

  // Add mock weather data for demonstration
  const mockWeatherForecast = [
    { time: '15:00', temp: 28, condition: 'partly-cloudy' as const },
    { time: '16:00', temp: 27, condition: 'cloudy' as const },
    { time: '17:00', temp: 26, condition: 'rainy' as const }
  ];

  // Determine if we should show the punch button based on current shift and button status
  const shouldShowPunch = currentShift?.showPunch && state.currentButtonStatus === ButtonStatus.WORKING;
  
  // Get button mode from user settings
  const buttonMode = state.userSettings.multiButtonMode || 'full';

  return (
    <div className="min-h-screen bg-app-dark text-white pb-16">
      <div className="container py-6 max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Time Manager</h1>
            <div className="text-app-dark-text-secondary">
              {formattedDate}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/statistics')}
              className="bg-app-dark-light border-app-dark-border"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/settings')}
              className="bg-app-dark-light border-app-dark-border"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Current time */}
        <div className="text-4xl font-bold text-center mb-1">
          {formattedTime}
        </div>
        
        {/* Weather alerts */}
        {activeAlerts.map(alert => (
          <WeatherAlert
            key={alert.time}
            alert={alert}
            onAcknowledge={acknowledgeWeatherAlert}
          />
        ))}
        
        {/* Next 3 hours weather forecast */}
        <NextWeatherForecast forecast={mockWeatherForecast} />
        
        {/* Active shift info */}
        <ShiftInfo shift={currentShift} />
        
        {/* Multi-function button */}
        <div className="flex flex-col items-center justify-center mb-4">
          <MultiButton
            status={state.currentButtonStatus}
            onClick={handleButtonClick}
            onReset={handleResetClick}
            onPunch={handlePunchClick}
            showPunch={shouldShowPunch}
            elapsedTime={elapsedTime}
            mode={buttonMode}
          />
        </div>
        
        {/* Attendance logs */}
        <AttendanceLogList logs={state.todayLogs} />
        
        {/* Weekly status grid */}
        <WeeklyStatusGrid
          dailyStatuses={state.dailyWorkStatus}
          firstDayOfWeek={state.userSettings.firstDayOfWeek}
        />
        
        {/* Notes */}
        <NotesList
          notes={state.notes}
          onAddNote={handleAddNote}
          onEditNote={handleEditNote}
          onDeleteNote={() => {}}
        />
        
        {/* Reset confirmation dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="bg-app-dark-light border-app-dark-border">
            <DialogHeader>
              <DialogTitle>Xác nhận reset</DialogTitle>
              <DialogDescription className="text-app-dark-text-secondary">
                Bạn có muốn reset lại trạng thái chấm công hôm nay không? 
                Mọi dữ liệu bấm nút hôm nay sẽ bị xóa.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                className="bg-app-dark-border"
              >
                Hủy
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmReset}
              >
                Đồng ý reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNav />
    </div>
  );
};

export default HomePage;
