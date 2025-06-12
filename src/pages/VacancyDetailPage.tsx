import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Euro, Shield, Users, Mail, Phone } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Breadcrumb from '../components/ui/Breadcrumb';
import MetaTags from '../components/seo/MetaTags';
import JobSchema from '../components/job/JobSchema';
import { Vacancy } from '../types';

// Mock vacancy data - replace with API call later
const MOCK_VACANCIES: Vacancy[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    description: `We zijn op zoek naar een ervaren React-ontwikkelaar die ons groeiende team kan versterken. Je werkt aan innovatieve web-applicaties en bent verantwoordelijk voor het ontwikkelen van schaalbare frontend-oplossingen.

Verantwoordelijkheden:
• Ontwikkelen van moderne React-applicaties
• Samenwerken met het design- en backend-team
• Code reviews en mentoring van junior developers
• Optimaliseren van applicatie-performance

We bieden een uitdagende functie in een dynamische omgeving met veel ruimte voor persoonlijke ontwikkeling.`,
    company: {
      name: 'TechNova',
      logo: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
      website: 'https://technova.nl'
    },
    location: 'Amsterdam',
    type: 'Freelance',
    salary: {
      min: 80,
      max: 95,
      currency: 'EUR'
    },
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    requirements: [
      'Minimaal 5 jaar ervaring met React',
      'Sterke kennis van TypeScript',
      'Ervaring met moderne development tools',
      'Goede communicatieve vaardigheden',
      'HBO/WO denkniveau'
    ],
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'Python Data Engineer',
    description: `Voor een toonaangevende financiële instelling zoeken wij een ervaren Python Data Engineer. Je bent verantwoordelijk voor het bouwen en onderhouden van data-pijplijnen en ETL-processen.

Verantwoordelijkheden:
• Ontwerpen en implementeren van data-pipelines
• Optimaliseren van data-verwerkingsprocessen
• Samenwerken met data scientists en analisten
• Zorgen voor data-kwaliteit en -betrouwbaarheid

Je werkt in een team van ervaren professionals aan uitdagende projecten met grote datasets.`,
    company: {
      name: 'DataVision',
      logo: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
      website: 'https://datavision.nl'
    },
    location: 'Rotterdam',
    type: 'Contract',
    salary: {
      min: 85,
      max: 100,
      currency: 'EUR'
    },
    skills: ['Python', 'Airflow', 'SQL', 'AWS', 'Docker'],
    requirements: [
      'Minimaal 4 jaar ervaring met Python',
      'Ervaring met Apache Airflow',
      'Kennis van cloud platforms (AWS/Azure)',
      'Ervaring met SQL databases',
      'Affiniteit met financiële sector'
    ],
    createdAt: '2024-02-19T14:30:00Z',
    updatedAt: '2024-02-19T14:30:00Z'
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    description: `Voor een snelgroeiende startup zoeken wij een DevOps Engineer met expertise in Kubernetes en cloud infrastructuur. Je helpt ons platform te schalen en de deployment-processen te optimaliseren.

Verantwoordelijkheden:
• Beheren van Kubernetes clusters
• Implementeren van CI/CD pipelines
• Monitoring en troubleshooting
• Infrastructure as Code met Terraform

Een uitdagende rol met veel autonomie en impact op de technische richting van het bedrijf.`,
    company: {
      name: 'CloudScale',
      logo: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg',
      website: 'https://cloudscale.io'
    },
    location: 'Utrecht',
    type: 'Fulltime',
    salary: {
      min: 90,
      max: 110,
      currency: 'EUR'
    },
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'Jenkins'],
    requirements: [
      'Minimaal 3 jaar DevOps ervaring',
      'Expertise met Kubernetes',
      'Ervaring met Infrastructure as Code',
      'Kennis van monitoring tools',
      'Proactieve houding'
    ],
    createdAt: '2024-02-18T09:15:00Z',
    updatedAt: '2024-02-18T09:15:00Z'
  }
];

const VacancyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/search\" replace />;
  }

  const vacancy = MOCK_VACANCIES.find(v => v.id === id);

  if (!vacancy) {
    return (
      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Vacature niet gevonden</h1>
            <p className="text-gray-600 mb-8">
              De vacature die u zoekt bestaat niet of is niet meer beschikbaar.
            </p>
            <Link to="/search">
              <Button variant="primary" leftIcon={<ArrowLeft size={18} />}>
                Terug naar zoeken
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Zoeken', href: '/search' },
    { label: 'Vacatures' },
    { label: vacancy.title }
  ];

  const jobSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: vacancy.title,
    description: vacancy.description,
    datePosted: vacancy.createdAt,
    validThrough: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    employmentType: vacancy.type.toUpperCase(),
    hiringOrganization: {
      '@type': 'Organization',
      name: vacancy.company.name,
      sameAs: vacancy.company.website,
      logo: vacancy.company.logo
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vacancy.location,
        addressCountry: 'NL'
      }
    },
    ...(vacancy.salary && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: vacancy.salary.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: vacancy.salary.min,
          maxValue: vacancy.salary.max,
          unitText: 'HOUR'
        }
      }
    })
  };

  const handleApply = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('U moet ingelogd zijn om te solliciteren');
        return;
      }

      const response = await fetch('http://localhost:8000/ats/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ vacancy_id: parseInt(vacancy.id) }),
      });

      if (response.ok) {
        alert('Sollicitatie succesvol ingediend!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Er is een fout opgetreden');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Er is een fout opgetreden bij het solliciteren');
    }
  };

  return (
    <>
      <MetaTags
        title={`${vacancy.title} bij ${vacancy.company.name}`}
        description={vacancy.description.substring(0, 160)}
        canonical={`https://skillure.com/vacature/${vacancy.id}`}
        type="article"
        schema={jobSchema}
      />

      <JobSchema vacancy={vacancy} />

      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <div className="mb-6">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={vacancy.company.logo}
                        alt={`${vacancy.company.name} logo`}
                        className="w-16 h-16 rounded-lg object-cover border border-lightgray-800"
                      />
                      <div>
                        <h1 className="text-3xl font-bold text-midnight mb-2">
                          {vacancy.title}
                        </h1>
                        <p className="text-lg text-gray-600">{vacancy.company.name}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex items-center text-gray-600">
                        <MapPin size={18} className="mr-2" />
                        {vacancy.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={18} className="mr-2" />
                        {vacancy.type}
                      </div>
                      {vacancy.salary && (
                        <div className="flex items-center text-gray-600">
                          <Euro size={18} className="mr-2" />
                          €{vacancy.salary.min} - €{vacancy.salary.max}/uur
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar size={18} className="mr-2" />
                        {new Date(vacancy.createdAt).toLocaleDateString('nl-NL')}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {vacancy.skills.map((skill) => (
                        <Badge key={skill} variant="primary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-80">
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        leftIcon={<Users size={18} />}
                        onClick={handleApply}
                      >
                        Solliciteer nu
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<Mail size={18} />}
                        onClick={() => window.location.href = `mailto:info@skillure.nl?subject=Interesse in ${encodeURIComponent(vacancy.title)}`}
                      >
                        Contact opnemen
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Functieomschrijving</h2>
                    <div className="prose prose-gray max-w-none">
                      {vacancy.description.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                {/* Requirements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Functie-eisen</h2>
                    <ul className="space-y-3">
                      {vacancy.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-turquoise-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>

                {/* Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Vereiste vaardigheden</h2>
                    <div className="flex flex-wrap gap-3">
                      {vacancy.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-sm py-2 px-4">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Company Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Over het bedrijf</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={vacancy.company.logo}
                        alt={`${vacancy.company.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover border border-lightgray-800"
                      />
                      <div>
                        <h4 className="font-semibold">{vacancy.company.name}</h4>
                        {vacancy.company.website && (
                          <a
                            href={vacancy.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-turquoise-500 hover:text-turquoise-600 text-sm"
                          >
                            Bezoek website
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Job Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Vacature details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{vacancy.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locatie:</span>
                        <span className="font-medium">{vacancy.location}</span>
                      </div>
                      {vacancy.salary && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tarief:</span>
                          <span className="font-medium">
                            €{vacancy.salary.min} - €{vacancy.salary.max}/uur
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Geplaatst:</span>
                        <span className="font-medium">
                          {new Date(vacancy.createdAt).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Contact */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Contact</h3>
                    <div className="space-y-3">
                      <Button
                        variant="primary"
                        fullWidth
                        leftIcon={<Mail size={18} />}
                        onClick={() => window.location.href = `mailto:info@skillure.nl?subject=Interesse in ${encodeURIComponent(vacancy.title)}`}
                      >
                        E-mail versturen
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        leftIcon={<Phone size={18} />}
                        onClick={() => window.location.href = 'tel:+31203709100'}
                      >
                        Bel ons
                      </Button>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                      <p>📞 020-370 9100</p>
                      <p>📧 info@skillure.nl</p>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VacancyDetailPage;