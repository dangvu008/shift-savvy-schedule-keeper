
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, CalendarDays, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/shifts/add', icon: CalendarDays, label: 'Ca làm việc' },
    { path: '/notes/add', icon: FileText, label: 'Ghi chú' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-dark-light border-t border-app-dark-border">
      <div className="flex justify-around items-center h-16">
        {menuItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <Icon 
                className={cn(
                  "h-6 w-6 mb-1",
                  isActive 
                    ? "text-primary" 
                    : "text-app-dark-text-secondary hover:text-app-dark-text-primary"
                )} 
              />
              <span className={cn(
                "text-xs",
                isActive 
                  ? "text-primary" 
                  : "text-app-dark-text-secondary"
              )}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
