import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, MapPin, Calendar, ExternalLink, Sparkles, Copy, Check, X, InfoIcon, Star } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';

interface Assignment {
  id: string;
  title: string;
  source: 'LinkedIn' | 'GitHub Jobs' | 'Jellow' | 'StackOverflow' | 'Indeed' | 'RemoteOK';
  location: string;
  duration: string;
  rate: string;
  compliance?: boolean;
  updatedDaysAgo: number;
  matches: number;
  description: string;
  skills: string[];
  remote: boolean;
}

// #### MOCK DATA (vervang later door real calls) ####
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'a1',
    title: 'Senior React Developer',
    source: 'LinkedIn',
    location: 'Amsterdam',
    duration: '6 maanden',
    rate: '€80–€95/uur',
    compliance: true,
    updatedDaysAgo: 5,
    matches: 8,
    description: 'Voor een innovatieve scale-up in Amsterdam zoeken we een ervaren React developer die ons team kan versterken bij het bouwen van een nieuwe SaaS-applicatie.',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    remote: true
  },
  {
    id: 'a2',
    title: 'Python Data Engineer',
    source: 'Jellow',
    location: 'Rotterdam',
    duration: '12 maanden',
    rate: '€85–€100/uur',
    compliance: false,
    updatedDaysAgo: 3,
    matches: 5,
    description: 'Wij zoeken een Python Data Engineer voor een groot data project bij een toonaangevende financiële instelling.',
    skills: ['Python', 'SQL', 'Apache Spark', 'Azure'],
    remote: false
  },
  {
    id: 'a3',
    title: 'DevOps Engineer',
    source: 'GitHub Jobs',
    location: 'Utrecht',
    duration: '6 maanden',
    rate: '€75–€90/uur',
    compliance: false,
    updatedDaysAgo: 2,
    matches: 6,
    description: 'Voor een snelgroeiende startup zoeken wij een DevOps Engineer met expertise in Kubernetes en cloud infrastructuur.',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker'],
    remote: true
  },
  {
    id: 'a4',
    title: 'Fullstack Developer',
    source: 'StackOverflow',
    location: 'Den Haag',
    duration: '3 maanden',
    rate: '€70–€85/uur',
    compliance: true,
    updatedDaysAgo: 1,
    matches: 10,
    description: 'Zoeken naar een fullstack developer voor een kort maar intensief project bij een overheidsorganisatie.',
    skills: ['JavaScript', 'Vue.js', 'PHP', 'MySQL'],
    remote: false
  },
  {
    id: 'a5',
    title: 'Data Analyst',
    source: 'Indeed',
    location: 'Eindhoven',
    duration: '12 maanden',
    rate: '€65–€80/uur',
    compliance: false,
    updatedDaysAgo: 7,
    matches: 4,
    description: 'Voor een tech bedrijf in Eindhoven zoeken we een data analyst die inzichten kan genereren uit grote datasets.',
    skills: ['SQL', 'Python', 'Tableau', 'Excel'],
    remote: false
  },
  {
    id: 'a6',
    title: 'Remote Frontend Developer',
    source: 'RemoteOK',
    location: 'Remote',
    duration: '6 maanden',
    rate: '€60–€75/uur',
    compliance: false,
    updatedDaysAgo: 4,
    matches: 7,
    description: 'Volledig remote positie voor een internationale startup. Werk aan cutting-edge frontend technologieën.',
    skills: ['React', 'Next.js', 'TypeScript', 'GraphQL'],
    remote: true
  },
];

const RadarPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bedrijf' | 'freelancer'>('bedrijf');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showPitch, setShowPitch] = useState(false);
  const [pitchCopied, setPitchCopied] = useState(false);
  const [aiPitch, setAiPitch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const radarPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobSearch',
    name: 'Skillure Freelance Radar',
    description: 'Realtime freelance opdrachten gekoppeld aan verborgen talent via AI-matching.',
    provider: {
      '@type': 'Organization',
      name: 'Skillure',
      sameAs: 'https://skillure.com'
    }
  };

  useEffect(() => {
    // Vervang dit later door fetch('/api/assignments?type=bedrijf') / freelancer
    setAssignments(MOCK_ASSIGNMENTS);
  }, []);

  const handleGeneratePitch = () => {
    if (!selectedAssignment) return;
    
    setAiPitch(`Beste opdrachtgever,

Ik zag uw ${selectedAssignment.title} opdracht en ben zeer geïnteresseerd. Met mijn expertise in ${selectedAssignment.skills.join(', ')} kan ik direct waarde toevoegen aan uw project.

Mijn ervaring met soortgelijke projecten en mijn beschikbaarheid voor ${selectedAssignment.duration} maken mij een ideale kandidaat voor deze opdracht.

Graag plan ik een gesprek in om de mogelijkheden te bespreken.

Met vriendelijke groet,
[Naam]`);
    setShowPitch(true);
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(aiPitch);
    setPitchCopied(true);
    setTimeout(() => setPitchCopied(false), 2000);
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  return (
    <>
      <MetaTags
        title="Freelance Radar - Realtime AI-matching voor freelance opdrachten"
        description="Ontdek de nieuwste freelance opdrachten en krijg direct matches met de beste kandidaten via onze AI-matching technologie."
        canonical="https://skillure.com/radar"
        schema={radarPageSchema}
      />

      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          {/* Introductie */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-midnight mb-4">
              Realtime freelance opdrachten
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Skillure verzamelt opdrachten van LinkedIn, GitHub Jobs, Jellow, StackOverflow, Indeed en RemoteOK.
              Kies een opdracht en vind direct de beste kandidaten uit ons netwerk.
            </p>
          </div>

          {/* Tabs: stapeling op mobiel, naast elkaar op ≥640px */}
          <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('bedrijf')}
              className={`w-full sm:w-auto text-center py-3 px-4 transition-colors ${
                activeTab === 'bedrijf'
                  ? 'border-b-2 border-turquoise-500 text-midnight font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-pressed={activeTab === 'bedrijf'}
            >
              Opdrachten voor bedrijven
            </button>
            <button
              onClick={() => setActiveTab('freelancer')}
              className={`w-full sm:w-auto text-center py-3 px-4 transition-colors ${
                activeTab === 'freelancer'
                  ? 'border-b-2 border-turquoise-500 text-midnight font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              aria-pressed={activeTab === 'freelancer'}
            >
              Opdrachten voor freelancers
            </button>
          </div>

          {/* Assignment Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments
              .filter(a => {
                // placeholder filtering: alle opdrachten tonen ongeacht tab
                return true;
              })
              .map(assign => (
                <motion.div
                  key={assign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <Card
                    className="h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300 cursor-pointer"
                    hoverable
                    onClick={() => setSelectedAssignment(assign)}
                  >
                    {/* Header met source en titel */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-5 h-5 bg-turquoise-500 rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {assign.source.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">{assign.source}</span>
                        </div>
                        <h2 className="text-lg font-semibold text-midnight mb-2 line-clamp-2">
                          {assign.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(assign.id);
                          }}
                          className={`p-1 rounded-full hover:bg-lightgray-500 transition-colors ${
                            favorites.includes(assign.id) ? 'text-yellow-500' : 'text-gray-400'
                          }`}
                          aria-label={favorites.includes(assign.id) ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten'}
                        >
                          <Star size={16} />
                        </button>
                        <Badge variant="primary" className="text-xs">
                          {assign.matches} matches
                        </Badge>
                      </div>
                    </div>

                    {/* Body: locatie, duur, tarief, compliance */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={14} className="mr-2 text-gray-400" />
                        {assign.location}
                        {assign.remote && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Remote
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={14} className="mr-2 text-gray-400" />
                        {assign.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">💰</span>
                        {assign.rate}
                      </div>
                      {assign.compliance && (
                        <div className="flex items-center text-sm text-green-600">
                          <Check size={14} className="mr-2" />
                          KYC-gecontroleerd
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {assign.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {assign.skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{assign.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Footer: last updated + CTA knoppen */}
                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 mb-3">
                        Bijgewerkt {assign.updatedDaysAgo} dagen geleden
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Kandidaten voor ${assign.title} worden geladen…`);
                          }}
                          className="w-full"
                          aria-label={`Bekijk kandidaten voor ${assign.title}`}
                        >
                          Bekijk kandidaten
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssignment(assign);
                            handleGeneratePitch();
                          }}
                          className="w-full"
                          aria-label={`Solliciteer via AI voor ${assign.title}`}
                        >
                          Solliciteer via AI
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
          </div>

          {/* Als er geen opdrachten zijn */}
          {assignments.length === 0 && (
            <div className="text-center text-gray-700 mt-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-lightgray-500 rounded-full mb-4">
                <Radio size={24} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Geen opdrachten gevonden</h3>
              <p className="text-gray-600">Probeer later opnieuw of pas uw filters aan.</p>
            </div>
          )}

          {/* Assignment Detail Modal */}
          <AnimatePresence>
            {selectedAssignment && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 id="modal-title" className="text-2xl font-bold mb-2">
                          {selectedAssignment.title}
                        </h2>
                        <div className="flex items-center text-gray-600">
                          <div className="w-4 h-4 bg-turquoise-500 rounded-sm flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-bold">
                              {selectedAssignment.source.charAt(0)}
                            </span>
                          </div>
                          <span>{selectedAssignment.source}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedAssignment(null)}
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
                            {selectedAssignment.location}
                            {selectedAssignment.remote && (
                              <span className="ml-2 text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Remote mogelijk
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Calendar size={16} className="mr-2" />
                            {selectedAssignment.duration}
                          </div>
                          <div className="text-gray-600">
                            💰 {selectedAssignment.rate}
                          </div>
                          {selectedAssignment.compliance && (
                            <div className="flex items-center text-green-600">
                              <Check size={16} className="mr-2" />
                              KYC-gecontroleerd
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAssignment.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold mb-3">Beschrijving</h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {selectedAssignment.description}
                      </p>
                    </div>

                    <div className="border-t border-lightgray-800 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">AI-gegenereerde Pitch</h3>
                        <Button
                          variant="primary"
                          leftIcon={<Sparkles size={18} />}
                          onClick={handleGeneratePitch}
                        >
                          Genereer Pitch
                        </Button>
                      </div>

                      {showPitch && (
                        <div className="bg-lightgray-500 rounded-lg p-4 relative">
                          <p className="text-gray-700 mb-4 whitespace-pre-line">
                            {aiPitch}
                          </p>
                          <Button
                            variant="outline"
                            leftIcon={pitchCopied ? <Check size={18} /> : <Copy size={18} />}
                            onClick={handleCopyPitch}
                            className="w-full"
                          >
                            {pitchCopied ? 'Gekopieerd!' : 'Kopieer Pitch'}
                          </Button>
                        </div>
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