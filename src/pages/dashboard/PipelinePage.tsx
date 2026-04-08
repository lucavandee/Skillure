import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Tag, Plus, X, MessageSquare, FileText } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Candidate } from '../../types';
import { mockCandidates } from '../../lib/mock-data';
import { getStoredCandidates } from '../../lib/candidate-store';
import { openCvInNewTab } from '../../lib/cv-viewer';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface CandidateWithPipeline extends Candidate {
  status: 'new' | 'matched' | 'contacted' | 'interviewing' | 'placed';
  notes: Note[];
  tags: string[];
}

const buildInitialPipeline = (): CandidateWithPipeline[] => {
  const stored = getStoredCandidates();
  const combined = [...stored, ...mockCandidates];
  return combined.map((candidate) => ({
    ...candidate,
    status: Math.random() > 0.5 ? 'new' : 'matched',
    notes: [],
    tags: [],
  }));
};

const PipelinePage: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateWithPipeline[]>(() =>
    buildInitialPipeline()
  );

  useEffect(() => {
    const refresh = () => {
      setCandidates((current) => {
        const existingIds = new Set(current.map((c) => c.id));
        const newCandidates = getStoredCandidates().filter(
          (c) => !existingIds.has(c.id)
        );
        if (newCandidates.length === 0) return current;
        const added: CandidateWithPipeline[] = newCandidates.map((c) => ({
          ...c,
          status: 'new',
          notes: [],
          tags: [],
        }));
        return [...added, ...current];
      });
    };
    window.addEventListener('skillure:candidates-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('skillure:candidates-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithPipeline | null>(null);

  const pipelineStages = [
    { id: 'new', label: 'Nieuw' },
    { id: 'matched', label: 'Matched' },
    { id: 'contacted', label: 'Gecontacteerd' },
    { id: 'interviewing', label: 'Gesprekken' },
    { id: 'placed', label: 'Geplaatst' },
  ];

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  const handleDrop = (e: React.DragEvent, status: CandidateWithPipeline['status']) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId ? { ...candidate, status } : candidate
    ));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addNote = (candidateId: string) => {
    if (!newNote.trim()) return;

    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId
        ? {
            ...candidate,
            notes: [
              ...candidate.notes,
              {
                id: Date.now().toString(),
                content: newNote,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        : candidate
    ));
    setNewNote('');
  };

  const addTag = (candidateId: string) => {
    if (!newTag.trim()) return;

    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId
        ? {
            ...candidate,
            tags: [...new Set([...candidate.tags, newTag])],
          }
        : candidate
    ));
    setNewTag('');
  };

  const removeTag = (candidateId: string, tagToRemove: string) => {
    setCandidates(prev => prev.map(candidate => 
      candidate.id === candidateId
        ? {
            ...candidate,
            tags: candidate.tags.filter(tag => tag !== tagToRemove),
          }
        : candidate
    ));
  };

  const exportData = () => {
    const data = candidates.map(({ id, name, role, status, tags, notes }) => ({
      id,
      name,
      gewenste_rol: role,
      status,
      tags: tags.join(', '),
      notes: notes.map(note => note.content).join(' | '),
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(value => `"${value}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-lightgray-500 min-h-screen py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vacaturepipeline</h1>
            <p className="text-gray-600">
              Beheer uw kandidaten door de verschillende fases van het recruitmentproces
            </p>
          </div>
          <Button
            variant="outline"
            leftIcon={<Download size={18} />}
            onClick={exportData}
          >
            Exporteer Data
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {pipelineStages.map(stage => (
            <div key={stage.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{stage.label}</h3>
                <Badge variant="secondary">
                  {candidates.filter(c => c.status === stage.id).length}
                </Badge>
              </div>

              <div
                className="bg-white rounded-lg p-4 flex-1 min-h-[500px]"
                onDrop={e => handleDrop(e, stage.id as CandidateWithPipeline['status'])}
                onDragOver={handleDragOver}
              >
                {candidates
                  .filter(candidate => candidate.status === stage.id)
                  .map(candidate => (
                    <motion.div
                      key={candidate.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4"
                    >
                      <Card
                        hoverable
                        className="cursor-move"
                        draggable
                        onDragStart={e => handleDragStart(e, candidate.id)}
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <div className="flex items-start mb-3">
                          <img
                            src={candidate.avatar}
                            alt={candidate.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-3">
                            <h4 className="font-medium">{candidate.name}</h4>
                            <p className="text-xs text-gray-500">Gewenste rol</p>
                            <p className="text-sm text-gray-700 font-medium">
                              {candidate.role}
                            </p>
                          </div>
                        </div>

                        {candidate.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {candidate.tags.map(tag => (
                              <Badge key={tag} variant="primary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {candidate.notes.length > 0 && (
                          <div className="text-sm text-gray-500 mb-2">
                            <MessageSquare size={14} className="inline mr-1" />
                            {candidate.notes.length} notitie(s)
                          </div>
                        )}

                        {candidate.cvDataUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<FileText size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              openCvInNewTab(
                                candidate.cvDataUrl!,
                                candidate.cvFileName
                              );
                            }}
                          >
                            Bekijk CV
                          </Button>
                        )}
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <img
                      src={selectedCandidate.avatar}
                      alt={selectedCandidate.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{selectedCandidate.name}</h2>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Gewenste rol
                      </p>
                      <p className="text-gray-700 font-medium">
                        {selectedCandidate.role}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* CV Section */}
                {selectedCandidate.cvDataUrl && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3 flex items-center">
                      <FileText size={18} className="mr-2" />
                      CV
                    </h3>
                    <div className="flex items-center justify-between bg-lightgray-500 rounded-lg px-4 py-3">
                      <div className="flex items-center min-w-0">
                        <FileText size={20} className="text-turquoise-700 flex-shrink-0" />
                        <span className="ml-3 text-sm text-gray-700 truncate">
                          {selectedCandidate.cvFileName ?? 'CV-bestand'}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<FileText size={14} />}
                        onClick={() =>
                          openCvInNewTab(
                            selectedCandidate.cvDataUrl!,
                            selectedCandidate.cvFileName
                          )
                        }
                      >
                        Bekijk CV
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tags Section */}
                <div className="mb-6">
                  <h3 className="font-bold mb-3 flex items-center">
                    <Tag size={18} className="mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedCandidate.tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="primary"
                        className="flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(selectedCandidate.id, tag)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Nieuwe tag..."
                      className="input-field py-1.5"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          addTag(selectedCandidate.id);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus size={16} />}
                      onClick={() => addTag(selectedCandidate.id)}
                    >
                      Tag toevoegen
                    </Button>
                  </div>
                </div>

                {/* Notes Section */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center">
                    <FileText size={18} className="mr-2" />
                    Notities
                  </h3>
                  <div className="space-y-3 mb-4">
                    {selectedCandidate.notes.map(note => (
                      <div
                        key={note.id}
                        className="bg-lightgray-500 rounded-lg p-3"
                      >
                        <p className="text-gray-700">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                      placeholder="Nieuwe notitie..."
                      className="input-field py-1.5"
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          addNote(selectedCandidate.id);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Plus size={16} />}
                      onClick={() => addNote(selectedCandidate.id)}
                    >
                      Notitie toevoegen
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PipelinePage;