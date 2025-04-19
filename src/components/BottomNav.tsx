
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { bottomNavItems } from '@/config/navigation';
import { NavItem } from './NavItem';

export const BottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-app-dark-light border-t border-app-dark-border z-50">
      <div className="grid grid-cols-4 items-center h-16">
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.path}
            {...item}
            isActive={location.pathname === item.path}
          />
        ))}
      </div>
    </nav>
  );
};
