import React from 'react';
import { motion } from 'framer-motion';
import { Github, Cpu, Zap, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const TechBranchPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-lightgray-500">
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
              Tech talent vinden was nog nooit zo <span className="text-turquoise-500">intelligent</span>
            </h1>
            <p className="text-xl text-lightgray-400 mb-8">
              Skillure's AI analyseert GitHub repositories, Kaggle projecten en tech communities om de beste developers te vinden – nog voordat ze actief zoeken.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Github size={20} />}
                onClick={() => window.location.href = '/dashboard'}
              >
                Start met zoeken
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white hover:text-midnight"
                onClick={() => window.location.href = '/radar'}
              >
                Bekijk freelancers
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Value Props */}
      <div className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <Github className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">GitHub & Kaggle Scraping</h3>
              <p className="text-gray-600">
                Vind developers op basis van hun daadwerkelijke code en projecten, niet alleen hun CV.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <Zap className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Snelle Time-to-Hire</h3>
              <p className="text-gray-600">
                AI-matching en geautomatiseerde outreach verkorten uw wervingsproces met gemiddeld 60%.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <Cpu className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Skill Validation</h3>
              <p className="text-gray-600">
                Automatische analyse van codebase en contributions voor objectieve skill validatie.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-16 text-center"
          >
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ChevronRight size={20} />}
              onClick={() => window.location.href = '/dashboard'}
            >
              Ontdek tech talent
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default TechBranchPage;