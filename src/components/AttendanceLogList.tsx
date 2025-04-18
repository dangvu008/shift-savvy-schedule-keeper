
import React from 'react';
import { AttendanceLog, LogType } from '@/types/app';
import { format, parseISO } from 'date-fns';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  CheckCheck 
} from 'lucide-react';

interface AttendanceLogListProps {
  logs: AttendanceLog[];
}

const LOG_CONFIG: Record<LogType, { label: string; icon: React.ReactNode; color: string }> = {
  'go_work': {
    label: 'Đi làm',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-yellow-400 bg-yellow-400/10'
  },
  'check_in': {
    label: 'Chấm công vào',
    icon: <LogIn className="h-4 w-4" />,
    color: 'text-blue-400 bg-blue-400/10'
  },
  'punch': {
    label: 'Ký công',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-purple-400 bg-purple-400/10'
  },
  'check_out': {
    label: 'Chấm công ra',
    icon: <LogOut className="h-4 w-4" />,
    color: 'text-orange-400 bg-orange-400/10'
  },
  'complete': {
    label: 'Hoàn tất',
    icon: <CheckCheck className="h-4 w-4" />,
    color: 'text-green-400 bg-green-400/10'
  }
};

export const AttendanceLogList: React.FC<AttendanceLogListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center text-app-dark-text-secondary py-2">
        Chưa bắt đầu
      </div>
    );
  }

  // Sort logs by time
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  return (
    <div className="space-y-2 mt-2 mb-4">
      {sortedLogs.map((log, index) => {
        const config = LOG_CONFIG[log.type];
        
        return (
          <div 
            key={index} 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${config.color}`}
          >
            <div className="flex-shrink-0">{config.icon}</div>
            <div className="flex-grow">
              <div className="font-medium text-sm">{config.label}</div>
              <div className="text-xs opacity-80">
                {format(parseISO(log.time), 'HH:mm:ss')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
