// Existing types...

export interface Candidate {
  id: string;
  name: string;
  role: string;
  title?: string;
  location: string;
  matchScore?: number;
  status: string;
  avatar: string;
  date: string;
  skills: string[];
  experience?: string;
  availability?: string;
  languages?: string[];
  lastActivity?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolio?: string;
  topSkills?: {
    name: string;
    level: number;
  }[];
  matchReason?: string;
  complianceStatus?: {
    verified: boolean;
    certificates: string[];
  };
  /**
   * Opaque identifier into the active CvStorage backend (see
   * src/lib/cv-storage). For LocalCvStorage this is a localStorage key;
   * for SupabaseCvStorage it is the bucket path.
   */
  cvStoragePath?: string;
  cvFileName?: string;
}

export interface FilterOptions {
  experience?: string[];
  location?: string[];
  skills?: string[];
  availability?: string[];
  languages?: string[];
  matchScore?: number;
  remote?: boolean;
  branch?: string[];
}

export interface FreelanceOpportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  remote: boolean;
  platform: {
    name: 'LinkedIn' | 'Jellow' | 'GitHub Jobs' | 'StackOverflow' | 'Indeed' | 'RemoteOK';
    logo: string;
  };
  scrapedAt: string;
  duration?: string;
  rate?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  matches: number;
  matchedCandidates?: Candidate[];
  complianceRequired?: string[];
  isFavorite?: boolean;
}

export interface AIPitch {
  id: string;
  opportunityId: string;
  candidateId: string;
  content: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'copied';
}

export interface Vacancy {
  id: string;
  title: string;
  description: string;
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  location: string;
  type: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  requirements: string[];
  createdAt: string;
  updatedAt: string;
}