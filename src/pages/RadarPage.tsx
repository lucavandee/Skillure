import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Radio, MapPin, Calendar, X, Star, Search, Loader2,
  Briefcase, AlertCircle, Clock, Users, ArrowRight, Filter,
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';
import { vacancies, type VacancyResponse } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

const STATUS_COLORS: Record<string, string> = {
  live: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-700',
  paused: 'bg-yellow-100 text-yellow-700',
  filled: 'bg-blue-100 text-blue-700',
};

const STATUS_LABELS: Record<string, string> = {
  live: 'Actief',
  draft: 'Concept',
  paused: 'Gepauzeerd',
  filled: 'Ingevuld',
};

const RadarPage: React.FC = () => {
  const { user } = useAuth();
  const isRecruiterOrCompany = user?.role === 'recruiter' || user?.role === 'company' || user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'alle' | 'mijn'>('alle');
  const [allVacancies, setAllVacancies] = useState<VacancyResponse[]>([]);
  const [myVacancies, setMyVacancies] = useState<VacancyResponse[]>([]);
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises: Promise<VacancyResponse[]>[] = [
          vacancies.list({ status_filter: 'live' }),
        ];
        if (isRecruiterOrCompany) {
          promises.push(vacancies.getMy());
        }

        const results = await Promise.all(promises);
        setAllVacancies(results[0]);
        if (results[1]) setMyVacancies(results[1]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Kan vacatures niet laden';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isRecruiterOrCompany]);

  // Get unique branches and locations for filter dropdowns
  const branches = [...new Set(allVacancies.map((v) => v.branch).filter(Boolean))];
  const locations = [...new Set(allVacancies.map((v) => v.location).filter(Boolean))];

  // Filter logic
  const displayVacancies = (activeTab === 'mijn' ? myVacancies : allVacancies).filter((v) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matches =
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term) ||
        v.branch.toLowerCase().includes(term) ||
        v.location.toLowerCase().includes(term);
      if (!matches) return false;
    }
    if (branchFilter && v.branch !== branchFilter) return false;
    if (locationFilter && v.location !== locationFilter) return false;
    return true;
  });

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const getDaysAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Vandaag';
    if (diff === 1) return 'Gisteren';
    return `${diff} dagen geleden`;
  };

  return (
    <>
      <MetaTags
        title="Vacature Radar - Overzicht van beschikbare vacatures"
        description="Bekijk alle beschikbare vacatures en match direct de beste kandidaten uit uw bestand."
        canonical="https://skillure.com/radar"
      />

      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-midnight mb-4">Vacature Radar</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Overzicht van alle beschikbare vacatures. Bekijk details, match kandidaten
              en beheer uw eigen vacatures op een centrale plek.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('alle')}
              className={`w-full sm:w-auto text-center py-3 px-4 transition-colors ${
                activeTab === 'alle'
                  ? 'border-b-2 border-turquoise-500 text-midnight font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Alle vacatures ({allVacancies.length})
            </button>
            {isRecruiterOrCompany && (
              <button
                onClick={() => setActiveTab('mijn')}
                className={`w-full sm:w-auto text-center py-3 px-4 transition-colors ${
                  activeTab === 'mijn'
                    ? 'border-b-2 border-turquoise-500 text-midnight font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Mijn vacatures ({myVacancies.length})
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-grow relative">
              <input
                type="text"
                placeholder="Zoek op titel, branche of locatie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field py-2 px-3 text-sm"
            >
              <option value="">Alle branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input-field py-2 px-3 text-sm"
            >
              <option value="">Alle locaties</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin text-turquoise-500 mx-auto mb-4" />
              <p className="text-gray-600">Vacatures laden...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-6 mb-6 border-red-200">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            </Card>
          )}

          {/* Vacancy Cards Grid */}
          {!loading && displayVacancies.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayVacancies.map((vacancy) => (
                <motion.div
                  key={vacancy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card
                    className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer"
                    hoverable
                    onClick={() => setSelectedVacancy(vacancy)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={STATUS_COLORS[vacancy.status] || 'bg-gray-100 text-gray-700'}>
                            {STATUS_LABELS[vacancy.status] || vacancy.status}
                          </Badge>
                          <span className="text-xs text-gray-500">{vacancy.branch}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-midnight mb-1 line-clamp-2">
                          {vacancy.title}
                        </h2>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(vacancy.id);
                        }}
                        className={`p-1 rounded-full hover:bg-lightgray-500 transition-colors ${
                          favorites.includes(vacancy.id) ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        aria-label={favorites.includes(vacancy.id) ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
                      >
                        <Star size={16} fill={favorites.includes(vacancy.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        {vacancy.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={14} className="mr-2 text-gray-400" />
                        {vacancy.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase size={14} className="mr-2 text-gray-400" />
                        {vacancy.rate_min} - {vacancy.rate_max} /uur
                      </div>
                      {vacancy.availability && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {vacancy.availability}
                        </div>
                      )}
                    </div>

                    {/* Description preview */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {vacancy.description}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto">
                      <p className="text-xs text-gray-400 mb-3">
                        Geplaatst {getDaysAgo(vacancy.created_at)}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          to={`/vacature/${vacancy.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <Button variant="primary" size="sm" className="w-full">
                            Bekijk details
                          </Button>
                        </Link>
                        {isRecruiterOrCompany && (
                          <Link
                            to="/search"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" size="sm" leftIcon={<Users size={14} />}>
                              Match
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && displayVacancies.length === 0 && (
            <div className="text-center text-gray-700 mt-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-lightgray-500 rounded-full mb-4">
                <Radio size={24} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Geen vacatures gevonden</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || branchFilter || locationFilter
                  ? 'Pas uw filters aan om meer resultaten te zien.'
                  : 'Er zijn momenteel geen actieve vacatures beschikbaar.'}
              </p>
              {(searchTerm || branchFilter || locationFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setBranchFilter('');
                    setLocationFilter('');
                  }}
                >
                  Wis filters
                </Button>
              )}
            </div>
          )}

          {/* Vacancy Detail Modal */}
          <AnimatePresence>
            {selectedVacancy && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="vacancy-modal-title"
                onClick={() => setSelectedVacancy(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={STATUS_COLORS[selectedVacancy.status] || 'bg-gray-100 text-gray-700'}>
                            {STATUS_LABELS[selectedVacancy.status] || selectedVacancy.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{selectedVacancy.branch}</span>
                        </div>
                        <h2 id="vacancy-modal-title" className="text-2xl font-bold">
                          {selectedVacancy.title}
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedVacancy(null)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Sluit modal"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="font-bold mb-3">Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <MapPin size={16} className="mr-2" />
                            {selectedVacancy.location}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock size={16} className="mr-2" />
                            {selectedVacancy.duration}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Briefcase size={16} className="mr-2" />
                            {selectedVacancy.rate_min} - {selectedVacancy.rate_max} /uur
                          </div>
                          {selectedVacancy.availability && (
                            <div className="flex items-center text-gray-600">
                              <Calendar size={16} className="mr-2" />
                              {selectedVacancy.availability}
                            </div>
                          )}
                          {selectedVacancy.big_number && (
                            <div className="text-sm text-gray-500">
                              BIG/KvK: {selectedVacancy.big_number}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold mb-3">Tijdlijn</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p>Aangemaakt: {new Date(selectedVacancy.created_at).toLocaleDateString('nl-NL')}</p>
                          {selectedVacancy.updated_at && (
                            <p>Bijgewerkt: {new Date(selectedVacancy.updated_at).toLocaleDateString('nl-NL')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold mb-3">Beschrijving</h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {selectedVacancy.description}
                      </p>
                    </div>

                    <div className="border-t border-lightgray-800 pt-4 flex gap-3">
                      <Link to={`/vacature/${selectedVacancy.id}`} className="flex-1">
                        <Button variant="primary" className="w-full">
                          Volledige pagina bekijken
                        </Button>
                      </Link>
                      {isRecruiterOrCompany && (
                        <Link to="/search">
                          <Button variant="outline" leftIcon={<Users size={16} />}>
                            Kandidaten zoeken
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default RadarPage;
