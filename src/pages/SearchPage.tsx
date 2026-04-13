import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, X, MapPin, Calendar, Mail, Phone,
  Star, ExternalLink, AlertCircle, Loader2, ChevronDown,
} from 'lucide-react';
import { SearchFilters } from '../components/search/SearchFilters';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';
import { candidates, type CandidateProfileResponse } from '../lib/api';
import { FilterOptions } from '../types';

const PAGE_SIZE = 20;

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<CandidateProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfileResponse | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [filters, setFilters] = useState<FilterOptions>({
    experience: [],
    location: [],
    skills: [],
    availability: [],
    languages: [],
    matchScore: 0,
    remote: undefined,
    branch: [],
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch candidates from API
  const fetchCandidates = useCallback(async (offset = 0, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const params: {
        skill?: string;
        location?: string;
        availability?: string;
        skip?: number;
        limit?: number;
      } = {
        skip: offset,
        limit: PAGE_SIZE,
      };

      // Use search term as skill filter
      if (debouncedSearch) params.skill = debouncedSearch;

      // Apply sidebar filters
      if (filters.location && filters.location.length > 0) {
        params.location = filters.location[0]; // API accepts single location
      }
      if (filters.availability && filters.availability.length > 0) {
        params.availability = filters.availability[0];
      }
      if (filters.skills && filters.skills.length > 0 && !debouncedSearch) {
        params.skill = filters.skills[0]; // API accepts single skill
      }

      const data = await candidates.search(params);
      if (append) {
        setResults((prev) => [...prev, ...data]);
      } else {
        setResults(data);
      }
      setHasMore(data.length === PAGE_SIZE);
      setSkip(offset + data.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kan kandidaten niet laden';
      setError(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, filters]);

  // Re-fetch when search or filters change
  useEffect(() => {
    fetchCandidates(0, false);
  }, [fetchCandidates]);

  const handleLoadMore = () => {
    fetchCandidates(skip, true);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleFavorite = (candidateId: number) => {
    setFavorites((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const getSkillLevel = (level: number): string => {
    if (level >= 5) return 'Expert';
    if (level >= 4) return 'Senior';
    if (level >= 3) return 'Medior';
    if (level >= 2) return 'Junior';
    return 'Starter';
  };

  return (
    <>
      <MetaTags
        title="Zoek Kandidaten"
        description="Vind de beste kandidaten voor uw vacature met Skillure."
        canonical="https://skillure.com/search"
        type="website"
      />

      <div className="bg-lightgray-500 min-h-screen">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Zoek Kandidaten</h1>
            <p className="text-gray-600">
              Doorzoek het kandidatenbestand op vaardigheden, locatie en beschikbaarheid
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="sticky top-24">
                <SearchFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="w-full lg:w-3/4">
              {/* Search Bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="flex-grow relative">
                  <Input
                    placeholder="Zoek op vaardigheid (bijv. Python, React, AWS...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<Search size={18} className="text-gray-400" />}
                    className="pr-10"
                  />
                  {searchTerm && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={clearSearch}
                      aria-label="Wis zoekopdracht"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  leftIcon={<SlidersHorizontal size={18} />}
                  className="lg:hidden"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  aria-expanded={showMobileFilters}
                  aria-controls="mobile-filters"
                >
                  Filters
                </Button>
              </div>

              {/* Mobile Filters */}
              {showMobileFilters && (
                <div id="mobile-filters" className="mb-6 lg:hidden">
                  <SearchFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              )}

              {/* Results Header */}
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600" aria-live="polite">
                  {loading ? 'Zoeken...' : `${results.length} kandidaten gevonden`}
                </p>
              </div>

              {/* Error State */}
              {error && (
                <Card className="p-6 mb-6 border-red-200">
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                  </div>
                </Card>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 size={32} className="animate-spin text-turquoise-500 mx-auto mb-4" />
                  <p className="text-gray-600">Kandidaten laden...</p>
                </div>
              )}

              {/* Results Grid */}
              {!loading && results.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {results.map((candidate) => (
                      <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <Card
                          className="h-full flex flex-col cursor-pointer hover:border-turquoise-400 transition-all duration-300"
                          hoverable
                          bordered
                          onClick={() => setSelectedCandidate(candidate)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="w-14 h-14 rounded-full bg-turquoise-100 text-turquoise-700 flex items-center justify-center text-lg font-bold">
                                {(candidate.summary || 'K').charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <h3 className="font-bold text-lg">Kandidaat #{candidate.id}</h3>
                                {candidate.location && (
                                  <p className="text-sm text-gray-500 flex items-center mt-1">
                                    <MapPin size={14} className="mr-1" />
                                    {candidate.location}
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(candidate.id);
                              }}
                              className={`p-2 rounded-full hover:bg-lightgray-500 transition-colors ${
                                favorites.includes(candidate.id) ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                              aria-label={favorites.includes(candidate.id) ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
                            >
                              <Star size={20} fill={favorites.includes(candidate.id) ? 'currentColor' : 'none'} />
                            </button>
                          </div>

                          {/* Summary */}
                          {candidate.summary && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                              {candidate.summary}
                            </p>
                          )}

                          {/* Info rows */}
                          <div className="space-y-2 mb-4">
                            {candidate.availability && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={14} className="mr-2 text-gray-400" />
                                {candidate.availability}
                              </div>
                            )}
                          </div>

                          {/* Skills */}
                          {candidate.skills.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1.5">
                                {candidate.skills.slice(0, 4).map((skill) => (
                                  <Badge key={skill.id} variant="primary" className="text-xs">
                                    {skill.skill_name}
                                    {skill.level > 1 && (
                                      <span className="ml-1 opacity-70">({getSkillLevel(skill.level)})</span>
                                    )}
                                  </Badge>
                                ))}
                                {candidate.skills.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{candidate.skills.length - 4} meer
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="mt-auto pt-4 flex items-center justify-between border-t border-lightgray-800">
                            <div className="flex items-center gap-2">
                              {candidate.linkedin_url && (
                                <a
                                  href={candidate.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                                >
                                  LinkedIn <ExternalLink size={12} />
                                </a>
                              )}
                              {candidate.github_url && (
                                <a
                                  href={candidate.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-gray-600 hover:text-gray-800 text-xs flex items-center gap-1"
                                >
                                  GitHub <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCandidate(candidate);
                              }}
                              className="text-turquoise-600 text-sm font-medium hover:underline"
                            >
                              Bekijk profiel
                            </button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        className="px-8"
                        disabled={loadingMore}
                      >
                        {loadingMore ? (
                          <>
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Laden...
                          </>
                        ) : (
                          'Meer laden'
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Empty State */}
              {!loading && !error && results.length === 0 && (
                <div
                  className="bg-white rounded-lg border border-lightgray-800 p-8 text-center"
                  role="alert"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-lightgray-500 rounded-full mb-4">
                    <Search size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Geen kandidaten gevonden</h3>
                  <p className="text-gray-600 mb-6">
                    Probeer andere zoektermen of filters om kandidaten te vinden.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilters({
                        experience: [],
                        location: [],
                        skills: [],
                        availability: [],
                        languages: [],
                        matchScore: 0,
                        remote: undefined,
                        branch: [],
                      });
                    }}
                  >
                    Wis alle filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-modal-title"
            onClick={() => setSelectedCandidate(null)}
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
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-turquoise-100 text-turquoise-700 flex items-center justify-center text-xl font-bold">
                      {(selectedCandidate.summary || 'K').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 id="candidate-modal-title" className="text-2xl font-bold">
                        Kandidaat #{selectedCandidate.id}
                      </h2>
                      {selectedCandidate.location && (
                        <p className="text-gray-600 flex items-center mt-1">
                          <MapPin size={16} className="mr-1" />
                          {selectedCandidate.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                    aria-label="Sluit modal"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Summary */}
                {selectedCandidate.summary && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Samenvatting</h3>
                    <p className="text-gray-600">{selectedCandidate.summary}</p>
                  </div>
                )}

                {/* Contact & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-bold mb-3">Contactgegevens</h3>
                    <div className="space-y-2">
                      {selectedCandidate.phone && (
                        <a
                          href={`tel:${selectedCandidate.phone}`}
                          className="flex items-center text-sm text-gray-600 hover:text-turquoise-600"
                        >
                          <Phone size={16} className="mr-2 text-gray-400" />
                          {selectedCandidate.phone}
                        </a>
                      )}
                      {selectedCandidate.availability && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          Beschikbaarheid: {selectedCandidate.availability}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold mb-3">Links</h3>
                    <div className="space-y-2">
                      {selectedCandidate.linkedin_url && (
                        <a
                          href={selectedCandidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          LinkedIn profiel
                        </a>
                      )}
                      {selectedCandidate.github_url && (
                        <a
                          href={selectedCandidate.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          GitHub profiel
                        </a>
                      )}
                      {selectedCandidate.kaggle_url && (
                        <a
                          href={selectedCandidate.kaggle_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Kaggle profiel
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedCandidate.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-3">Vaardigheden</h3>
                    <div className="space-y-2">
                      {selectedCandidate.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.skill_name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-turquoise-500 rounded-full transition-all"
                                style={{ width: `${(skill.level / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-16">
                              {getSkillLevel(skill.level)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Big Number (KvK) */}
                {selectedCandidate.big_number && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">BIG-nummer / KvK</h3>
                    <p className="text-sm text-gray-600">{selectedCandidate.big_number}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-lightgray-800 pt-4 flex gap-3">
                  <a
                    href={`mailto:info@skillure.nl?subject=Contact%20kandidaat%20%23${selectedCandidate.id}`}
                    className="flex-1"
                  >
                    <Button variant="primary" className="w-full" leftIcon={<Mail size={16} />}>
                      Contact opnemen
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleFavorite(selectedCandidate.id);
                    }}
                    leftIcon={<Star size={16} fill={favorites.includes(selectedCandidate.id) ? 'currentColor' : 'none'} />}
                    className={favorites.includes(selectedCandidate.id) ? 'text-yellow-500 border-yellow-500' : ''}
                  >
                    {favorites.includes(selectedCandidate.id) ? 'Opgeslagen' : 'Opslaan'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchPage;
