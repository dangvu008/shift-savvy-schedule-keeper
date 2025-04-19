
import { Home, CalendarDays, FileText, Settings } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

export const bottomNavItems: MenuItem[] = [
  { path: '/', icon: Home, label: 'Trang chủ' },
  { path: '/shifts/add', icon: CalendarDays, label: 'Ca làm việc' },
  { path: '/notes/add', icon: FileText, label: 'Ghi chú' },
  { path: '/settings', icon: Settings, label: 'Cài đặt' }
];
