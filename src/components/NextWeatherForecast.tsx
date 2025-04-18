
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CloudSun, CloudRain, Sun, Cloud, CloudLightning, CloudSnow, Wind } from 'lucide-react';

interface WeatherItem {
  time: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'storm' | 'snow' | 'windy' | 'partly-cloudy';
}

interface NextWeatherForecastProps {
  forecast: WeatherItem[];
}

const getWeatherIcon = (condition: WeatherItem['condition']) => {
  switch (condition) {
    case 'sunny':
      return <Sun className="h-6 w-6 text-yellow-500" />;
    case 'rainy':
      return <CloudRain className="h-6 w-6 text-blue-400" />;
    case 'cloudy':
      return <Cloud className="h-6 w-6 text-gray-400" />;
    case 'storm':
      return <CloudLightning className="h-6 w-6 text-purple-500" />;
    case 'snow':
      return <CloudSnow className="h-6 w-6 text-blue-200" />;
    case 'windy':
      return <Wind className="h-6 w-6 text-gray-500" />;
    case 'partly-cloudy':
      return <CloudSun className="h-6 w-6 text-gray-400" />;
  }
};

export const NextWeatherForecast = ({ forecast }: NextWeatherForecastProps) => {
  if (!forecast?.length) return null;

  return (
    <Card className="mb-4 bg-app-dark-light border-app-dark-border">
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {forecast.slice(0, 3).map((item, index) => (
            <div key={index} className="flex flex-col items-center p-2">
              <div className="text-sm text-app-dark-text-secondary mb-1">
                {item.time}
              </div>
              {getWeatherIcon(item.condition)}
              <div className="text-base font-medium mt-1">
                {Math.round(item.temp)}°C
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
