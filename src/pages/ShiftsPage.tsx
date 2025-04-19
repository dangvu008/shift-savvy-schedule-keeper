
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Shift } from '@/types/app';
import { BottomNav } from '@/components/BottomNav';

const ShiftsPage = () => {
  const { state, setActiveShift, deleteShift } = useAppContext();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSetActiveShift = (id: string) => {
    setActiveShift(id);
  };

  const handleDeleteConfirm = (id: string) => {
    setConfirmDelete(id);
  };

  const confirmDeleteShift = () => {
    if (confirmDelete) {
      deleteShift(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleEditShift = (shift: Shift) => {
    navigate(`/shifts/edit/${shift.id}`);
  };

  // Function to handle dialog open state change
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-app-dark text-white pb-16">
      <div className="container py-6 max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Quản lý ca làm việc</h1>

        <div className="space-y-3">
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
          
          <Button
            variant="outline" 
            className="w-full py-5 border-dashed border-app-dark-border flex items-center justify-center gap-2"
            onClick={() => navigate('/shifts/add')}
          >
            <Plus className="h-4 w-4" /> Thêm ca làm việc mới
          </Button>
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={confirmDelete !== null} onOpenChange={handleDialogOpenChange}>
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
      <BottomNav />
    </div>
  );
};

export default ShiftsPage;
