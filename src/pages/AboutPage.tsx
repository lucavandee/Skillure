import React from 'react';
import { motion } from 'framer-motion';
import { Search, Brain, Shield, Award, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MetaTags from '../components/seo/MetaTags';

const AboutPage: React.FC = () => {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    'name': 'Over ons | Skillure',
    'description': 'Lees over onze missie, visie en ons team bij Skillure, het AI-platform dat verborgen talent vindt.',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Skillure',
      'description': 'AI-gedreven recruitment platform dat verborgen talent ontdekt via geavanceerde AI-matching.',
      'foundingDate': '2024',
      'employee': [
        {
          '@type': 'Person',
          'name': 'Sophie van der Berg',
          'jobTitle': 'CEO & Co-founder'
        },
        {
          '@type': 'Person',
          'name': 'Lucas de Vries',
          'jobTitle': 'CTO & Co-founder'
        },
        {
          '@type': 'Person',
          'name': 'Emma Bakker',
          'jobTitle': 'Head of AI'
        },
        {
          '@type': 'Person',
          'name': 'Daan Janssen',
          'jobTitle': 'Lead Recruiter'
        }
      ]
    }
  };

  const teamMembers = [
    {
      name: 'Sophie van der Berg',
      role: 'CEO & Co-founder',
      bio: 'Ex-Google recruiter met 10+ jaar ervaring in tech recruitment.',
      avatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg'
    },
    {
      name: 'Lucas de Vries',
      role: 'CTO & Co-founder',
      bio: 'AI-expert met focus op machine learning en NLP.',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
    },
    {
      name: 'Emma Bakker',
      role: 'Head of AI',
      bio: 'PhD in Computer Science, specialisatie in deep learning.',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
    },
    {
      name: 'Daan Janssen',
      role: 'Lead Recruiter',
      bio: 'Specialist in data-driven recruitment en talent acquisition.',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg'
    }
  ];

  const benefits = [
    {
      icon: <Search className="w-12 h-12 text-turquoise-500" />,
      title: 'Versnel je time-to-hire met 50%',
      description: 'Onze AI-matching technologie vindt de perfecte kandidaat in seconden.'
    },
    {
      icon: <Brain className="w-12 h-12 text-turquoise-500" />,
      title: 'Ontdek talent buiten traditionele CV\'s',
      description: 'Analyseer GitHub repositories, Kaggle projecten en meer.'
    },
    {
      icon: <Shield className="w-12 h-12 text-turquoise-500" />,
      title: '100% AVG-compliant',
      description: 'Veilige en privacy-bewuste verwerking van kandidaatgegevens.'
    }
  ];

  return (
    <>
      <MetaTags
        title="Over ons"
        description="Lees over onze missie, visie en ons team bij Skillure, het AI-platform dat verborgen talent vindt."
        canonical="https://skillure.com/about"
        keywords="Skillure team, AI recruitment, missie, visie, over ons"
        schema={pageSchema}
      />

      <div className="bg-lightgray-500 min-h-screen">
        {/* Hero Section */}
        <div className="bg-midnight text-white py-16 md:py-24">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Over ons
              </h1>
              <p className="text-xl text-lightgray-400">
                Skillure is opgericht om verborgen talent te ontsluiten met AI.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-6">Onze missie</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Bij Skillure geloven we dat talent zich niet altijd laat vangen in traditionele CV's. 
                  Onze AI-gedreven technologie doorzoekt projecten op GitHub, analyses op Kaggle en meer, 
                  zodat wij dat unieke talent kunnen vinden dat anderen missen.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-turquoise-500/20 blur-xl rounded-2xl"></div>
                  <Card className="relative bg-white p-8 text-center">
                    <Award className="w-16 h-16 text-turquoise-500 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-midnight mb-2">95%</div>
                    <div className="text-lg text-gray-700">Match Success Rate</div>
                  </Card>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-white">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Ons team</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Een team van experts op het gebied van AI, recruitment en talent acquisition.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center p-6">
                    <img
                      src={member.avatar}
                      alt={`Profielfoto van ${member.name}`}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      loading="lazy"
                    />
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-turquoise-500 font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-gray-700">{member.bio}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 md:py-24">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Waarom Skillure?</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Ontdek hoe onze AI-technologie uw recruitment proces transformeert.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full p-6">
                    <div className="mb-4" aria-hidden="true">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-700">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-turquoise-500">
          <div className="container-custom">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Klaar om verborgen talent te vinden?
              </h2>
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Start vandaag nog met het ontdekken van de beste kandidaten voor uw vacatures.
              </p>
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ChevronRight size={20} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Start Gratis Proefperiode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;