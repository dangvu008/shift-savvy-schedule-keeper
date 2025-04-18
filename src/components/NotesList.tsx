
import React from 'react';
import { Note } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';

interface NotesListProps {
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote
}) => {
  // Sort notes by reminder time and take top 3
  const sortedNotes = [...notes]
    .sort((a, b) => {
      // First sort by reminder time
      const timeA = a.reminderTime || '99:99';
      const timeB = b.reminderTime || '99:99';
      if (timeA !== timeB) return timeA.localeCompare(timeB);
      
      // If reminder times are equal, sort by last updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 3);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Ghi chú</h2>
        <Button
          onClick={onAddNote}
          variant="outline"
          className="flex items-center gap-1 bg-app-dark-light border-app-dark-border"
        >
          <Plus className="h-4 w-4" /> Thêm ghi chú
        </Button>
      </div>

      {sortedNotes.length === 0 ? (
        <Card className="bg-app-dark-light border-app-dark-border">
          <CardContent className="p-6 text-center text-app-dark-text-secondary">
            Chưa có ghi chú nào
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedNotes.map(note => (
            <Card key={note.id} className="bg-app-dark-light border-app-dark-border">
              <CardHeader className="p-3 pb-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium truncate">
                    {note.title}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditNote(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-app-status-error"
                      onClick={() => onDeleteNote(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-sm text-app-dark-text-secondary truncate">
                  {note.content}
                </p>
                <div className="mt-2 text-xs text-app-dark-text-muted">
                  Nhắc nhở: {note.reminderTime || 'Không có'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
