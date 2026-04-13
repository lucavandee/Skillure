import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Tag, Plus, X, MessageSquare, FileText, Clock,
  ChevronDown, Mail, Phone, MapPin, Star, Filter, Search,
  ArrowRight, CheckCircle, AlertCircle, Users,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ats, vacancies, type ApplicationResponse, type VacancyResponse, ApiError } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────

type PipelineStatus = 'ingediend' | 'screening' | 'interview' | 'aanbieding' | 'afgewezen' | 'geplaatst';

interface ActivityEntry {
  id: string;
  applicationId: number;
  fromStatus?: string;
  toStatus: string;
  note?: string;
  timestamp: string;
}

const PIPELINE_STAGES: { id: PipelineStatus; label: string; color: string }[] = [
  { id: 'ingediend', label: 'Ingediend', color: 'bg-blue-100 text-blue-800' },
  { id: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { id: 'aanbieding', label: 'Aanbieding', color: 'bg-green-100 text-green-800' },
  { id: 'geplaatst', label: 'Geplaatst', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'afgewezen', label: 'Afgewezen', color: 'bg-red-100 text-red-800' },
];

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.label]),
);

// ── Component ──────────────────────────────────────────────

const PipelinePage: React.FC = () => {
  // State
  const [myVacancies, setMyVacancies] = useState<VacancyResponse[]>([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<ApplicationResponse | null>(null);
  const [newNote, setNewNote] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApps, setSelectedApps] = useState<Set<number>>(new Set());
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ── Data fetching ────────────────────────────────────────

  const loadVacancies = useCallback(async () => {
    try {
      const data = await vacancies.getMy();
      setMyVacancies(data);
      if (data.length > 0 && !selectedVacancyId) {
        setSelectedVacancyId(data[0].id);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Je moet ingelogd zijn om de pipeline te bekijken.');
      } else {
        setError('Kon vacatures niet laden. Controleer of de backend draait.');
      }
    }
  }, [selectedVacancyId]);

  const loadPipeline = useCallback(async () => {
    if (!selectedVacancyId) return;
    setLoading(true);
    try {
      const data = await ats.getPipeline(selectedVacancyId);
      setApplications(data);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Geen toegang tot deze pipeline.');
      } else {
        setError('Kon pipeline data niet laden.');
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [selectedVacancyId]);

  useEffect(() => {
    loadVacancies();
  }, [loadVacancies]);

  useEffect(() => {
    if (selectedVacancyId) {
      loadPipeline();
    }
  }, [selectedVacancyId, loadPipeline]);

  // ── Status update (drag or manual) ──────────────────────

  const updateStatus = async (applicationId: number, newStatus: PipelineStatus, note?: string) => {
    const app = applications.find((a) => a.application_id === applicationId);
    if (!app) return;

    const oldStatus = app.status;
    if (oldStatus === newStatus) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) =>
        a.application_id === applicationId ? { ...a, status: newStatus } : a,
      ),
    );

    try {
      setUpdatingStatus(true);
      await ats.updateApplicationStatus(applicationId, newStatus, note);

      // Log activity
      const entry: ActivityEntry = {
        id: `${Date.now()}-${applicationId}`,
        applicationId,
        fromStatus: oldStatus,
        toStatus: newStatus,
        note,
        timestamp: new Date().toISOString(),
      };
      setActivityLog((prev) => [entry, ...prev]);
    } catch {
      // Revert on failure
      setApplications((prev) =>
        prev.map((a) =>
          a.application_id === applicationId ? { ...a, status: oldStatus } : a,
        ),
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Drag and Drop (cross-column) ────────────────────────

  const handleDragStart = (e: React.DragEvent, applicationId: number) => {
    e.dataTransfer.setData('applicationId', String(applicationId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(stageId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: PipelineStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const applicationId = Number(e.dataTransfer.getData('applicationId'));
    if (applicationId) {
      updateStatus(applicationId, newStatus);
    }
  };

  // ── Bulk actions ─────────────────────────────────────────

  const toggleSelect = (appId: number) => {
    setSelectedApps((prev) => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId);
      else next.add(appId);
      return next;
    });
  };

  const bulkUpdateStatus = async (newStatus: PipelineStatus) => {
    for (const appId of selectedApps) {
      await updateStatus(appId, newStatus);
    }
    setSelectedApps(new Set());
  };

  // ── Export ───────────────────────────────────────────────

  const exportData = () => {
    if (applications.length === 0) return;
    const headers = ['Naam', 'Email', 'Locatie', 'Status', 'Match Score', 'Datum', 'Notities'];
    const rows = applications.map((app) => [
      app.candidate_name ?? '',
      app.candidate_email ?? '',
      app.candidate_location ?? '',
      STATUS_LABELS[app.status] ?? app.status,
      String(app.match_score),
      new Date(app.applied_at).toLocaleDateString('nl-NL'),
      (app.notes ?? '').replace(/"/g, '""'),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-export-${selectedVacancyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filtered applications ────────────────────────────────

  const filteredApps = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.candidate_name?.toLowerCase().includes(term) ||
      app.candidate_email?.toLowerCase().includes(term) ||
      app.candidate_location?.toLowerCase().includes(term)
    );
  });

  const getStageApps = (stageId: string) =>
    filteredApps.filter((app) => app.status === stageId);

  // ── Render ───────────────────────────────────────────────

  const selectedVacancy = myVacancies.find((v) => v.id === selectedVacancyId);

  return (
    <div className="bg-lightgray-500 min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">Pipeline</h1>
            <p className="text-gray-600">
              Beheer kandidaten door het werving &amp; selectieproces
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedApps.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedApps.size} geselecteerd</span>
                <select
                  className="input-field py-1.5 px-3 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      bulkUpdateStatus(e.target.value as PipelineStatus);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Verplaats naar...</option>
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={exportData}
              disabled={applications.length === 0}
            >
              Exporteer
            </Button>
          </div>
        </div>

        {/* Vacancy selector + search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <select
              className="input-field"
              value={selectedVacancyId ?? ''}
              onChange={(e) => setSelectedVacancyId(Number(e.target.value))}
            >
              <option value="" disabled>Kies een vacature...</option>
              {myVacancies.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title} — {v.location} ({v.status})
                </option>
              ))}
            </select>
          </div>
          <div className="relative sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Zoek kandidaat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {/* Stats bar */}
        {selectedVacancy && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
            {PIPELINE_STAGES.map((stage) => {
              const count = getStageApps(stage.id).length;
              return (
                <div key={stage.id} className="bg-white rounded-lg px-4 py-3 text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs text-gray-500">{stage.label}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-turquoise-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && applications.length === 0 && selectedVacancyId && (
          <div className="bg-white rounded-lg border border-lightgray-800 p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold mb-2">Nog geen sollicitaties</h3>
            <p className="text-gray-600">
              Er zijn nog geen kandidaten in de pipeline voor deze vacature.
            </p>
          </div>
        )}

        {/* Pipeline board */}
        {!loading && !error && applications.length > 0 && (
          <div className="overflow-x-auto pb-6">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-6 gap-4">
                {PIPELINE_STAGES.map((stage) => {
                  const stageApps = getStageApps(stage.id);
                  const isDragOver = dragOverColumn === stage.id;

                  return (
                    <div key={stage.id} className="flex flex-col">
                      {/* Column header */}
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm">{stage.label}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {stageApps.length}
                          </Badge>
                        </div>
                      </div>

                      {/* Drop zone */}
                      <div
                        className={`rounded-lg p-2 flex-1 min-h-[400px] transition-colors ${
                          isDragOver
                            ? 'bg-turquoise-50 border-2 border-dashed border-turquoise-400'
                            : 'bg-gray-50 border-2 border-transparent'
                        }`}
                        onDragOver={(e) => handleDragOver(e, stage.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, stage.id)}
                      >
                        <AnimatePresence>
                          {stageApps.map((app) => (
                            <motion.div
                              key={app.application_id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="mb-2"
                            >
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, app.application_id)}
                                onClick={() => setSelectedApp(app)}
                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input
                                      type="checkbox"
                                      checked={selectedApps.has(app.application_id)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleSelect(app.application_id);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="rounded text-turquoise-500 h-3.5 w-3.5 flex-shrink-0"
                                    />
                                    <h4 className="font-medium text-sm truncate">
                                      {app.candidate_name ?? `Kandidaat #${app.candidate_id}`}
                                    </h4>
                                  </div>
                                  {app.match_score > 0 && (
                                    <span className="text-xs font-bold text-turquoise-600 flex-shrink-0">
                                      {app.match_score}%
                                    </span>
                                  )}
                                </div>

                                {app.candidate_location && (
                                  <div className="flex items-center text-xs text-gray-500 mb-1">
                                    <MapPin size={12} className="mr-1 flex-shrink-0" />
                                    <span className="truncate">{app.candidate_location}</span>
                                  </div>
                                )}

                                <div className="flex items-center text-xs text-gray-400 mt-2">
                                  <Clock size={12} className="mr-1" />
                                  {new Date(app.applied_at).toLocaleDateString('nl-NL')}
                                </div>

                                {app.notes && (
                                  <div className="flex items-center text-xs text-gray-400 mt-1">
                                    <MessageSquare size={12} className="mr-1" />
                                    <span className="truncate">{app.notes}</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Candidate Detail Modal */}
        <AnimatePresence>
          {selectedApp && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedApp(null)}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedApp.candidate_name ?? `Kandidaat #${selectedApp.candidate_id}`}
                      </h2>
                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                        {selectedApp.candidate_email && (
                          <a href={`mailto:${selectedApp.candidate_email}`} className="flex items-center hover:text-turquoise-600">
                            <Mail size={14} className="mr-1" />
                            {selectedApp.candidate_email}
                          </a>
                        )}
                        {selectedApp.candidate_phone && (
                          <a href={`tel:${selectedApp.candidate_phone}`} className="flex items-center hover:text-turquoise-600">
                            <Phone size={14} className="mr-1" />
                            {selectedApp.candidate_phone}
                          </a>
                        )}
                      </div>
                      {selectedApp.candidate_location && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin size={14} className="mr-1" />
                          {selectedApp.candidate_location}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedApp(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Match score */}
                  {selectedApp.match_score > 0 && (
                    <div className="mb-6 bg-turquoise-50 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Match Score</span>
                        <div className="text-3xl font-bold text-turquoise-600">{selectedApp.match_score}%</div>
                      </div>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-turquoise-500 rounded-full transition-all"
                          style={{ width: `${selectedApp.match_score}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status changer */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {PIPELINE_STAGES.map((stage) => (
                        <button
                          key={stage.id}
                          onClick={() => updateStatus(selectedApp.application_id, stage.id)}
                          disabled={updatingStatus}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedApp.status === stage.id
                              ? stage.color + ' ring-2 ring-offset-1 ring-turquoise-400'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Activity timeline */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Activiteit</h3>
                    <div className="space-y-3">
                      {activityLog
                        .filter((entry) => entry.applicationId === selectedApp.application_id)
                        .map((entry) => (
                          <div key={entry.id} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-turquoise-500 mt-2 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-gray-700">
                                Status gewijzigd van{' '}
                                <span className="font-medium">{STATUS_LABELS[entry.fromStatus ?? ''] ?? entry.fromStatus}</span>
                                {' '}naar{' '}
                                <span className="font-medium">{STATUS_LABELS[entry.toStatus] ?? entry.toStatus}</span>
                              </p>
                              {entry.note && <p className="text-gray-500 mt-0.5">{entry.note}</p>}
                              <p className="text-gray-400 text-xs mt-0.5">
                                {new Date(entry.timestamp).toLocaleString('nl-NL')}
                              </p>
                            </div>
                          </div>
                        ))}
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-gray-700">Sollicitatie ingediend</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {new Date(selectedApp.applied_at).toLocaleString('nl-NL')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Notities</h3>
                    {selectedApp.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{selectedApp.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Voeg een notitie toe..."
                        className="input-field py-2 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newNote.trim()) {
                            updateStatus(selectedApp.application_id, selectedApp.status as PipelineStatus, newNote.trim());
                            setNewNote('');
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Plus size={16} />}
                        onClick={() => {
                          if (newNote.trim()) {
                            updateStatus(selectedApp.application_id, selectedApp.status as PipelineStatus, newNote.trim());
                            setNewNote('');
                          }
                        }}
                      >
                        Toevoegen
                      </Button>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-2">
                    {selectedApp.candidate_email && (
                      <a
                        href={`mailto:${selectedApp.candidate_email}?subject=Betreft uw sollicitatie`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-turquoise-500 text-midnight rounded-md hover:bg-turquoise-600 transition-colors text-sm font-medium"
                      >
                        <Mail size={14} />
                        E-mail versturen
                      </a>
                    )}
                    {selectedApp.candidate_phone && (
                      <a
                        href={`tel:${selectedApp.candidate_phone}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-midnight text-midnight rounded-md hover:bg-midnight hover:text-white transition-colors text-sm font-medium"
                      >
                        <Phone size={14} />
                        Bellen
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PipelinePage;
