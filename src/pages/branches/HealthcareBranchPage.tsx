import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, FileCheck, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const HealthcareBranchPage: React.FC = () => {
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
              Zorgprofessionals werven met <span className="text-turquoise-500">zekerheid</span>
            </h1>
            <p className="text-xl text-lightgray-400 mb-8">
              Skillure's AI vindt gekwalificeerde zorgprofessionals met geverifieerde BIG-registratie en AVG-compliance – voor veilige en efficiënte werving.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<ShieldCheck size={20} />}
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
              <ShieldCheck className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">AVG-compliance</h3>
              <p className="text-gray-600">
                Volledig AVG-compliant platform met extra beveiliging voor gevoelige zorgdata.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <UserCheck className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">BIG-registratie Check</h3>
              <p className="text-gray-600">
                Automatische verificatie van BIG-registratie en specialisaties voor kwaliteitsborging.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <FileCheck className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Documentvalidatie</h3>
              <p className="text-gray-600">
                Geautomatiseerde controle van diploma's, certificaten en referenties.
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
              Vind zorgprofessionals
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HealthcareBranchPage;