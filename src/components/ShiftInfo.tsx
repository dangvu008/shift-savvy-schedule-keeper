
import React from 'react';
import { Shift } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface ShiftInfoProps {
  shift: Shift | null;
}

const DAY_MAP: Record<string, string> = {
  'Mon': 'T2',
  'Tue': 'T3',
  'Wed': 'T4',
  'Thu': 'T5',
  'Fri': 'T6',
  'Sat': 'T7',
  'Sun': 'CN'
};

export const ShiftInfo: React.FC<ShiftInfoProps> = ({ shift }) => {
  if (!shift) {
    return (
      <Card className="bg-app-dark-light border-app-dark-border mb-4">
        <CardContent className="p-4 text-center">
          <p className="text-app-dark-text-secondary">Chưa chọn ca làm việc</p>
        </CardContent>
      </Card>
    );
  }

  const formattedDays = shift.daysApplied.map(day => DAY_MAP[day]).join(', ');

  return (
    <Card className="bg-app-dark-light border-app-dark-border mb-4 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-app-purple rounded-full p-2 flex-shrink-0">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-white">{shift.name}</h3>
            <div className="text-sm text-app-dark-text-secondary">
              {shift.startTime} → {shift.endTime}
            </div>
            <div className="text-xs text-app-dark-text-muted">
              {formattedDays}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
