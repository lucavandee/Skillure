import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Mail, Calendar, Users, BarChart3, Edit3, Save, TrendingUp, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';

interface CompanyStats {
  total_vacancies: number;
  live_vacancies: number;
  draft_vacancies: number;
  filled_vacancies: number;
  fill_rate: number;
  active_rate: number;
}

const CompanyProfilePage: React.FC = () => {
  const { user, getAuthHeaders } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<CompanyStats | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || ''
  });

  useEffect(() => {
    if (user?.role === 'company' || user?.role === 'recruiter') {
      fetchStats();
    }
    setLoading(false);
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/company/stats', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/company/me', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        // Refresh user data would be ideal here
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save profile');
      }
    } catch (err: any) {
      setError(err.message || 'Kon profiel niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightgray-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-turquoise-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user?.role !== 'company' && user?.role !== 'recruiter') {
    return (
      <div className="min-h-screen bg-lightgray-500 py-8">
        <div className="container-custom">
          <Card className="p-8 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profiel niet beschikbaar</h2>
            <p className="text-gray-600">
              Deze pagina is alleen beschikbaar voor bedrijven en recruiters.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title="Bedrijfsprofiel"
        description="Beheer uw bedrijfsprofiel en bekijk statistieken op Skillure."
        canonical="https://skillure.com/profile/company"
      />

      <div className="min-h-screen bg-lightgray-500 py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-midnight mb-2">
                {user?.role === 'company' ? 'Bedrijfsprofiel' : 'Recruiter Profiel'}
              </h1>
              <p className="text-gray-600">
                Beheer uw profiel en bekijk uw recruitment statistieken
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Profile Card */}
            <Card className="p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-turquoise-500 rounded-full flex items-center justify-center text-midnight font-bold text-xl mr-4">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <Badge variant="primary" className="mt-1 capitalize">
                      {user?.role === 'company' ? 'Bedrijf' : 'Recruiter'}
                    </Badge>
                  </div>
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    leftIcon={<Edit3 size={18} />}
                    onClick={() => setEditing(true)}
                  >
                    Bewerken
                  </Button>
                )}
              </div>

              {editing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <Input
                    label={user?.role === 'company' ? 'Bedrijfsnaam' : 'Volledige naam'}
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    icon={<Building size={18} className="text-gray-400" />}
                    placeholder={user?.role === 'company' ? 'Uw bedrijfsnaam' : 'Voor- en achternaam'}
                    required
                  />

                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      leftIcon={<Save size={18} />}
                      onClick={handleSave}
                      isLoading={saving}
                    >
                      Opslaan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({ full_name: user?.full_name || '' });
                      }}
                    >
                      Annuleren
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Building size={18} className="text-gray-400 mr-3" />
                        <span>{user?.full_name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail size={18} className="text-gray-400 mr-3" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={18} className="text-gray-400 mr-3" />
                        <span>Lid sinds {new Date(user?.created_at || '').toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Users size={18} className="text-gray-400 mr-3" />
                        <span className="capitalize">{user?.role}</span>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={user?.is_active ? 'success' : 'error'}>
                          {user?.is_active ? 'Actief' : 'Inactief'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>

            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Totaal Vacatures</p>
                      <p className="text-2xl font-bold">{stats.total_vacancies}</p>
                    </div>
                    <FileText className="w-8 h-8 text-turquoise-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Actieve Vacatures</p>
                      <p className="text-2xl font-bold">{stats.live_vacancies}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ingevulde Vacatures</p>
                      <p className="text-2xl font-bold">{stats.filled_vacancies}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Invulpercentage</p>
                      <p className="text-2xl font-bold">{stats.fill_rate.toFixed(1)}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Snelle acties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="primary"
                  className="h-20 flex-col"
                  onClick={() => window.location.href = '/vacancies/new'}
                >
                  <FileText size={24} className="mb-2" />
                  Nieuwe Vacature
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => window.location.href = '/search'}
                >
                  <Users size={24} className="mb-2" />
                  Zoek Kandidaten
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <BarChart3 size={24} className="mb-2" />
                  Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfilePage;