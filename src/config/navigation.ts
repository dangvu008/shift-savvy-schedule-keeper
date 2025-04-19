
import { Home, CalendarDays, FileText, BarChart3 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

export const bottomNavItems: MenuItem[] = [
  { path: '/', icon: Home, label: 'Trang chủ' },
  { path: '/shifts', icon: CalendarDays, label: 'Ca làm việc' },
  { path: '/notes/add', icon: FileText, label: 'Ghi chú' },
  { path: '/statistics', icon: BarChart3, label: 'Thống kê' }
];

