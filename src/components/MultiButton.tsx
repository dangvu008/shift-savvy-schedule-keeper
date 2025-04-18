
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, 
  Check, 
  LogIn, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  CheckCheck, 
  Activity, 
  Flag
} from 'lucide-react';
import { ButtonStatus } from '@/types/app';

interface MultiButtonProps {
  status: ButtonStatus;
  onClick: () => void;
  onReset?: () => void;
  disabled?: boolean;
  elapsedTime?: string;
  showPunch?: boolean;
  onPunch?: () => void;
  mode?: 'full' | 'simple';
}

export const MultiButton: React.FC<MultiButtonProps> = ({
  status,
  onClick,
  onReset,
  disabled = false,
  elapsedTime,
  showPunch = false,
  onPunch,
  mode = 'full'
}) => {
  // If in simple mode, only show GO_WORK state
  const effectiveStatus = mode === 'simple' ? ButtonStatus.GO_WORK : status;
  
  // Get button configuration based on status
  const getButtonConfig = () => {
    switch (effectiveStatus) {
      case ButtonStatus.GO_WORK:
        return {
          label: 'Đi làm',
          icon: <Clock className="h-6 w-6" />,
          color: 'bg-app-purple hover:bg-app-purple-hover'
        };
      case ButtonStatus.WAITING_CHECK_IN:
        return {
          label: 'Đã xác nhận Đi làm',
          icon: <Check className="h-6 w-6" />,
          color: 'bg-app-status-info hover:bg-app-status-info/90'
        };
      case ButtonStatus.CHECK_IN:
        return {
          label: 'Chấm Công Vào',
          icon: <LogIn className="h-6 w-6" />,
          color: 'bg-app-purple hover:bg-app-purple-hover'
        };
      case ButtonStatus.WORKING:
        return {
          label: 'Đang làm việc',
          icon: <Activity className="h-6 w-6" />,
          color: 'bg-app-status-info hover:bg-app-status-info/90'
        };
      case ButtonStatus.CHECK_OUT:
        return {
          label: 'Chấm Công Ra',
          icon: <LogOut className="h-6 w-6" />,
          color: 'bg-app-purple hover:bg-app-purple-hover'
        };
      case ButtonStatus.READY_COMPLETE:
        return {
          label: 'Đã Check-out',
          icon: <Flag className="h-6 w-6" />,
          color: 'bg-app-status-info hover:bg-app-status-info/90'
        };
      case ButtonStatus.COMPLETE:
        return {
          label: 'Hoàn Tất',
          icon: <CheckCheck className="h-6 w-6" />,
          color: 'bg-app-purple hover:bg-app-purple-hover'
        };
      case ButtonStatus.COMPLETED:
        return {
          label: 'Đã Hoàn Tất',
          icon: <Check className="h-6 w-6" />,
          color: 'bg-app-dark-light'
        };
      default:
        return {
          label: 'Đi làm',
          icon: <Clock className="h-6 w-6" />,
          color: 'bg-app-purple hover:bg-app-purple-hover'
        };
    }
  };

  const { label, icon, color } = getButtonConfig();
  
  // Only show reset button if we've progressed past GO_WORK and onReset is provided
  const shouldShowReset = status !== ButtonStatus.GO_WORK && onReset;
  
  // Determine if we should show the punch button
  const shouldShowPunch = showPunch && 
    status === ButtonStatus.WORKING && 
    onPunch && 
    mode === 'full';

  return (
    <div className="relative flex flex-col items-center">
      {/* Main multi-function button */}
      <Button
        className={`multi-button w-32 h-32 p-0 flex-col gap-2 shadow-lg ${color} ${disabled || (mode === 'simple' && status !== ButtonStatus.GO_WORK) ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={onClick}
        disabled={disabled || status === ButtonStatus.COMPLETED || (mode === 'simple' && status !== ButtonStatus.GO_WORK)}
      >
        <div className="text-2xl">{icon}</div>
        <div className="text-sm font-medium">{label}</div>
      </Button>
      
      {/* Elapsed time display */}
      {elapsedTime && (
        <div className="mt-2 text-sm text-app-dark-text-secondary">
          {elapsedTime}
        </div>
      )}
      
      {/* Optional punch button */}
      {shouldShowPunch && (
        <Button
          className="mt-3 w-24 h-10 p-0 flex-col gap-1 shadow-md bg-app-status-warning hover:bg-app-status-warning/90"
          onClick={onPunch}
          title="Ký Công"
        >
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4" />
            <span className="text-sm">Ký Công</span>
          </div>
        </Button>
      )}
      
      {/* Reset button */}
      {shouldShowReset && (
        <Button
          className="absolute -top-2 -right-2 w-8 h-8 p-0 rounded-full bg-app-status-warning hover:bg-app-status-warning/90"
          onClick={onReset}
          title="Reset"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
