import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Hoe werkt AI-matching in Skillure?',
      answer: 'Onze AI-analyse kijkt naar profielen op GitHub, Kaggle en andere platformen. Op basis van vaardigheden, codevoorbeelden en bijdragen vergelijkt het automatisch met jouw vacaturevereisten en haalt het de beste matches naar boven. We gebruiken machine learning om patronen te herkennen in succesvolle plaatsingen.',
      category: 'AI & Technologie'
    },
    {
      id: '2',
      question: 'Welke bronnen gebruikt Skillure voor freelance opdrachten?',
      answer: 'We verzamelen opdrachten van LinkedIn, GitHub Jobs, Jellow, StackOverflow, Indeed en RemoteOK, zodat je in één overzicht alle beschikbare freelancekansen ziet. Onze scraping-technologie werkt 24/7 om de nieuwste opdrachten te vinden.',
      category: 'Platform'
    },
    {
      id: '3',
      question: 'Hoeveel kost Skillure?',
      answer: 'Skillure biedt een gratis proefperiode van 14 dagen. Daarna kun je kiezen uit abonnementen vanaf €99 per gebruiker per maand. Voor bedrijfslicenties kun je contact met ons opnemen voor een aangepaste offerte.',
      category: 'Prijzen'
    },
    {
      id: '4',
      question: 'Hoe valideer ik mijn BIG-nummer of KYC-document?',
      answer: 'Tijdens het uploadproces vul je je BIG-nummer in (voor healthcare). Voor finance upload je je KYC-document; ons team verifieert dit handmatig binnen 48 uur. Je ontvangt een bevestiging zodra de verificatie is voltooid.',
      category: 'Compliance'
    },
    {
      id: '5',
      question: 'Is Skillure AVG-compliant?',
      answer: 'Ja, Skillure is volledig AVG-compliant. We hanteren strikte privacy-richtlijnen en gebruiken alleen publiek beschikbare informatie of informatie waarvoor expliciete toestemming is gegeven. Alle data wordt versleuteld opgeslagen.',
      category: 'Privacy & Compliance'
    },
    {
      id: '6',
      question: 'Hoe snel kan ik kandidaten vinden?',
      answer: 'Dankzij onze AI-technologie kunt u binnen 30 seconden relevante kandidaten vinden. Onze gemiddelde time-to-match is slechts 1.8 dagen, 50% sneller dan traditionele recruitment methoden.',
      category: 'Snelheid'
    },
    {
      id: '7',
      question: 'Kan ik mijn eigen kandidaten uploaden?',
      answer: 'Ja, via onze import-functie kunt u CSV-bestanden uploaden met kandidaatgegevens. Het systeem valideert automatisch de data en voegt compliance-checks toe waar nodig.',
      category: 'Platform'
    },
    {
      id: '8',
      question: 'Welke branches ondersteunt Skillure?',
      answer: 'We zijn gespecialiseerd in Tech, Healthcare en Finance, maar ondersteunen ook andere branches. Elke branche heeft specifieke compliance-vereisten die automatisch worden toegepast.',
      category: 'Branches'
    },
    {
      id: '9',
      question: 'Hoe werkt de AI-pitch generator?',
      answer: 'Onze AI analyseert de vacature en het kandidaatprofiel om een gepersonaliseerde pitch te genereren. Deze kan direct worden gebruikt of aangepast naar uw wensen.',
      category: 'AI & Technologie'
    },
    {
      id: '10',
      question: 'Kan ik Skillure integreren met mijn bestaande systemen?',
      answer: 'Ja, we bieden API-toegang en integraties met populaire ATS-systemen. Neem contact op voor meer informatie over beschikbare integraties.',
      category: 'Integraties'
    }
  ];

  const categories = ['Alle', ...Array.from(new Set(faqItems.map(item => item.category)))];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Alle' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <>
      <MetaTags
        title="Veelgestelde Vragen (FAQ)"
        description="Vind antwoorden op veelgestelde vragen over Skillure's AI-recruitment platform, prijzen, compliance en meer."
        canonical="https://skillure.com/faq"
        schema={faqSchema}
      />

      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-turquoise-100 rounded-full mb-6">
                  <HelpCircle className="w-8 h-8 text-turquoise-500" />
                </div>
                <h1 className="text-4xl font-bold text-midnight mb-4">
                  Veelgestelde Vragen
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Vind snel antwoorden op uw vragen over Skillure's AI-recruitment platform
                </p>
              </motion.div>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="max-w-md mx-auto mb-6">
                <Input
                  placeholder="Zoek in FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search size={18} className="text-gray-400" />}
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-turquoise-500 text-midnight'
                        : 'bg-white text-gray-600 hover:bg-turquoise-50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4 mb-12">
              {filteredFAQs.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-lightgray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-inset"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={openItems.includes(item.id)}
                      aria-controls={`faq-answer-${item.id}`}
                    >
                      <div className="flex-1">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-midnight">
                          {item.question}
                        </h3>
                      </div>
                      <div className="ml-4">
                        {openItems.includes(item.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {openItems.includes(item.id) && (
                        <motion.div
                          id={`faq-answer-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 border-t border-lightgray-800">
                            <p className="text-gray-600 leading-relaxed pt-4">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredFAQs.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-lightgray-500 rounded-full mb-4">
                  <Search size={24} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Geen resultaten gevonden</h3>
                <p className="text-gray-600 mb-6">
                  Probeer andere zoektermen of selecteer een andere categorie.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('Alle');
                  }}
                >
                  Wis filters
                </Button>
              </motion.div>
            )}

            {/* Contact Section */}
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Nog vragen?</h2>
              <p className="text-gray-600 mb-6">
                Kunt u uw vraag niet vinden? Ons support team helpt u graag verder.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  leftIcon={<Mail size={18} />}
                  onClick={() => window.location.href = 'mailto:support@skillure.com'}
                >
                  E-mail Support
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<MessageCircle size={18} />}
                  onClick={() => alert('Live chat wordt binnenkort beschikbaar!')}
                >
                  Live Chat
                </Button>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>📞 Telefoon: 06-20370910</p>
                <p>⏰ Bereikbaar: ma-vr 9:00-17:00</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;