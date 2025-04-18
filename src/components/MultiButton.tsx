
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Check, LogIn, LogOut, Clock, AlertTriangle } from 'lucide-react';
import { ButtonStatus } from '@/types/app';

interface MultiButtonProps {
  status: ButtonStatus;
  onClick: () => void;
  onReset?: () => void;
  disabled?: boolean;
  elapsedTime?: string;
}

export const MultiButton: React.FC<MultiButtonProps> = ({
  status,
  onClick,
  onReset,
  disabled = false,
  elapsedTime
}) => {
  // Get button configuration based on status
  const getButtonConfig = () => {
    switch (status) {
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
          icon: <Clock className="h-6 w-6" />,
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
          icon: <Check className="h-6 w-6" />,
          color: 'bg-app-status-info hover:bg-app-status-info/90'
        };
      case ButtonStatus.COMPLETE:
        return {
          label: 'Hoàn Tất',
          icon: <Check className="h-6 w-6" />,
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
  const shouldShowReset = status !== ButtonStatus.GO_WORK && onReset;

  return (
    <div className="relative">
      <Button
        className={`multi-button w-32 h-32 p-0 flex-col gap-2 shadow-lg ${color} ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        onClick={onClick}
        disabled={disabled || status === ButtonStatus.COMPLETED}
      >
        <div className="text-2xl">{icon}</div>
        <div className="text-sm font-medium">{label}</div>
      </Button>
      
      {elapsedTime && (
        <div className="mt-2 text-sm text-app-dark-text-secondary">
          {elapsedTime}
        </div>
      )}
      
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
