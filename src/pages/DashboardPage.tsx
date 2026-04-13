import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, TrendingUp, Users, Download, BarChart2,
  Briefcase, CheckCircle, AlertCircle, ArrowRight, Eye, PauseCircle,
} from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ChartCard from '../components/dashboard/ChartCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import {
  company,
  vacancies,
  candidates,
  ats,
  type VacancyResponse,
} from '../lib/api';

interface DashboardData {
  stats: {
    total_vacancies: number;
    live_vacancies: number;
    draft_vacancies: number;
    filled_vacancies: number;
    fill_rate: number;
    active_rate: number;
  };
  recent_vacancies: Array<{
    id: number;
    title: string;
    status: string;
    created_at: string;
    branch: string;
    location: string;
  }>;
  notifications: unknown[];
  quick_actions: Array<{ label: string; action: string }>;
}

interface CandidateStats {
  profile_completed: boolean;
  completion_percentage?: number;
  skills_count: number;
  profile_views: number;
  applications_sent: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  live: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  filled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  archived: 'bg-gray-200 text-gray-600',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Concept',
  live: 'Actief',
  paused: 'Gepauzeerd',
  filled: 'Ingevuld',
  cancelled: 'Geannuleerd',
  archived: 'Gearchiveerd',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isRecruiterOrCompany = user?.role === 'recruiter' || user?.role === 'company' || user?.role === 'admin';

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [candidateStats, setCandidateStats] = useState<CandidateStats | null>(null);
  const [myVacancies, setMyVacancies] = useState<VacancyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (isRecruiterOrCompany) {
          const [dashboard, vacs] = await Promise.all([
            company.getDashboard(),
            vacancies.getMy(),
          ]);
          setDashboardData(dashboard);
          setMyVacancies(vacs);
        } else {
          // Candidate dashboard
          const stats = await candidates.getMyStats();
          setCandidateStats(stats);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kan dashboardgegevens niet laden';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isRecruiterOrCompany]);

  // Build chart data from real vacancies
  const branchData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    myVacancies.forEach((v) => {
      const branch = v.branch || 'Overig';
      counts[branch] = (counts[branch] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [myVacancies]);

  const statusData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    myVacancies.forEach((v) => {
      const label = STATUS_LABELS[v.status] || v.status;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [myVacancies]);

  const handleExport = () => {
    if (!myVacancies.length) return;

    const BOM = '\uFEFF';
    const header = 'Titel,Branche,Locatie,Status,Tarief Min,Tarief Max,Aangemaakt\n';
    const rows = myVacancies.map((v) =>
      `"${v.title}","${v.branch}","${v.location}","${STATUS_LABELS[v.status] || v.status}",${v.rate_min},${v.rate_max},"${new Date(v.created_at).toLocaleDateString('nl-NL')}"`
    ).join('\n');

    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillure-vacatures-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-lightgray-500 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-3 border-turquoise-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          <Card className="p-8 text-center">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Fout bij laden</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Opnieuw proberen
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // ── Candidate Dashboard ──
  if (!isRecruiterOrCompany && candidateStats) {
    return (
      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welkom, {user?.full_name}</h1>
            <p className="text-gray-600">Overzicht van jouw profiel en sollicitaties</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Profiel Compleet"
              value={candidateStats.completion_percentage ? `${candidateStats.completion_percentage}%` : (candidateStats.profile_completed ? '100%' : 'Onvolledig')}
              icon={<CheckCircle size={20} />}
            />
            <StatsCard
              title="Vaardigheden"
              value={candidateStats.skills_count}
              icon={<TrendingUp size={20} />}
            />
            <StatsCard
              title="Profiel Bekeken"
              value={candidateStats.profile_views}
              icon={<Eye size={20} />}
            />
            <StatsCard
              title="Sollicitaties"
              value={candidateStats.applications_sent}
              icon={<FileText size={20} />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">Snelle acties</h3>
              <div className="space-y-3">
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-lightgray-500 transition-colors"
                >
                  <span className="font-medium">Profiel bijwerken</span>
                  <ArrowRight size={18} className="text-gray-400" />
                </Link>
                <Link
                  to="/search"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-lightgray-500 transition-colors"
                >
                  <span className="font-medium">Vacatures bekijken</span>
                  <ArrowRight size={18} className="text-gray-400" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Recruiter / Company Dashboard ──
  const stats = dashboardData?.stats;
  const recentVacancies = dashboardData?.recent_vacancies ?? [];

  return (
    <div className="bg-lightgray-500 min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Welkom terug, {user?.full_name}. Hier is een overzicht van uw recruitment activiteiten.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={handleExport}
              disabled={!myVacancies.length}
            >
              Exporteer Data
            </Button>
            <Link to="/vacancies/new">
              <Button variant="primary" leftIcon={<Briefcase size={16} />}>
                Nieuwe Vacature
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Totaal Vacatures"
            value={stats?.total_vacancies ?? 0}
            icon={<FileText size={20} />}
            description="alle statussen"
          />
          <StatsCard
            title="Actieve Vacatures"
            value={stats?.live_vacancies ?? 0}
            icon={<TrendingUp size={20} />}
            trend={stats && stats.total_vacancies > 0 ? {
              value: Math.round(stats.active_rate),
              isPositive: stats.active_rate > 0,
            } : undefined}
            description="van totaal"
          />
          <StatsCard
            title="Ingevulde Vacatures"
            value={stats?.filled_vacancies ?? 0}
            icon={<CheckCircle size={20} />}
            trend={stats && stats.total_vacancies > 0 ? {
              value: Math.round(stats.fill_rate),
              isPositive: stats.fill_rate > 0,
            } : undefined}
            description="fill rate"
          />
          <StatsCard
            title="Concept Vacatures"
            value={stats?.draft_vacancies ?? 0}
            icon={<Clock size={20} />}
            description="nog te publiceren"
          />
        </div>

        {/* Recent Vacancies + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Vacancies */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recente Vacatures</h2>
                <Link to="/dashboard/pipeline" className="text-turquoise-600 text-sm font-medium hover:underline">
                  Bekijk pipeline
                </Link>
              </div>

              {recentVacancies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>Nog geen vacatures aangemaakt</p>
                  <Link to="/vacancies/new" className="text-turquoise-600 text-sm font-medium hover:underline mt-2 inline-block">
                    Maak uw eerste vacature aan
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentVacancies.map((v) => (
                    <Link
                      key={v.id}
                      to={`/vacature/${v.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-lightgray-500 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-turquoise-600 transition-colors">
                          {v.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {v.branch} &middot; {v.location} &middot; {new Date(v.created_at).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[v.status] || 'bg-gray-100 text-gray-700'}>
                        {STATUS_LABELS[v.status] || v.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Snelle Acties</h2>
            <div className="space-y-3">
              <Link
                to="/vacancies/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-lightgray-500 transition-colors"
              >
                <div className="w-10 h-10 bg-turquoise-100 rounded-lg flex items-center justify-center text-turquoise-600">
                  <Briefcase size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">Nieuwe vacature</p>
                  <p className="text-xs text-gray-500">Maak een vacature aan</p>
                </div>
              </Link>
              <Link
                to="/search"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-lightgray-500 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Users size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">Zoek kandidaten</p>
                  <p className="text-xs text-gray-500">Doorzoek het bestand</p>
                </div>
              </Link>
              <Link
                to="/dashboard/pipeline"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-lightgray-500 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">Pipeline bekijken</p>
                  <p className="text-xs text-gray-500">Beheer sollicitaties</p>
                </div>
              </Link>
              <Link
                to="/import"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-lightgray-500 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                  <Download size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm">Kandidaten importeren</p>
                  <p className="text-xs text-gray-500">CSV-bestand uploaden</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>

        {/* Charts */}
        {myVacancies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {branchData.length > 0 && (
              <ChartCard
                title="Vacatures per Branche"
                type="pie"
                data={branchData}
                yKey="value"
              />
            )}
            {statusData.length > 0 && (
              <ChartCard
                title="Vacatures per Status"
                type="bar"
                data={statusData}
                xKey="name"
                yKey="value"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
