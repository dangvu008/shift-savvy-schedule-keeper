
import React from 'react';
import { DailyWorkStatus, WeekDay, WorkStatus } from '@/types/app';
import { 
  AlertCircle, 
  AlertTriangle,
  Check,
  Clock,
  Hourglass,
  X,
  Info
} from 'lucide-react';
import { format, parseISO, startOfWeek, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface WeeklyStatusGridProps {
  dailyStatuses: Record<string, DailyWorkStatus>;
  firstDayOfWeek: 'Mon' | 'Sun';
  onCellClick?: (date: string) => void;
}

const DAY_LABELS: Record<WeekDay, string> = {
  'Mon': 'T2',
  'Tue': 'T3',
  'Wed': 'T4',
  'Thu': 'T5',
  'Fri': 'T6',
  'Sat': 'T7',
  'Sun': 'CN'
};

const STATUS_CONFIGS: Record<WorkStatus, { icon: React.ReactNode; bgColor: string; textColor: string }> = {
  [WorkStatus.PENDING]: { 
    icon: <Hourglass className="h-4 w-4" />, 
    bgColor: 'bg-app-dark-light', 
    textColor: 'text-white'
  },
  [WorkStatus.GO_WORK]: { 
    icon: <Clock className="h-4 w-4" />, 
    bgColor: 'bg-app-status-info', 
    textColor: 'text-white'
  },
  [WorkStatus.WORKING]: { 
    icon: <Clock className="h-4 w-4" />, 
    bgColor: 'bg-app-status-info', 
    textColor: 'text-white'
  },
  [WorkStatus.COMPLETED]: { 
    icon: <Check className="h-4 w-4" />, 
    bgColor: 'bg-app-status-success', 
    textColor: 'text-white'
  },
  [WorkStatus.MISSING_LOGS]: { 
    icon: <AlertCircle className="h-4 w-4" />, 
    bgColor: 'bg-app-status-warning', 
    textColor: 'text-white'
  },
  [WorkStatus.LATE]: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    bgColor: 'bg-app-status-error', 
    textColor: 'text-white'
  },
  [WorkStatus.EARLY_LEAVE]: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    bgColor: 'bg-app-status-error', 
    textColor: 'text-white'
  },
  [WorkStatus.LATE_EARLY]: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    bgColor: 'bg-app-status-error', 
    textColor: 'text-white'
  },
  [WorkStatus.ABSENT]: { 
    icon: <X className="h-4 w-4" />, 
    bgColor: 'bg-app-dark-text-muted', 
    textColor: 'text-white'
  },
  [WorkStatus.HOLIDAY]: { 
    icon: <Info className="h-4 w-4" />, 
    bgColor: 'bg-app-status-success/70', 
    textColor: 'text-white'
  },
  [WorkStatus.WEEKEND]: { 
    icon: null, 
    bgColor: 'bg-app-dark-light', 
    textColor: 'text-app-dark-text-muted'
  },
  [WorkStatus.VACATION]: { 
    icon: <Info className="h-4 w-4" />, 
    bgColor: 'bg-app-purple-light', 
    textColor: 'text-white'
  }
};

export const WeeklyStatusGrid: React.FC<WeeklyStatusGridProps> = ({
  dailyStatuses,
  firstDayOfWeek = 'Mon',
  onCellClick
}) => {
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);

  // Calculate the current week's days
  const now = new Date();
  const weekStartsOn = firstDayOfWeek === 'Mon' ? 1 : 0;
  const weekStart = startOfWeek(now, { weekStartsOn });
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayNumber = format(date, 'd');
    const dayOfWeek = format(date, 'E', { locale: vi }) as WeekDay;
    const status = dailyStatuses[dateString] || {
      date: dateString,
      status: WorkStatus.PENDING,
      shiftId: null,
      shiftName: null,
      calculatedAt: now.toISOString()
    };

    return {
      date: dateString,
      dayNumber,
      dayOfWeek,
      status
    };
  });

  const handleCellClick = (date: string) => {
    setSelectedDate(date);
    setShowDetails(true);
    onCellClick?.(date);
  };

  const selectedStatus = selectedDate ? dailyStatuses[selectedDate] : null;

  return (
    <div className="card-container mb-4">
      <h2 className="text-xl font-bold mb-4">Trạng thái tuần này</h2>
      <div className="grid grid-cols-7 gap-1">
        {/* Day Labels */}
        {weekDays.map(day => (
          <div 
            key={`label-${day.date}`}
            className="weekly-day-cell text-center font-medium"
          >
            {DAY_LABELS[day.dayOfWeek]}
          </div>
        ))}
        
        {/* Day Numbers */}
        {weekDays.map(day => (
          <div 
            key={`number-${day.date}`}
            className="weekly-day-cell text-center"
          >
            {day.dayNumber}
          </div>
        ))}
        
        {/* Status Indicators */}
        {weekDays.map(day => {
          const config = STATUS_CONFIGS[day.status.status];
          return (
            <div 
              key={`status-${day.date}`}
              className="weekly-day-cell flex justify-center cursor-pointer"
              onClick={() => handleCellClick(day.date)}
            >
              <div className={`status-indicator ${config.bgColor} ${config.textColor}`}>
                {config.icon}
              </div>
            </div>
          );
        })}
        
        {/* Shift times (when available) */}
        {weekDays.map(day => {
          const hasShift = day.status.shiftId !== null;
          if (!hasShift) return <div key={`times-${day.date}`} className="weekly-day-cell text-center text-xs">-</div>;
          
          const startTime = day.status.shiftStartTime 
            ? format(parseISO(day.status.shiftStartTime), 'HH:mm')
            : '--:--';
            
          const endTime = day.status.shiftEndTime
            ? format(parseISO(day.status.shiftEndTime), 'HH:mm')
            : '--:--';
            
          return (
            <div key={`times-${day.date}`} className="weekly-day-cell text-center text-xs">
              <div>{startTime}</div>
              <div>-</div>
              <div>{endTime}</div>
            </div>
          );
        })}
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-app-dark-light border-app-dark-border">
          <DialogHeader>
            <DialogTitle>Chi tiết trạng thái</DialogTitle>
            {selectedStatus && (
              <DialogDescription>
                <div className="text-app-dark-text-secondary mt-2">
                  <p>Ngày: {format(parseISO(selectedStatus.date), 'dd/MM/yyyy')}</p>
                  {selectedStatus.shiftName && (
                    <p>Ca làm: {selectedStatus.shiftName}</p>
                  )}
                  {selectedStatus.totalHours !== undefined && (
                    <p>Số giờ làm: {selectedStatus.totalHours.toFixed(1)}h</p>
                  )}
                  {selectedStatus.remarks && (
                    <p>Ghi chú: {selectedStatus.remarks}</p>
                  )}
                </div>
              </DialogDescription>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
