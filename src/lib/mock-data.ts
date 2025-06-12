import { Candidate, FreelanceOpportunity } from '../types';

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'Jan de Vries',
    role: 'Senior React Developer',
    location: 'Amsterdam',
    matchScore: 95,
    status: 'nieuw',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    date: '2024-02-20',
    topSkills: [
      { name: 'React', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Node.js', level: 85 }
    ],
    matchReason: 'Sterke match op basis van GitHub contributions en soortgelijke projecten',
    complianceStatus: {
      verified: true,
      certificates: ['AWS Certified Developer']
    }
  },
  {
    id: '2',
    name: 'Emma Bakker',
    role: 'Data Engineer',
    location: 'Rotterdam',
    matchScore: 88,
    status: 'matched',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    date: '2024-02-19'
  },
  {
    id: '3',
    name: 'Lucas van der Berg',
    role: 'Frontend Developer',
    location: 'Utrecht',
    matchScore: 92,
    status: 'gecontacteerd',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    date: '2024-02-18'
  }
];

export const mockFreelanceOpportunities: FreelanceOpportunity[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    description: 'Voor een innovatieve scale-up in Amsterdam zoeken we een ervaren React developer die ons team kan versterken bij het bouwen van een nieuwe SaaS-applicatie.',
    location: 'Amsterdam',
    remote: true,
    platform: {
      name: 'LinkedIn',
      logo: 'https://www.linkedin.com/favicon.ico'
    },
    scrapedAt: '2024-02-20T14:30:00Z',
    duration: '6 maanden',
    rate: {
      min: 80,
      max: 95,
      currency: 'EUR'
    },
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    matches: 8,
    matchedCandidates: [
      {
        ...mockCandidates[0],
        topSkills: [
          { name: 'React', level: 95 },
          { name: 'TypeScript', level: 90 },
          { name: 'Node.js', level: 85 }
        ],
        matchReason: 'Sterke match op basis van GitHub contributions en soortgelijke projecten',
        complianceStatus: {
          verified: true,
          certificates: ['AWS Certified Developer']
        }
      }
    ],
    complianceRequired: ['AWS Certified Developer']
  },
  {
    id: '2',
    title: 'Python Data Engineer',
    description: 'Wij zoeken een Python Data Engineer voor een groot data project bij een toonaangevende financiële instelling.',
    location: 'Rotterdam',
    remote: false,
    platform: {
      name: 'Jellow',
      logo: 'https://jellow.nl/favicon.ico'
    },
    scrapedAt: '2024-02-20T13:15:00Z',
    duration: '12 maanden',
    rate: {
      min: 85,
      max: 100,
      currency: 'EUR'
    },
    skills: ['Python', 'SQL', 'Apache Spark', 'Azure'],
    matches: 5,
    matchedCandidates: [
      {
        ...mockCandidates[2],
        topSkills: [
          { name: 'Python', level: 92 },
          { name: 'SQL', level: 88 },
          { name: 'Apache Spark', level: 82 }
        ],
        matchReason: 'Uitgebreide ervaring met data engineering en machine learning projecten',
        complianceStatus: {
          verified: false,
          certificates: []
        }
      }
    ],
    complianceRequired: ['Azure Data Engineer Associate']
  },
  {
    id: '3',
    title: 'DevOps Engineer',
    description: 'Voor een snelgroeiende startup zoeken wij een DevOps Engineer met expertise in Kubernetes en cloud infrastructuur.',
    location: 'Utrecht',
    remote: true,
    platform: {
      name: 'GitHub Jobs',
      logo: 'https://github.com/favicon.ico'
    },
    scrapedAt: '2024-02-20T12:00:00Z',
    duration: '6-12 maanden',
    rate: {
      min: 90,
      max: 110,
      currency: 'EUR'
    },
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker'],
    matches: 6,
    matchedCandidates: [
      {
        ...mockCandidates[0],
        topSkills: [
          { name: 'Kubernetes', level: 94 },
          { name: 'AWS', level: 89 },
          { name: 'Terraform', level: 87 }
        ],
        matchReason: 'Uitstekende match op basis van open source contributions en certificeringen',
        complianceStatus: {
          verified: true,
          certificates: ['AWS Certified DevOps Engineer']
        }
      }
    ],
    complianceRequired: ['AWS Certified DevOps Engineer']
  }
];