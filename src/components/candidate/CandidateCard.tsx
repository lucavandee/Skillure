import React from 'react';
import { Candidate } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { MapPin, Calendar, Globe, Github, Linkedin, ExternalLink, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { viewCv } from '../../lib/cv-viewer';

interface CandidateCardProps {
  candidate: Candidate;
  onClick?: () => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onClick }) => {
  // Function to determine color based on match score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card 
        className="h-full flex flex-col cursor-pointer hover:border-turquoise-400 transition-all duration-300" 
        hoverable
        bordered
        onClick={onClick}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="relative">
              <img 
                src={candidate.avatar} 
                alt={candidate.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" 
              />
              {candidate.matchScore && (
                <div 
                  className={`absolute -bottom-2 -right-2 w-8 h-8 ${getScoreColor(candidate.matchScore)} text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white`}
                >
                  {candidate.matchScore}
                </div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="font-bold text-lg">{candidate.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Gewenste rol</p>
              <p className="text-gray-700 text-sm font-medium">{candidate.role}</p>
              {candidate.title && candidate.title !== candidate.role && (
                <p className="text-gray-500 text-xs mt-1">
                  Huidige functie: {candidate.title}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {candidate.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={16} className="mr-2 text-gray-400" />
              {candidate.location}
            </div>
          )}
          
          {candidate.availability && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2 text-gray-400" />
              {candidate.availability}
            </div>
          )}
          
          {candidate.languages && candidate.languages.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Globe size={16} className="mr-2 text-gray-400" />
              {candidate.languages.join(', ')}
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Top skills:</p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="primary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {candidate.cvStoragePath && (
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                void viewCv(candidate.cvStoragePath!, candidate.cvFileName);
              }}
            >
              Bekijk CV
            </Button>
          </div>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-lightgray-800 mt-4">
          <div className="flex space-x-3">
            {candidate.githubUrl && (
              <a 
                href={candidate.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-midnight"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={18} />
              </a>
            )}
            {candidate.linkedinUrl && (
              <a 
                href={candidate.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-midnight"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin size={18} />
              </a>
            )}
            {candidate.portfolio && (
              <a 
                href={candidate.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-midnight"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Actief: {candidate.lastActivity}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CandidateCard;