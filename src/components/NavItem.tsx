
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { MenuItem } from '@/config/navigation';

interface NavItemProps extends MenuItem {
  isActive: boolean;
}

export const NavItem = ({ path, icon: Icon, label, isActive }: NavItemProps) => {
  return (
    <Link
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
};
