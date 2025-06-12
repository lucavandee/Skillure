import React from 'react';
import { motion } from 'framer-motion';
import { Search, BarChart, FileText, Sparkles, Users, Database, Brain, Award, Radio } from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import MetaTags from '../components/seo/MetaTags';
import Hero from '../components/home/Hero';

const HomePage: React.FC = () => {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Skillure',
    url: 'https://skillure.com',
    logo: 'https://skillure.com/skillure-icon.svg',
    description: 'AI-gedreven recruitment platform dat verborgen talent ontdekt via geavanceerde AI-matching in plaats van traditionele CV\'s.',
    sameAs: [
      'https://twitter.com/skillure',
      'https://linkedin.com/company/skillure',
      'https://github.com/skillure'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+31-20-370-9100',
      contactType: 'customer service',
      availableLanguage: ['Dutch', 'English']
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NL',
      addressLocality: 'Amsterdam'
    }
  };

  return (
    <>
      <MetaTags
        title="AI voor verborgen talent"
        description="Skillure koppelt bedrijven aan verborgen talent en freelance specialisten via realtime AI-matching en pitches. Slimmer werven begint hier."
        canonical="https://skillure.com"
        keywords="recruitment, AI, talent, matching, jobs, hiring, freelance, skills, Nederland"
        schema={organizationSchema}
      />

      <div>
        <Hero />
      </div>
    </>
  );
};

export default HomePage;