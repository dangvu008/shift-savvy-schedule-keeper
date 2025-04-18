
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock } from 'lucide-react';
import { WeekDay, Note } from '@/types/app';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type FormErrors = {
  [key: string]: string;
};

const NoteFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { state, addNote, updateNote } = useAppContext();
  
  // Find note if in edit mode
  const existingNote = isEditMode 
    ? state.notes.find(note => note.id === id) 
    : null;
  
  // Form state
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [reminderTime, setReminderTime] = useState(existingNote?.reminderTime || '');
  const [associatedShiftIds, setAssociatedShiftIds] = useState<string[]>(existingNote?.associatedShiftIds || []);
  const [explicitReminderDays, setExplicitReminderDays] = useState<WeekDay[]>(existingNote?.explicitReminderDays || []);
  
  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  // Handle shift association toggle
  const toggleShiftAssociation = (shiftId: string) => {
    if (associatedShiftIds.includes(shiftId)) {
      setAssociatedShiftIds(associatedShiftIds.filter(id => id !== shiftId));
    } else {
      setAssociatedShiftIds([...associatedShiftIds, shiftId]);
    }
  };
  
  // Handle day selection toggle
  const toggleDay = (day: WeekDay) => {
    if (explicitReminderDays.includes(day)) {
      setExplicitReminderDays(explicitReminderDays.filter(d => d !== day));
    } else {
      setExplicitReminderDays([...explicitReminderDays, day]);
    }
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Check title
    if (!title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (title.length > 100) {
      newErrors.title = 'Tiêu đề quá dài (tối đa 100 ký tự)';
    }
    
    // Check content
    if (!content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    } else if (content.length > 300) {
      newErrors.content = 'Nội dung quá dài (tối đa 300 ký tự)';
    }
    
    // Check reminder time
    if (!reminderTime) {
      newErrors.reminderTime = 'Thời gian nhắc nhở không được để trống';
    }
    
    // Check days if no shifts are associated
    if (associatedShiftIds.length === 0 && explicitReminderDays.length === 0) {
      newErrors.days = 'Vui lòng chọn ít nhất một ngày hoặc liên kết với một ca làm việc';
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
  const saveNote = () => {
    const noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      content,
      reminderTime,
      associatedShiftIds,
      explicitReminderDays
    };
    
    if (isEditMode && existingNote) {
      updateNote({
        ...noteData,
        id: existingNote.id,
        createdAt: existingNote.createdAt,
        updatedAt: new Date().toISOString()
      });
    } else {
      addNote(noteData);
    }
    
    navigate('/');
  };
  
  // Reset form
  const resetForm = () => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setReminderTime(existingNote.reminderTime);
      setAssociatedShiftIds(existingNote.associatedShiftIds);
      setExplicitReminderDays(existingNote.explicitReminderDays);
    } else {
      setTitle('');
      setContent('');
      setReminderTime('');
      setAssociatedShiftIds([]);
      setExplicitReminderDays([]);
    }
    
    setErrors({});
    setShowResetConfirm(false);
  };
  
  // Re-validate when form changes
  useEffect(() => {
    validateForm();
  }, [title, content, reminderTime, associatedShiftIds, explicitReminderDays]);
  
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
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Sửa ghi chú' : 'Thêm ghi chú mới'}
          </h1>
        </div>
        
        <Card className="bg-app-dark-light border-app-dark-border mb-6">
          <CardContent className="p-4">
            {/* Title */}
            <div className="mb-4">
              <Label htmlFor="note-title">Tiêu đề</Label>
              <Input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề ghi chú"
                className="form-input mt-1"
              />
              {errors.title && <p className="text-app-status-error text-sm mt-1">{errors.title}</p>}
              <p className="text-xs text-app-dark-text-muted mt-1">
                {title.length}/100 ký tự
              </p>
            </div>
            
            {/* Content */}
            <div className="mb-4">
              <Label htmlFor="note-content">Nội dung</Label>
              <Textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung ghi chú"
                className="form-input mt-1 min-h-[100px]"
              />
              {errors.content && <p className="text-app-status-error text-sm mt-1">{errors.content}</p>}
              <p className="text-xs text-app-dark-text-muted mt-1">
                {content.length}/300 ký tự
              </p>
            </div>
            
            {/* Reminder Time */}
            <div className="mb-6">
              <Label htmlFor="reminder-time">Thời gian nhắc nhở</Label>
              <div className="relative">
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="form-input mt-1 pl-10"
                />
                <Clock className="absolute left-3 top-[calc(50%+2px)] transform -translate-y-1/2 h-4 w-4 text-app-dark-text-muted" />
              </div>
              {errors.reminderTime && <p className="text-app-status-error text-sm mt-1">{errors.reminderTime}</p>}
            </div>
            
            {/* Associated Shifts */}
            {state.shifts.length > 0 && (
              <div className="mb-6">
                <Label className="mb-2 block">Liên kết với ca làm việc</Label>
                <div className="space-y-2">
                  {state.shifts.map(shift => (
                    <div key={shift.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`shift-${shift.id}`}
                        checked={associatedShiftIds.includes(shift.id)}
                        onCheckedChange={() => toggleShiftAssociation(shift.id)}
                      />
                      <Label
                        htmlFor={`shift-${shift.id}`}
                        className="cursor-pointer text-sm"
                      >
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Explicit Days (only if no shifts are selected) */}
            {associatedShiftIds.length === 0 && (
              <div className="mb-6">
                <Label className="mb-2 block">Chọn ngày trong tuần</Label>
                <div className="grid grid-cols-7 gap-2">
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
                    
                    const isSelected = explicitReminderDays.includes(day);
                    
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
                {errors.days && <p className="text-app-status-error text-sm mt-1">{errors.days}</p>}
              </div>
            )}
            
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
                Lưu ghi chú
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
              <DialogTitle>Xác nhận lưu ghi chú</DialogTitle>
              <DialogDescription className="text-app-dark-text-secondary">
                Bạn có chắc chắn muốn lưu ghi chú này?
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
                onClick={saveNote}
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

export default NoteFormPage;
