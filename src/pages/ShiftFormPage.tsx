
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock } from 'lucide-react';
import { WeekDay, Shift } from '@/types/app';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type FormErrors = {
  [key: string]: string;
};

const ShiftFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { state, addShift, updateShift } = useAppContext();
  
  // Find shift if in edit mode
  const existingShift = isEditMode 
    ? state.shifts.find(shift => shift.id === id) 
    : null;
  
  // Form state
  const [name, setName] = useState(existingShift?.name || '');
  const [departureTime, setDepartureTime] = useState(existingShift?.departureTime || '');
  const [startTime, setStartTime] = useState(existingShift?.startTime || '');
  const [officeEndTime, setOfficeEndTime] = useState(existingShift?.officeEndTime || '');
  const [endTime, setEndTime] = useState(existingShift?.endTime || '');
  const [daysApplied, setDaysApplied] = useState<WeekDay[]>(existingShift?.daysApplied || []);
  const [remindBeforeStart, setRemindBeforeStart] = useState(existingShift?.remindBeforeStart.toString() || '15');
  const [remindAfterEnd, setRemindAfterEnd] = useState(existingShift?.remindAfterEnd.toString() || '15');
  const [breakMinutes, setBreakMinutes] = useState(existingShift?.breakMinutes.toString() || '60');
  const [penaltyRoundingMinutes, setPenaltyRoundingMinutes] = useState(existingShift?.penaltyRoundingMinutes.toString() || '30');
  const [showPunch, setShowPunch] = useState(existingShift?.showPunch || false);
  
  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  // Handle day selection toggle
  const toggleDay = (day: WeekDay) => {
    if (daysApplied.includes(day)) {
      setDaysApplied(daysApplied.filter(d => d !== day));
    } else {
      setDaysApplied([...daysApplied, day]);
    }
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Check name
    if (!name.trim()) {
      newErrors.name = 'Tên ca không được để trống';
    } else if (name.length > 200) {
      newErrors.name = 'Tên ca quá dài (tối đa 200 ký tự)';
    }
    
    // Check if name is unique
    const nameExists = state.shifts.some(
      shift => shift.name.toLowerCase() === name.toLowerCase() && shift.id !== id
    );
    if (nameExists) {
      newErrors.name = 'Tên ca này đã tồn tại';
    }
    
    // Check departure vs start time
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    
    const depTotalMinutes = depHours * 60 + depMinutes;
    const startTotalMinutes = startHours * 60 + startMinutes;
    
    // Handle overnight shifts
    const departureBeforeStart = 
      depTotalMinutes < startTotalMinutes 
        ? startTotalMinutes - depTotalMinutes 
        : (24 * 60 - depTotalMinutes) + startTotalMinutes;
        
    if (departureBeforeStart < 5) {
      newErrors.departureTime = 'Giờ xuất phát phải trước giờ bắt đầu ít nhất 5 phút';
    }
    
    // Check start vs office end time
    const [officeEndHours, officeEndMinutes] = officeEndTime.split(':').map(Number);
    const officeEndTotalMinutes = officeEndHours * 60 + officeEndMinutes;
    
    // Calculate hours between start and office end
    let workHours;
    if (startTotalMinutes < officeEndTotalMinutes) {
      workHours = (officeEndTotalMinutes - startTotalMinutes) / 60;
    } else {
      workHours = ((24 * 60 - startTotalMinutes) + officeEndTotalMinutes) / 60;
    }
    
    if (workHours < 2) {
      newErrors.officeEndTime = 'Thời gian làm việc HC tối thiểu phải là 2 giờ';
    }
    
    // Check office end vs end time
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    // Check if end time is at least equal to office end time
    let isEndAfterOfficeEnd;
    if (officeEndTotalMinutes <= endTotalMinutes) {
      isEndAfterOfficeEnd = true;
    } else {
      const isSameDay = officeEndHours < startHours && endHours < startHours;
      isEndAfterOfficeEnd = isSameDay && endHours < officeEndHours;
    }
    
    if (!isEndAfterOfficeEnd) {
      newErrors.endTime = 'Giờ kết thúc ca phải sau hoặc bằng giờ kết thúc HC';
    }
    
    // Check for minimum 30 min OT if endTime > officeEndTime
    if (officeEndTotalMinutes !== endTotalMinutes) {
      let otMinutes;
      if (endTotalMinutes > officeEndTotalMinutes) {
        otMinutes = endTotalMinutes - officeEndTotalMinutes;
      } else {
        otMinutes = (24 * 60 - officeEndTotalMinutes) + endTotalMinutes;
      }
      
      if (otMinutes < 30) {
        newErrors.endTime = 'Nếu có OT, giờ kết thúc ca phải sau giờ kết thúc HC ít nhất 30 phút';
      }
    }
    
    // Check days
    if (daysApplied.length === 0) {
      newErrors.daysApplied = 'Vui lòng chọn ít nhất một ngày áp dụng ca';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      setShowSaveConfirm(true);
    }
  };
  
  // Save form data
  const saveShift = () => {
    const shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      departureTime,
      startTime,
      officeEndTime,
      endTime,
      daysApplied,
      remindBeforeStart: parseInt(remindBeforeStart, 10),
      remindAfterEnd: parseInt(remindAfterEnd, 10),
      breakMinutes: parseInt(breakMinutes, 10),
      penaltyRoundingMinutes: parseInt(penaltyRoundingMinutes, 10),
      showPunch
    };
    
    if (isEditMode && existingShift) {
      updateShift({
        ...shiftData,
        id: existingShift.id,
        createdAt: existingShift.createdAt,
        updatedAt: new Date().toISOString()
      });
    } else {
      addShift(shiftData);
    }
    
    navigate('/settings');
  };
  
  // Reset form
  const resetForm = () => {
    if (existingShift) {
      setName(existingShift.name);
      setDepartureTime(existingShift.departureTime);
      setStartTime(existingShift.startTime);
      setOfficeEndTime(existingShift.officeEndTime);
      setEndTime(existingShift.endTime);
      setDaysApplied(existingShift.daysApplied);
      setRemindBeforeStart(existingShift.remindBeforeStart.toString());
      setRemindAfterEnd(existingShift.remindAfterEnd.toString());
      setBreakMinutes(existingShift.breakMinutes.toString());
      setPenaltyRoundingMinutes(existingShift.penaltyRoundingMinutes.toString());
      setShowPunch(existingShift.showPunch);
    } else {
      setName('');
      setDepartureTime('');
      setStartTime('');
      setOfficeEndTime('');
      setEndTime('');
      setDaysApplied([]);
      setRemindBeforeStart('15');
      setRemindAfterEnd('15');
      setBreakMinutes('60');
      setPenaltyRoundingMinutes('30');
      setShowPunch(false);
    }
    
    setErrors({});
    setShowResetConfirm(false);
  };
  
  // Re-validate when form changes
  useEffect(() => {
    validateForm();
  }, [name, departureTime, startTime, officeEndTime, endTime, daysApplied]);
  
  return (
    <div className="min-h-screen bg-app-dark text-white">
      <div className="container py-6 max-w-md mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/settings')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Sửa ca làm việc' : 'Thêm ca làm việc mới'}
          </h1>
        </div>
        
        <Card className="bg-app-dark-light border-app-dark-border mb-6">
          <CardContent className="p-4">
            {/* Name */}
            <div className="mb-4">
              <Label htmlFor="shift-name">Tên ca làm việc</Label>
              <Input
                id="shift-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên ca làm việc"
                className="form-input mt-1"
              />
              {errors.name && <p className="text-app-status-error text-sm mt-1">{errors.name}</p>}
            </div>
            
            {/* Departure Time */}
            <div className="mb-4">
              <Label htmlFor="departure-time">Thời gian xuất phát</Label>
              <div className="relative">
                <Input
                  id="departure-time"
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="form-input mt-1 pl-10"
                />
                <Clock className="absolute left-3 top-[calc(50%+2px)] transform -translate-y-1/2 h-4 w-4 text-app-dark-text-muted" />
              </div>
              {errors.departureTime && <p className="text-app-status-error text-sm mt-1">{errors.departureTime}</p>}
            </div>
            
            {/* Start and End Times */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="start-time">Giờ bắt đầu</Label>
                <div className="relative">
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input mt-1 pl-10"
                  />
                  <Clock className="absolute left-3 top-[calc(50%+2px)] transform -translate-y-1/2 h-4 w-4 text-app-dark-text-muted" />
                </div>
                {errors.startTime && <p className="text-app-status-error text-sm mt-1">{errors.startTime}</p>}
              </div>
              
              <div>
                <Label htmlFor="end-time">Giờ kết thúc</Label>
                <div className="relative">
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="form-input mt-1 pl-10"
                  />
                  <Clock className="absolute left-3 top-[calc(50%+2px)] transform -translate-y-1/2 h-4 w-4 text-app-dark-text-muted" />
                </div>
                {errors.endTime && <p className="text-app-status-error text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
            
            {/* Office End Time */}
            <div className="mb-4">
              <Label htmlFor="office-end-time">Giờ kết thúc hành chính</Label>
              <div className="relative">
                <Input
                  id="office-end-time"
                  type="time"
                  value={officeEndTime}
                  onChange={(e) => setOfficeEndTime(e.target.value)}
                  className="form-input mt-1 pl-10"
                />
                <Clock className="absolute left-3 top-[calc(50%+2px)] transform -translate-y-1/2 h-4 w-4 text-app-dark-text-muted" />
              </div>
              {errors.officeEndTime && <p className="text-app-status-error text-sm mt-1">{errors.officeEndTime}</p>}
            </div>
            
            {/* Days Applied */}
            <div className="mb-6">
              <Label>Ngày áp dụng trong tuần</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as WeekDay[]).map((day) => {
                  const dayLabel = {
                    'Mon': 'T2',
                    'Tue': 'T3',
                    'Wed': 'T4',
                    'Thu': 'T5',
                    'Fri': 'T6',
                    'Sat': 'T7',
                    'Sun': 'CN'
                  }[day];
                  
                  const isSelected = daysApplied.includes(day);
                  
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`rounded-full p-0 h-10 ${
                        isSelected 
                          ? 'bg-app-purple hover:bg-app-purple-hover' 
                          : 'bg-app-dark border-app-dark-border'
                      }`}
                      onClick={() => toggleDay(day)}
                    >
                      {dayLabel}
                    </Button>
                  );
                })}
              </div>
              {errors.daysApplied && <p className="text-app-status-error text-sm mt-1">{errors.daysApplied}</p>}
            </div>
            
            {/* Reminders */}
            <div className="mb-4">
              <Label htmlFor="remind-before">Nhắc nhở trước giờ vào làm</Label>
              <Select 
                value={remindBeforeStart} 
                onValueChange={setRemindBeforeStart}
              >
                <SelectTrigger id="remind-before" className="form-input mt-1">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent className="bg-app-dark-light border-app-dark-border">
                  <SelectItem value="5">5 phút</SelectItem>
                  <SelectItem value="10">10 phút</SelectItem>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="60">1 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="remind-after">Nhắc nhở sau giờ làm</Label>
              <Select 
                value={remindAfterEnd} 
                onValueChange={setRemindAfterEnd}
              >
                <SelectTrigger id="remind-after" className="form-input mt-1">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent className="bg-app-dark-light border-app-dark-border">
                  <SelectItem value="5">5 phút</SelectItem>
                  <SelectItem value="10">10 phút</SelectItem>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="60">1 giờ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Break and Penalty Minutes */}
            <div className="mb-4">
              <Label htmlFor="break-minutes">Thời gian nghỉ (phút)</Label>
              <Input
                id="break-minutes"
                type="number"
                min="0"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                className="form-input mt-1"
              />
            </div>
            
            <div className="mb-4">
              <Label htmlFor="penalty-rounding">Làm tròn phút phạt (lên bội số)</Label>
              <Select 
                value={penaltyRoundingMinutes} 
                onValueChange={setPenaltyRoundingMinutes}
              >
                <SelectTrigger id="penalty-rounding" className="form-input mt-1">
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent className="bg-app-dark-light border-app-dark-border">
                  <SelectItem value="5">5 phút</SelectItem>
                  <SelectItem value="10">10 phút</SelectItem>
                  <SelectItem value="15">15 phút</SelectItem>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="60">60 phút</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Show Punch */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label htmlFor="show-punch" className="cursor-pointer">Hiển thị nút Ký công</Label>
                <p className="text-sm text-app-dark-text-secondary">
                  Hiển thị nút ký công khi đang làm việc
                </p>
              </div>
              <Switch
                id="show-punch"
                checked={showPunch}
                onCheckedChange={setShowPunch}
              />
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-between gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 bg-app-dark-border"
              >
                Đặt lại
              </Button>
              <Button
                type="button"
                disabled={Object.keys(errors).length > 0}
                onClick={handleSubmit}
                className="flex-1 bg-app-purple hover:bg-app-purple-hover"
              >
                Lưu ca làm việc
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Reset confirmation dialog */}
        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <DialogContent className="bg-app-dark-light border-app-dark-border">
            <DialogHeader>
              <DialogTitle>Xác nhận đặt lại</DialogTitle>
              <DialogDescription className="text-app-dark-text-secondary">
                Bạn có chắc chắn muốn đặt lại form? 
                Mọi thay đổi chưa lưu sẽ bị mất.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                className="bg-app-dark-border"
              >
                Hủy
              </Button>
              <Button 
                variant="default"
                onClick={resetForm}
                className="bg-app-purple hover:bg-app-purple-hover"
              >
                Đặt lại
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Save confirmation dialog */}
        <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
          <DialogContent className="bg-app-dark-light border-app-dark-border">
            <DialogHeader>
              <DialogTitle>Xác nhận lưu ca làm việc</DialogTitle>
              <DialogDescription className="text-app-dark-text-secondary">
                Bạn có chắc chắn muốn lưu ca làm việc này?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveConfirm(false)}
                className="bg-app-dark-border"
              >
                Hủy
              </Button>
              <Button 
                variant="default"
                onClick={saveShift}
                className="bg-app-purple hover:bg-app-purple-hover"
              >
                Lưu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ShiftFormPage;
