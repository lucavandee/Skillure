import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, MapPin, Calendar, Mail, Star, Filter } from 'lucide-react';
import CandidateCard from '../components/candidate/CandidateCard';
import { SearchFilters } from '../components/search/SearchFilters';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';
import { mockCandidates } from '../lib/mock-data';
import { Candidate, FilterOptions } from '../types';

// Extended mock data for better demonstration
const EXTENDED_MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Daan Janssen',
    title: 'Machine Learning Engineer',
    role: 'Machine Learning Engineer',
    location: 'Amsterdam',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    matchScore: 95,
    status: 'available',
    date: '2024-02-20',
    skills: ['Python', 'TensorFlow', 'Docker', 'AWS', 'Kubernetes'],
    experience: '5-10 jaar',
    availability: 'Direct',
    languages: ['Nederlands', 'Engels'],
    lastActivity: '2 dagen geleden',
    githubUrl: 'https://github.com/daan-janssen',
    linkedinUrl: 'https://linkedin.com/in/daan-janssen',
    portfolio: 'https://daanjanssen.dev'
  },
  {
    id: '2',
    name: 'Sanne Verhoeven',
    title: 'Frontend Developer',
    role: 'Frontend Developer',
    location: 'Rotterdam',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    matchScore: 88,
    status: 'available',
    date: '2024-02-19',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL'],
    experience: '3-5 jaar',
    availability: 'Binnen 2 weken',
    languages: ['Nederlands', 'Engels', 'Duits'],
    lastActivity: '1 dag geleden',
    githubUrl: 'https://github.com/sanne-verhoeven',
    linkedinUrl: 'https://linkedin.com/in/sanne-verhoeven'
  },
  {
    id: '3',
    name: 'Lucas van der Berg',
    title: 'DevOps Engineer',
    role: 'DevOps Engineer',
    location: 'Utrecht',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    matchScore: 92,
    status: 'available',
    date: '2024-02-18',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'Jenkins'],
    experience: '5-10 jaar',
    availability: 'Direct',
    languages: ['Nederlands', 'Engels'],
    lastActivity: '3 dagen geleden',
    githubUrl: 'https://github.com/lucas-vdberg',
    linkedinUrl: 'https://linkedin.com/in/lucas-vdberg'
  },
  {
    id: '4',
    name: 'Emma Bakker',
    title: 'Data Scientist',
    role: 'Data Scientist',
    location: 'Den Haag',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    matchScore: 85,
    status: 'available',
    date: '2024-02-17',
    skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Tableau'],
    experience: '3-5 jaar',
    availability: 'Binnen 1 maand',
    languages: ['Nederlands', 'Engels', 'Frans'],
    lastActivity: '1 week geleden',
    githubUrl: 'https://github.com/emma-bakker',
    linkedinUrl: 'https://linkedin.com/in/emma-bakker'
  },
  {
    id: '5',
    name: 'Tom de Wit',
    title: 'Full Stack Developer',
    role: 'Full Stack Developer',
    location: 'Eindhoven',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    matchScore: 90,
    status: 'available',
    date: '2024-02-16',
    skills: ['JavaScript', 'Node.js', 'React', 'PostgreSQL', 'MongoDB'],
    experience: '1-3 jaar',
    availability: 'Direct',
    languages: ['Nederlands', 'Engels'],
    lastActivity: '5 dagen geleden',
    githubUrl: 'https://github.com/tom-dewit',
    linkedinUrl: 'https://linkedin.com/in/tom-dewit'
  },
  {
    id: '6',
    name: 'Lisa Jansen',
    title: 'UX/UI Designer',
    role: 'UX/UI Designer',
    location: 'Amsterdam',
    avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg',
    matchScore: 87,
    status: 'available',
    date: '2024-02-15',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    experience: '3-5 jaar',
    availability: 'Binnen 2 weken',
    languages: ['Nederlands', 'Engels'],
    lastActivity: '4 dagen geleden',
    portfolio: 'https://lisajansen.design'
  }
];

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>(EXTENDED_MOCK_CANDIDATES);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(EXTENDED_MOCK_CANDIDATES);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    experience: [],
    location: [],
    skills: [],
    availability: [],
    languages: [],
    matchScore: 0,
    remote: undefined,
    branch: []
  });

  const searchPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: 'Zoek Kandidaten - Skillure',
    description: 'Vind de beste kandidaten voor uw vacature met AI-matching technologie',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredCandidates.length,
      itemListElement: filteredCandidates.map((candidate, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Person',
          name: candidate.name,
          jobTitle: candidate.title || candidate.role,
          location: candidate.location,
          skills: candidate.skills
        }
      }))
    }
  };

  useEffect(() => {
    let results = [...candidates];

    // Search term filtering
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter(
        candidate =>
          candidate.name.toLowerCase().includes(lowercasedTerm) ||
          candidate.role?.toLowerCase().includes(lowercasedTerm) ||
          candidate.title?.toLowerCase().includes(lowercasedTerm) ||
          candidate.skills.some(skill => skill.toLowerCase().includes(lowercasedTerm))
      );
    }

    // Apply filters
    if (filters.experience && filters.experience.length > 0) {
      results = results.filter(candidate => 
        filters.experience?.includes(candidate.experience || '')
      );
    }

    if (filters.location && filters.location.length > 0) {
      results = results.filter(candidate => 
        candidate.location && filters.location?.includes(candidate.location)
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter(candidate =>
        filters.skills?.some(skill => candidate.skills.includes(skill))
      );
    }

    if (filters.availability && filters.availability.length > 0) {
      results = results.filter(candidate => 
        candidate.availability && filters.availability?.includes(candidate.availability)
      );
    }

    if (filters.languages && filters.languages.length > 0) {
      results = results.filter(candidate =>
        candidate.languages?.some(language => filters.languages?.includes(language))
      );
    }

    if (filters.matchScore && filters.matchScore > 0) {
      results = results.filter(candidate =>
        candidate.matchScore && candidate.matchScore >= (filters.matchScore || 0)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'match':
        results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'recent':
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'experience-high':
        results.sort((a, b) => {
          const experienceOrder = { '10+ jaar': 4, '5-10 jaar': 3, '3-5 jaar': 2, '1-3 jaar': 1, '< 1 jaar': 0 };
          return (experienceOrder[b.experience as keyof typeof experienceOrder] || 0) - 
                 (experienceOrder[a.experience as keyof typeof experienceOrder] || 0);
        });
        break;
      case 'experience-low':
        results.sort((a, b) => {
          const experienceOrder = { '10+ jaar': 4, '5-10 jaar': 3, '3-5 jaar': 2, '1-3 jaar': 1, '< 1 jaar': 0 };
          return (experienceOrder[a.experience as keyof typeof experienceOrder] || 0) - 
                 (experienceOrder[b.experience as keyof typeof experienceOrder] || 0);
        });
        break;
    }

    setFilteredCandidates(results);
  }, [searchTerm, filters, candidates, sortBy]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleFavorite = (candidateId: string) => {
    setFavorites(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleLoadMore = () => {
    alert('Functionaliteit "Meer laden" wordt nog gebouwd...');
  };

  return (
    <>
      <MetaTags
        title="Zoek Kandidaten"
        description="Ontdek de beste kandidaten voor uw vacature met onze AI-matching technologie. Filter op vaardigheden, ervaring, locatie en meer."
        canonical="https://skillure.com/search"
        type="website"
        schema={searchPageSchema}
      />
      
      <div className="bg-lightgray-500 min-h-screen">
        <div className="container-custom py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Zoek Kandidaten</h1>
            <p className="text-gray-600">
              Ontdek de beste kandidaten voor uw vacature met onze AI-matching technologie
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
                    placeholder="Zoek op naam, vaardigheden of titel..."
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
                  {filteredCandidates.length} kandidaten gevonden
                </p>
                <div className="flex gap-2">
                  <select 
                    className="input-field py-1.5 px-3 text-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sorteer resultaten"
                  >
                    <option value="match">Sorteer op match</option>
                    <option value="recent">Recent actief</option>
                    <option value="experience-high">Ervaring: hoog-laag</option>
                    <option value="experience-low">Ervaring: laag-hoog</option>
                  </select>
                </div>
              </div>

              {/* Results Grid */}
              {filteredCandidates.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCandidates.map((candidate) => (
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
                          onClick={() => {
                            console.log('Selected candidate:', candidate);
                            alert(`Kandidaat profiel voor ${candidate.name} wordt nog gebouwd!`);
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="relative">
                                <img 
                                  src={candidate.avatar} 
                                  alt={`Avatar van ${candidate.name}`} 
                                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
                                />
                                {candidate.matchScore && (
                                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-turquoise-500 text-midnight rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                                    {candidate.matchScore}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <h3 className="font-bold text-lg">{candidate.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Gewenste rol
                                </p>
                                <p className="text-gray-700 text-sm font-medium">
                                  {candidate.role}
                                </p>
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
                              <Star size={20} />
                            </button>
                          </div>

                          <div className="space-y-3 mb-4">
                            {candidate.location && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin size={16} className="mr-2 text-gray-400" />
                                {candidate.location}
                              </div>
                            )}
                            
                            {candidate.availability && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar size={16} className="mr-2 text-gray-400" />
                                {candidate.availability}
                              </div>
                            )}
                            
                            {candidate.experience && (
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="mr-2">💼</span>
                                {candidate.experience} ervaring
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">Top skills:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {candidate.skills.slice(0, 4).map((skill, index) => (
                                <Badge key={index} variant="primary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {candidate.skills.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{candidate.skills.length - 4} meer
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between border-t border-lightgray-800">
                            <div className="flex items-center gap-2">
                              <a
                                href={`mailto:info@skillure.nl?subject=Contact%20via%20Skillure%20–%20${encodeURIComponent(candidate.name)}`}
                                className="px-4 py-2 bg-turquoise-500 text-midnight rounded-md hover:bg-turquoise-600 transition-colors text-sm font-medium"
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Stuur e-mail naar ${candidate.name}`}
                              >
                                Contact opnemen
                              </a>
                              {candidate.availability === 'Direct' && (
                                <span className="text-xs text-orange-500 font-medium">🚀 Direct beschikbaar</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Actief: {candidate.lastActivity}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={handleLoadMore}
                      className="px-8"
                    >
                      Meer laden
                    </Button>
                  </div>
                </>
              ) : (
                <div 
                  className="bg-white rounded-lg border border-lightgray-800 p-8 text-center"
                  role="alert"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-lightgray-500 rounded-full mb-4">
                    <Search size={24} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Geen kandidaten gevonden</h3>
                  <p className="text-gray-600 mb-6">
                    We konden geen kandidaten vinden die aan uw zoekcriteria voldoen. Probeer andere filters of zoektermen.
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
                        branch: []
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
    </>
  );
};

export default SearchPage;