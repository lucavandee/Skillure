import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Check, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MetaTags from '../components/seo/MetaTags';

const GratisProefperiodePage: React.FC = () => {
  const features = [
    'Onbeperkt zoeken in ons talent-netwerk',
    'AI-matching op basis van echte vaardigheden',
    'Direct contact met kandidaten',
    'Compliance-checks en verificaties',
    'Realtime freelance-radar',
    'Uitgebreide kandidaat-profielen'
  ];

  return (
    <>
      <MetaTags
        title="Start Gratis Proefperiode"
        description="Begin vandaag nog met het vinden van verborgen talent via ons AI-platform. 14 dagen gratis, geen verplichtingen."
        canonical="https://skillure.com/gratis-proefperiode"
      />

      <div className="min-h-screen bg-gradient-to-br from-midnight via-midnight-200 to-midnight py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Start vandaag nog met het vinden van verborgen talent
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                14 dagen gratis toegang tot ons volledige platform. Geen verplichtingen.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="p-8 md:p-12">
              <div className="flex items-center justify-center mb-8">
                <div className="w-16 h-16 bg-turquoise-500/20 rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-turquoise-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4">Wat krijg je?</h2>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-5 h-5 text-turquoise-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-lightgray-500 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 mb-1">Na proefperiode</div>
                    <div className="text-3xl font-bold">€99<span className="text-lg">/maand</span></div>
                    <div className="text-sm text-gray-600">Maandelijks opzegbaar</div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-turquoise-500 mr-2" />
                      Onbeperkt aantal gebruikers
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-turquoise-500 mr-2" />
                      Premium support
                    </li>
                    <li className="flex items-center text-sm">
                      <Check className="w-4 h-4 text-turquoise-500 mr-2" />
                      Maandelijks opzegbaar
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight size={20} />}
                  className="w-full md:w-auto px-12"
                  onClick={() => alert('Registratie formulier wordt gebouwd!')}
                >
                  Start Gratis Proefperiode
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Geen creditcard nodig • Direct toegang • 14 dagen gratis
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default GratisProefperiodePage;