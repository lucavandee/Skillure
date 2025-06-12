import React from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-midnight via-midnight-200 to-midnight overflow-hidden py-[120px] lg:py-[120px]">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-turquoise-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-turquoise-700/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-turquoise-600/10 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      </div>

      <div className="container-custom relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Column - Text Content */}
          <motion.div 
            className="w-full lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-montserrat text-[32px] md:text-[48px] lg:text-[56px] font-bold leading-tight text-white mb-[50px]">
              Ontdek verborgen talent in <span className="text-turquoise-500">30 seconden</span>
            </h1>
            <p className="font-lato text-[16px] md:text-[18px] lg:text-[20px] text-[#E0E0E0] mb-[50px] leading-relaxed">
              Ons AI-platform vindt kandidaten buiten traditionele CV's door hun echte vaardigheden op GitHub, Kaggle en meer te analyseren.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Link to="/gratis-proefperiode">
                <Button 
                  variant="primary" 
                  size="lg"
                  leftIcon={<Search size={20} />}
                  className="px-8 py-4 text-midnight font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Start Gratis Proefperiode
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-8 text-[#E0E0E0]">
              <div className="flex items-center">
                <Users size={20} className="mr-2" />
                <span>10.000+ Kandidaten</span>
              </div>
              <div className="flex items-center">
                <Award size={20} className="mr-2" />
                <span>95% Match Rate</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div 
            className="w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-turquoise-500/20 blur-xl rounded-2xl"></div>
              <div className="relative bg-[#112240] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-turquoise-500/20 flex items-center justify-center">
                      <Search className="w-5 h-5 text-turquoise-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Match Score: 95%</h3>
                      <p className="text-sm text-gray-400">Perfect match gevonden</p>
                    </div>
                  </div>
                  <div className="text-sm text-turquoise-500 font-medium px-3 py-1 bg-turquoise-500/10 rounded-full">
                    Top 1%
                  </div>
                </div>

                <div className="bg-midnight/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg" 
                      alt="Kandidaat" 
                      className="w-12 h-12 rounded-full object-cover border-2 border-turquoise-500"
                    />
                    <div>
                      <h4 className="text-white font-medium">Daan Janssen</h4>
                      <p className="text-gray-400 text-sm">Machine Learning Engineer</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Python</span>
                        <span className="text-turquoise-500 font-medium">Expert</span>
                      </div>
                      <div className="h-2 bg-midnight-300 rounded-full">
                        <motion.div 
                          className="h-2 bg-turquoise-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '95%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">TensorFlow</span>
                        <span className="text-turquoise-500 font-medium">Advanced</span>
                      </div>
                      <div className="h-2 bg-midnight-300 rounded-full">
                        <motion.div 
                          className="h-2 bg-turquoise-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1, delay: 0.7 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Link to="/search">
                  <Button
                    variant="primary"
                    className="w-full font-semibold hover:scale-105 transform transition-all duration-300"
                  >
                    Contact opnemen
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;