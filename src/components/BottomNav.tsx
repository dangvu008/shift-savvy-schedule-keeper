
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, CalendarDays, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export const BottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = [
    { path: '/', icon: Home, label: 'Trang chủ' },
    { path: '/shifts/add', icon: CalendarDays, label: 'Ca làm việc' },
    { path: '/notes/add', icon: FileText, label: 'Ghi chú' },
    { path: '/settings', icon: Settings, label: 'Cài đặt' }
  ];

  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-dark-light border-t border-app-dark-border z-50">
      <div className="grid grid-cols-4 items-center h-16">
        {menuItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center w-full h-full py-2 transition-colors duration-200 active:bg-app-dark-border"
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
                "text-xs truncate max-w-full",
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
