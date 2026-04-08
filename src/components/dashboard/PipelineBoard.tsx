import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MapPin, Calendar, FileText } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Candidate } from '../../types';
import { mockCandidates } from '../../lib/mock-data';
import { getStoredCandidates } from '../../lib/candidate-store';
import { viewCv } from '../../lib/cv-viewer';

const columns = [
  { id: 'nieuw', title: 'Nieuw' },
  { id: 'matched', title: 'Matched' },
  { id: 'gecontacteerd', title: 'Gecontacteerd' },
  { id: 'gesprek', title: 'Gesprek' },
  { id: 'geplaatst', title: 'Geplaatst' }
];

const mergeCandidates = (): Candidate[] => [
  ...getStoredCandidates(),
  ...mockCandidates,
];

const PipelineBoard: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(() => mergeCandidates());

  useEffect(() => {
    const refresh = () => setCandidates(mergeCandidates());
    window.addEventListener('skillure:candidates-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('skillure:candidates-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setCandidates((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = [...items];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        
        return newItems;
      });
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-[1200px]">
        <div className="grid grid-cols-5 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{column.title}</h3>
                <Badge variant="secondary">
                  {candidates.filter((c) => c.status === column.id).length}
                </Badge>
              </div>

              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={candidates.filter((c) => c.status === column.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {candidates
                      .filter((candidate) => candidate.status === column.id)
                      .map((candidate) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="cursor-move"
                        >
                          <Card className="p-4 hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-3">
                              <img
                                src={candidate.avatar}
                                alt={candidate.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="flex-grow">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium">
                                      {candidate.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      Gewenste rol
                                    </p>
                                    <p className="text-sm text-gray-700 font-medium">
                                      {candidate.role}
                                    </p>
                                  </div>
                                  <Badge variant="primary">
                                    {candidate.matchScore}%
                                  </Badge>
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <MapPin size={14} className="mr-1" />
                                    {candidate.location}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar size={14} className="mr-1" />
                                    {new Date(candidate.date).toLocaleDateString('nl-NL')}
                                  </div>
                                </div>
                                {candidate.cvStoragePath && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    leftIcon={<FileText size={14} />}
                                    className="mt-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void viewCv(
                                        candidate.cvStoragePath!,
                                        candidate.cvFileName
                                      );
                                    }}
                                  >
                                    Bekijk CV
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineBoard;