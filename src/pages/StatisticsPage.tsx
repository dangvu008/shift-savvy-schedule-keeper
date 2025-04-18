
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { WorkStatus } from '@/types/app';

// Period filter types
type PeriodFilter = 'week' | 'month' | 'year' | 'custom';

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  
  // Period filter state
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  
  // Get date range for the selected period
  const getDateRange = () => {
    const now = new Date();
    
    switch (periodFilter) {
      case 'week':
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      case 'custom':
        // For simplicity, we'll just use the current month for custom
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  };
  
  // Filter work statuses by date range
  const filteredStatuses = () => {
    const { start, end } = getDateRange();
    const statuses = Object.entries(state.dailyWorkStatus)
      .filter(([date]) => {
        const statusDate = parseISO(date);
        return isWithinInterval(statusDate, { start, end });
      })
      .map(([date, status]) => ({ date, ...status }));
    
    return statuses.sort((a, b) => a.date.localeCompare(b.date));
  };
  
  // Calculate summary statistics
  const calculateStats = () => {
    const filteredData = filteredStatuses();
    
    const totalWorkHours = filteredData.reduce((total, status) => total + (status.totalHours || 0), 0);
    const totalOTHours = filteredData.reduce((total, status) => total + (status.otHours || 0), 0);
    
    // Count days by status
    const statusCounts: Record<WorkStatus, number> = {
      [WorkStatus.PENDING]: 0,
      [WorkStatus.GO_WORK]: 0,
      [WorkStatus.WORKING]: 0,
      [WorkStatus.COMPLETED]: 0,
      [WorkStatus.MISSING_LOGS]: 0,
      [WorkStatus.LATE]: 0,
      [WorkStatus.EARLY_LEAVE]: 0,
      [WorkStatus.LATE_EARLY]: 0,
      [WorkStatus.ABSENT]: 0,
      [WorkStatus.HOLIDAY]: 0,
      [WorkStatus.WEEKEND]: 0,
      [WorkStatus.VACATION]: 0
    };
    
    filteredData.forEach(status => {
      statusCounts[status.status] = (statusCounts[status.status] || 0) + 1;
    });
    
    return {
      totalWorkHours: totalWorkHours.toFixed(1),
      totalOTHours: totalOTHours.toFixed(1),
      statusCounts,
      workDays: filteredData.length
    };
  };
  
  const stats = calculateStats();
  const statusData = filteredStatuses();
  
  // Format date range for display
  const formatDateRange = () => {
    const { start, end } = getDateRange();
    return `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
  };
  
  return (
    <div className="min-h-screen bg-app-dark text-white">
      <div className="container py-6 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Thống kê tháng</h1>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`${periodFilter === 'week' ? 'bg-app-purple text-white' : 'bg-app-dark-light'}`}
              onClick={() => setPeriodFilter('week')}
            >
              Tuần này
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${periodFilter === 'month' ? 'bg-app-purple text-white' : 'bg-app-dark-light'}`}
              onClick={() => setPeriodFilter('month')}
            >
              Tháng này
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${periodFilter === 'year' ? 'bg-app-purple text-white' : 'bg-app-dark-light'}`}
              onClick={() => setPeriodFilter('year')}
            >
              Năm nay
            </Button>
          </div>
        </div>
        
        <div className="text-center text-app-dark-text-secondary mb-6">
          {formatDateRange()}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-app-dark-light border-app-dark-border">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-1">Tổng giờ làm</h3>
              <p className="text-3xl font-bold text-app-purple">{stats.totalWorkHours}h</p>
            </CardContent>
          </Card>
          
          <Card className="bg-app-dark-light border-app-dark-border">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-1">Tổng giờ OT</h3>
              <p className="text-3xl font-bold text-app-status-info">{stats.totalOTHours}h</p>
            </CardContent>
          </Card>
          
          <Card className="bg-app-dark-light border-app-dark-border">
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-1">Ngày làm việc</h3>
              <p className="text-3xl font-bold text-app-status-success">{stats.workDays}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Status Distribution */}
        <Card className="bg-app-dark-light border-app-dark-border mb-6">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4">Phân bố trạng thái</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-app-status-success/20 rounded-lg p-3 text-center">
                <h3 className="text-sm text-app-dark-text-secondary mb-1">Hoàn thành</h3>
                <p className="text-2xl font-bold text-app-status-success">
                  {stats.statusCounts[WorkStatus.COMPLETED]}
                </p>
              </div>
              
              <div className="bg-app-status-error/20 rounded-lg p-3 text-center">
                <h3 className="text-sm text-app-dark-text-secondary mb-1">Đi muộn</h3>
                <p className="text-2xl font-bold text-app-status-error">
                  {stats.statusCounts[WorkStatus.LATE]}
                </p>
              </div>
              
              <div className="bg-app-status-error/20 rounded-lg p-3 text-center">
                <h3 className="text-sm text-app-dark-text-secondary mb-1">Về sớm</h3>
                <p className="text-2xl font-bold text-app-status-error">
                  {stats.statusCounts[WorkStatus.EARLY_LEAVE]}
                </p>
              </div>
              
              <div className="bg-app-status-error/20 rounded-lg p-3 text-center">
                <h3 className="text-sm text-app-dark-text-secondary mb-1">Muộn & sớm</h3>
                <p className="text-2xl font-bold text-app-status-error">
                  {stats.statusCounts[WorkStatus.LATE_EARLY]}
                </p>
              </div>
              
              <div className="bg-app-status-warning/20 rounded-lg p-3 text-center">
                <h3 className="text-sm text-app-dark-text-secondary mb-1">Thiếu log</h3>
                <p className="text-2xl font-bold text-app-status-warning">
                  {stats.statusCounts[WorkStatus.MISSING_LOGS]}
                </p>
              </div>
              
              <div className="bg-app-purple/20 rounded-lg p-3 text-center">
                <h3 className="text-sm text-app-dark-text-secondary mb-1">Nghỉ phép</h3>
                <p className="text-2xl font-bold text-app-purple">
                  {stats.statusCounts[WorkStatus.VACATION]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Table */}
        <Card className="bg-app-dark-light border-app-dark-border overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-app-dark">
                    <th className="text-left p-3 border-b border-app-dark-border">Ngày</th>
                    <th className="text-left p-3 border-b border-app-dark-border">Thứ</th>
                    <th className="text-center p-3 border-b border-app-dark-border">Vào ca</th>
                    <th className="text-center p-3 border-b border-app-dark-border">Tan ca</th>
                    <th className="text-right p-3 border-b border-app-dark-border">Giờ HC</th>
                    <th className="text-right p-3 border-b border-app-dark-border">OT</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData.map((status) => {
                    // Format the date and day of week
                    const statusDate = parseISO(status.date);
                    const formattedDate = format(statusDate, 'dd/MM/yyyy');
                    const dayOfWeek = format(statusDate, 'EEEE', { locale: vi });
                    
                    // Format check-in and check-out times
                    const checkIn = status.vaoLogTime 
                      ? format(parseISO(status.vaoLogTime), 'HH:mm')
                      : '--:--';
                      
                    const checkOut = status.raLogTime
                      ? format(parseISO(status.raLogTime), 'HH:mm')
                      : '--:--';
                    
                    // Regular hours and OT
                    const regularHours = status.totalHours 
                      ? Math.max(0, status.totalHours - (status.otHours || 0)).toFixed(1)
                      : '-';
                      
                    const otHours = status.otHours
                      ? status.otHours.toFixed(1)
                      : '0.0';
                    
                    return (
                      <tr key={status.date} className="hover:bg-app-dark/40">
                        <td className="p-3 border-b border-app-dark-border">{formattedDate}</td>
                        <td className="p-3 border-b border-app-dark-border">{dayOfWeek}</td>
                        <td className="p-3 border-b border-app-dark-border text-center">{checkIn}</td>
                        <td className="p-3 border-b border-app-dark-border text-center">{checkOut}</td>
                        <td className="p-3 border-b border-app-dark-border text-right">{regularHours}</td>
                        <td className="p-3 border-b border-app-dark-border text-right">{otHours}</td>
                      </tr>
                    );
                  })}
                  
                  {statusData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-app-dark-text-secondary">
                        Không có dữ liệu trong khoảng thời gian này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <Button
            variant="outline"
            className="bg-app-dark-light"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
