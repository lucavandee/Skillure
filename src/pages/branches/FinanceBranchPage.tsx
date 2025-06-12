import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Shield, FileKey, ChevronRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const FinanceBranchPage: React.FC = () => {
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
              Financiële professionals werven met <span className="text-turquoise-500">vertrouwen</span>
            </h1>
            <p className="text-xl text-lightgray-400 mb-8">
              Skillure's AI vindt finance talent met geverifieerde credentials en compliance checks – voor veilige en efficiënte werving in de financiële sector.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Lock size={20} />}
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
              <Shield className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">KYC/AML Validatie</h3>
              <p className="text-gray-600">
                Automatische screening en validatie volgens de laatste KYC en AML-richtlijnen.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <Lock className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Confidentialiteit</h3>
              <p className="text-gray-600">
                End-to-end versleuteling en strikte toegangscontrole voor gevoelige financiële data.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-card"
            >
              <FileKey className="w-12 h-12 text-turquoise-500 mb-6" />
              <h3 className="text-xl font-bold mb-4">Compliance Checks</h3>
              <p className="text-gray-600">
                Geautomatiseerde verificatie van certificeringen en compliance-vereisten.
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
              Vind finance professionals
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default FinanceBranchPage;