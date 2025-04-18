
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { Shift } from '@/types/app';

const SettingsPage: React.FC = () => {
  const { state, setActiveShift, deleteShift, updateShift } = useAppContext();
  const navigate = useNavigate();
  
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  // Handle shift selection
  const handleSetActiveShift = (id: string) => {
    setActiveShift(id);
  };
  
  // Confirm shift deletion
  const handleDeleteConfirm = (id: string) => {
    setConfirmDelete(id);
  };
  
  // Delete shift
  const confirmDeleteShift = () => {
    if (confirmDelete) {
      deleteShift(confirmDelete);
      setConfirmDelete(null);
    }
  };
  
  // Edit shift
  const handleEditShift = (shift: Shift) => {
    navigate(`/shifts/edit/${shift.id}`);
  };

  return (
    <div className="min-h-screen bg-app-dark text-white">
      <div className="container py-6 max-w-md mx-auto px-4">
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
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        {/* Shifts section */}
        <Card className="bg-app-dark-light border-app-dark-border mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ca làm việc</h2>
              <p className="text-sm text-app-dark-text-secondary">
                Quản lý ca làm việc
              </p>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-app-dark-text-secondary">
                Nhắc nhở thay đổi ca
              </div>
              <Select defaultValue={state.userSettings.changeShiftReminderMode}>
                <SelectTrigger className="w-[180px] bg-app-dark border-app-dark-border">
                  <SelectValue placeholder="Chọn chế độ" />
                </SelectTrigger>
                <SelectContent className="bg-app-dark-light border-app-dark-border">
                  <SelectItem value="ask_weekly">Hỏi hàng tuần</SelectItem>
                  <SelectItem value="rotate">Tự động xoay vòng</SelectItem>
                  <SelectItem value="disabled">Không nhắc nhở</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* List of shifts */}
            <div className="space-y-3 mt-6">
              {state.shifts.map(shift => (
                <Card 
                  key={shift.id} 
                  className={`border ${
                    state.activeShiftId === shift.id 
                      ? 'border-app-purple bg-app-purple/10' 
                      : 'border-app-dark-border bg-app-dark'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{shift.name}</h3>
                        <p className="text-sm text-app-dark-text-secondary">
                          {shift.startTime} - {shift.endTime}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {state.activeShiftId === shift.id ? (
                          <div className="bg-app-purple text-white rounded-full w-7 h-7 flex items-center justify-center">
                            <Check className="h-4 w-4" />
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetActiveShift(shift.id)}
                            className="h-7 px-2 bg-app-dark-light"
                          >
                            Chọn
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditShift(shift)}
                          className="h-7 w-7"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteConfirm(shift.id)}
                          className="h-7 w-7 text-app-status-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add new shift button */}
              <Button
                variant="outline" 
                className="w-full py-5 border-dashed border-app-dark-border flex items-center justify-center gap-2"
                onClick={() => navigate('/shifts/add')}
              >
                <Plus className="h-4 w-4" /> Thêm ca làm việc mới
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* General settings section */}
        <Card className="bg-app-dark-light border-app-dark-border mb-6">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-6">Cài đặt chung</h2>
            
            {/* Dark mode */}
            <div className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium">Chế độ tối</div>
                <div className="text-sm text-app-dark-text-secondary">
                  Bật chế độ tối để có trải nghiệm xem tốt hơn trong điều kiện ánh sáng yếu
                </div>
              </div>
              <Switch checked={true} disabled />
            </div>
            
            {/* Language */}
            <div className="flex justify-between items-center py-3 border-t border-app-dark-border">
              <div className="font-medium">Ngôn ngữ</div>
              <Select defaultValue={state.userSettings.language}>
                <SelectTrigger className="w-[140px] bg-app-dark border-app-dark-border">
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent className="bg-app-dark-light border-app-dark-border">
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Sound notification */}
            <div className="flex justify-between items-center py-3 border-t border-app-dark-border">
              <div>
                <div className="font-medium">Âm thanh thông báo</div>
                <div className="text-sm text-app-dark-text-secondary">
                  Phát âm thanh khi có thông báo
                </div>
              </div>
              <Switch checked={state.userSettings.alarmSoundEnabled} />
            </div>
            
            {/* Vibration notification */}
            <div className="flex justify-between items-center py-3 border-t border-app-dark-border">
              <div>
                <div className="font-medium">Rung thông báo</div>
                <div className="text-sm text-app-dark-text-secondary">
                  Rung khi có thông báo
                </div>
              </div>
              <Switch checked={state.userSettings.alarmVibrationEnabled} />
            </div>
            
            {/* Weather alerts */}
            <div className="flex justify-between items-center py-3 border-t border-app-dark-border">
              <div>
                <div className="font-medium">Cảnh báo thời tiết</div>
                <div className="text-sm text-app-dark-text-secondary">
                  Nhận cảnh báo về thời tiết cực đoan có thể ảnh hưởng đến lịch làm việc
                </div>
              </div>
              <Switch checked={state.userSettings.weatherWarningEnabled} />
            </div>
          </CardContent>
        </Card>
        
        {/* Data management & app info section */}
        <Card className="bg-app-dark-light border-app-dark-border mb-6">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4">Quản lý dữ liệu</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                className="border-app-dark-border bg-app-dark"
              >
                Sao lưu dữ liệu
              </Button>
              <Button
                variant="outline"
                className="border-app-dark-border bg-app-dark"
              >
                Phục hồi dữ liệu
              </Button>
            </div>
            
            <Button
              variant="destructive"
              className="w-full"
            >
              Xóa tất cả dữ liệu
            </Button>
          </CardContent>
        </Card>
        
        {/* App info */}
        <div className="text-center text-xs text-app-dark-text-secondary mb-8">
          <p>Shift Savvy v1.0.0</p>
          <p>© 2025 - All rights reserved</p>
        </div>
        
        {/* Delete confirmation dialog */}
        <Dialog open={confirmDelete !== null} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent className="bg-app-dark-light border-app-dark-border">
            <DialogHeader>
              <DialogTitle>Xác nhận xóa ca làm việc</DialogTitle>
              <DialogDescription className="text-app-dark-text-secondary">
                Bạn có chắc chắn muốn xóa ca làm việc này? 
                Thao tác này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="bg-app-dark-border"
              >
                Hủy
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDeleteShift}
              >
                Xóa ca làm việc
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SettingsPage;
