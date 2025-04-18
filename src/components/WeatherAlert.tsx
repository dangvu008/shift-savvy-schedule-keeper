
import React from 'react';
import { WeatherAlert as WeatherAlertType } from '@/types/app';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CloudRainWind,
  Snowflake,
  Thermometer,
  Wind,
  AlertTriangle,
  X
} from 'lucide-react';

interface WeatherAlertProps {
  alert: WeatherAlertType;
  onAcknowledge: (time: string) => void;
}

export const WeatherAlert: React.FC<WeatherAlertProps> = ({ 
  alert, 
  onAcknowledge 
}) => {
  if (alert.acknowledged) return null;

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'rain':
        return <CloudRainWind className="h-5 w-5" />;
      case 'snow':
        return <Snowflake className="h-5 w-5" />;
      case 'extreme_heat':
      case 'extreme_cold':
        return <Thermometer className="h-5 w-5" />;
      case 'storm':
      case 'wind':
        return <Wind className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getBgColor = () => {
    switch (alert.type) {
      case 'rain':
      case 'snow':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'extreme_heat':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'extreme_cold':
        return 'bg-blue-300/10 border-blue-300/20';
      case 'storm':
      case 'wind':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <Card className={`mb-4 ${getBgColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-white mt-1">
            {getAlertIcon()}
          </div>
          <div className="flex-grow">
            <h3 className="font-medium text-white">Cảnh báo thời tiết</h3>
            <p className="text-sm text-white/90 mb-2">{alert.description}</p>
            <p className="text-xs text-white/80 italic">{alert.suggestion}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto -mt-1 -mr-1 h-7 w-7 text-white/80 hover:text-white"
            onClick={() => onAcknowledge(alert.time)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
