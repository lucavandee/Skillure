import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, Download, UserPlus, FileText, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Candidate } from '../types';
import {
  addStoredCandidate,
  generateCandidateId,
  readFileAsDataUrl,
  MAX_CV_SIZE_BYTES,
  ALLOWED_CV_TYPES,
  ALLOWED_CV_EXTENSIONS,
} from '../lib/candidate-store';

interface MappingField {
  sourceField: string;
  targetField: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

type InputMode = 'upload' | 'manual';

interface ManualCandidateData {
  naam: string;
  email: string;
  functie: string;
  locatie: string;
  ervaring: string;
  beschikbaarheid: string;
  skills: string;
  languages: string;
  big_nummer: string;
  kyc_status: string;
  linkedin: string;
}

interface ManualVacancyData {
  titel: string;
  bedrijf: string;
  locatie: string;
  type: string;
  ervaring: string;
  skills: string;
  salaris: string;
  compliance: string;
}

const emptyCandidate: ManualCandidateData = {
  naam: '',
  email: '',
  functie: '',
  locatie: '',
  ervaring: '',
  beschikbaarheid: '',
  skills: '',
  languages: '',
  big_nummer: '',
  kyc_status: 'pending',
  linkedin: '',
};

const emptyVacancy: ManualVacancyData = {
  titel: '',
  bedrijf: '',
  locatie: '',
  type: 'fulltime',
  ervaring: '',
  skills: '',
  salaris: '',
  compliance: '',
};

const ImportPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<MappingField[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importType, setImportType] = useState<'vacatures' | 'kandidaten'>('kandidaten');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [manualCandidate, setManualCandidate] = useState<ManualCandidateData>(emptyCandidate);
  const [manualVacancy, setManualVacancy] = useState<ManualVacancyData>(emptyVacancy);
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  const targetFields = {
    kandidaten: [
      'naam',
      'email',
      'functie',
      'skills',
      'ervaring',
      'locatie',
      'beschikbaarheid',
      'BIG_nummer',
      'KYC_status',
    ],
    vacatures: [
      'titel',
      'bedrijf',
      'locatie',
      'type',
      'skills',
      'ervaring',
      'salaris',
      'compliance_vereisten',
    ],
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      // Simulate reading CSV headers
      setHeaders(['Naam', 'Email', 'Functie', 'Skills', 'Locatie']);
      setStep(2);
    }
  };

  const handleMapping = (sourceField: string, targetField: string) => {
    setMapping(prev => {
      const existing = prev.find(m => m.sourceField === sourceField);
      if (existing) {
        return prev.map(m => 
          m.sourceField === sourceField ? { ...m, targetField } : m
        );
      }
      return [...prev, { sourceField, targetField }];
    });
  };

  const validateData = () => {
    // Simulate validation
    setValidationErrors([
      {
        row: 2,
        field: 'email',
        message: 'Ongeldig email formaat',
      },
      {
        row: 5,
        field: 'skills',
        message: 'Skills moeten komma-gescheiden zijn',
      },
    ]);
    setStep(3);
  };

  const importData = () => {
    // Simulate import
    setTimeout(() => {
      setStep(4);
    }, 1500);
  };

  const downloadTemplate = () => {
    const fields = targetFields[importType].join(',');
    const blob = new Blob([fields], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}-template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetManualForm = () => {
    setManualCandidate(emptyCandidate);
    setManualVacancy(emptyVacancy);
    setManualErrors({});
    setCvFile(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const switchMode = (mode: InputMode) => {
    setInputMode(mode);
    setManualErrors({});
  };

  const handleCvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setCvFile(null);
      return;
    }

    const isAllowedType =
      ALLOWED_CV_TYPES.includes(selected.type) ||
      /\.(pdf|docx?|jpe?g|png)$/i.test(selected.name);

    if (!isAllowedType) {
      setManualErrors((prev) => ({
        ...prev,
        cv: 'Alleen PDF, Word of afbeeldingen (JPG/PNG) zijn toegestaan',
      }));
      event.target.value = '';
      setCvFile(null);
      return;
    }

    if (selected.size > MAX_CV_SIZE_BYTES) {
      setManualErrors((prev) => ({
        ...prev,
        cv: `Bestand is te groot (max. ${Math.round(MAX_CV_SIZE_BYTES / 1024 / 1024)}MB)`,
      }));
      event.target.value = '';
      setCvFile(null);
      return;
    }

    setManualErrors((prev) => {
      const next = { ...prev };
      delete next.cv;
      return next;
    });
    setCvFile(selected);
  };

  const clearCvFile = () => {
    setCvFile(null);
    if (cvInputRef.current) cvInputRef.current.value = '';
  };

  const handleCandidateChange = (
    field: keyof ManualCandidateData,
    value: string
  ) => {
    setManualCandidate(prev => ({ ...prev, [field]: value }));
    if (manualErrors[field]) {
      setManualErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleVacancyChange = (
    field: keyof ManualVacancyData,
    value: string
  ) => {
    setManualVacancy(prev => ({ ...prev, [field]: value }));
    if (manualErrors[field]) {
      setManualErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateManualCandidate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!manualCandidate.naam.trim()) {
      errors.naam = 'Naam is verplicht';
    }
    if (!manualCandidate.email.trim()) {
      errors.email = 'Email is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualCandidate.email)) {
      errors.email = 'Ongeldig email formaat';
    }
    if (!manualCandidate.functie.trim()) {
      errors.functie = 'Functie is verplicht';
    }
    if (!manualCandidate.skills.trim()) {
      errors.skills = 'Geef tenminste één skill op';
    }
    setManualErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateManualVacancy = (): boolean => {
    const errors: Record<string, string> = {};
    if (!manualVacancy.titel.trim()) {
      errors.titel = 'Titel is verplicht';
    }
    if (!manualVacancy.bedrijf.trim()) {
      errors.bedrijf = 'Bedrijf is verplicht';
    }
    if (!manualVacancy.locatie.trim()) {
      errors.locatie = 'Locatie is verplicht';
    }
    if (!manualVacancy.skills.trim()) {
      errors.skills = 'Geef tenminste één skill op';
    }
    setManualErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveManualEntry = async () => {
    const isValid =
      importType === 'kandidaten'
        ? validateManualCandidate()
        : validateManualVacancy();

    if (!isValid) return;

    setIsSaving(true);

    try {
      if (importType === 'kandidaten') {
        let cvDataUrl: string | undefined;
        let cvFileName: string | undefined;

        if (cvFile) {
          try {
            cvDataUrl = await readFileAsDataUrl(cvFile);
            cvFileName = cvFile.name;
          } catch {
            setManualErrors((prev) => ({
              ...prev,
              cv: 'Kon het CV-bestand niet lezen',
            }));
            setIsSaving(false);
            return;
          }
        }

        const skills = manualCandidate.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const languages = manualCandidate.languages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

        const newCandidate: Candidate = {
          id: generateCandidateId(),
          name: manualCandidate.naam.trim(),
          role: manualCandidate.functie.trim(),
          location: manualCandidate.locatie.trim() || '-',
          status: 'nieuw',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(manualCandidate.naam.trim())}&background=89CFF0&color=0D1B2A`,
          date: new Date().toISOString().slice(0, 10),
          skills,
          experience: manualCandidate.ervaring.trim() || undefined,
          availability: manualCandidate.beschikbaarheid || undefined,
          languages: languages.length > 0 ? languages : undefined,
          linkedinUrl: manualCandidate.linkedin.trim() || undefined,
          complianceStatus: manualCandidate.big_nummer.trim()
            ? {
                verified: manualCandidate.kyc_status === 'verified',
                certificates: [`BIG: ${manualCandidate.big_nummer.trim()}`],
              }
            : undefined,
          cvDataUrl,
          cvFileName,
        };

        try {
          addStoredCandidate(newCandidate);
        } catch {
          setManualErrors((prev) => ({
            ...prev,
            cv: 'Opslaan mislukt — mogelijk is de CV te groot voor lokale opslag',
          }));
          setIsSaving(false);
          return;
        }
      }

      // Vacancies are not yet persisted — keep existing simulated flow
      setIsSaving(false);
      setStep(4);
      resetManualForm();
    } catch {
      setIsSaving(false);
    }
  };

  const stepLabels =
    inputMode === 'manual'
      ? {
          1: 'Gegevens invullen',
          2: 'Opslaan',
        }
      : {
          1: 'Bestand uploaden',
          2: 'Velden mappen',
          3: 'Valideren',
          4: 'Importeren',
        };

  const progressSteps = inputMode === 'manual' ? [1, 2] : [1, 2, 3, 4];
  const displayStep = inputMode === 'manual' ? (step === 4 ? 2 : 1) : step;

  return (
    <div className="bg-lightgray-500 min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data Importeren</h1>
          <p className="text-gray-600">
            Voeg vacatures of kandidaatprofielen toe via bestand of handmatig
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-12 relative px-4">
          <div className="absolute left-4 right-4 top-5 h-0.5 bg-lightgray-800 -z-10" />
          {progressSteps.map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                s <= displayStep ? 'bg-turquoise-500 text-midnight' : 'bg-lightgray-800 text-gray-500'
              } font-medium relative`}
            >
              {s}
              <div className="absolute -bottom-6 whitespace-nowrap text-sm">
                {stepLabels[s as keyof typeof stepLabels]}
              </div>
            </div>
          ))}
        </div>

        <Card className="p-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold mb-2">Kies type</h2>
                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    variant={importType === 'kandidaten' ? 'primary' : 'outline'}
                    onClick={() => setImportType('kandidaten')}
                  >
                    Kandidaten
                  </Button>
                  <Button
                    variant={importType === 'vacatures' ? 'primary' : 'outline'}
                    onClick={() => setImportType('vacatures')}
                  >
                    Vacatures
                  </Button>
                </div>

                <h2 className="text-xl font-bold mb-2">Kies invoermethode</h2>
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    variant={inputMode === 'upload' ? 'primary' : 'outline'}
                    leftIcon={<Upload size={18} />}
                    onClick={() => switchMode('upload')}
                  >
                    Bestand uploaden
                  </Button>
                  <Button
                    variant={inputMode === 'manual' ? 'primary' : 'outline'}
                    leftIcon={<UserPlus size={18} />}
                    onClick={() => switchMode('manual')}
                  >
                    Handmatig invullen
                  </Button>
                </div>
              </div>

              {inputMode === 'upload' && (
                <div className="text-center">
                  <div
                    className="border-2 border-dashed border-lightgray-800 rounded-lg p-8 mb-6 cursor-pointer hover:border-turquoise-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="font-bold mb-2">
                      Sleep uw bestand hier of klik om te uploaden
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ondersteunde formaten: CSV, Excel (.xlsx)
                    </p>
                    <Button variant="outline" leftIcon={<FileSpreadsheet size={18} />}>
                      Selecteer Bestand
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.xlsx"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <Button
                    variant="outline"
                    leftIcon={<Download size={18} />}
                    onClick={downloadTemplate}
                  >
                    Download Template
                  </Button>
                </div>
              )}

              {inputMode === 'manual' && importType === 'kandidaten' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveManualEntry();
                  }}
                  className="max-w-2xl mx-auto"
                >
                  <h3 className="text-lg font-bold mb-4">Kandidaatgegevens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Input
                      label="Volledige naam"
                      required
                      value={manualCandidate.naam}
                      onChange={(e) => handleCandidateChange('naam', e.target.value)}
                      error={manualErrors.naam}
                      placeholder="Bijv. Jan de Vries"
                    />
                    <Input
                      label="Email"
                      type="email"
                      required
                      value={manualCandidate.email}
                      onChange={(e) => handleCandidateChange('email', e.target.value)}
                      error={manualErrors.email}
                      placeholder="jan@voorbeeld.nl"
                    />
                    <Input
                      label="Functie"
                      required
                      value={manualCandidate.functie}
                      onChange={(e) => handleCandidateChange('functie', e.target.value)}
                      error={manualErrors.functie}
                      placeholder="Bijv. Senior Developer"
                    />
                    <Input
                      label="Locatie"
                      value={manualCandidate.locatie}
                      onChange={(e) => handleCandidateChange('locatie', e.target.value)}
                      placeholder="Bijv. Amsterdam"
                    />
                    <Input
                      label="Ervaring"
                      value={manualCandidate.ervaring}
                      onChange={(e) => handleCandidateChange('ervaring', e.target.value)}
                      placeholder="Bijv. 5 jaar"
                    />
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-midnight mb-1.5">
                        Beschikbaarheid
                      </label>
                      <select
                        className="input-field"
                        value={manualCandidate.beschikbaarheid}
                        onChange={(e) =>
                          handleCandidateChange('beschikbaarheid', e.target.value)
                        }
                      >
                        <option value="">Selecteer...</option>
                        <option value="direct">Direct beschikbaar</option>
                        <option value="1-maand">Binnen 1 maand</option>
                        <option value="2-maanden">Binnen 2 maanden</option>
                        <option value="3-maanden">Binnen 3 maanden</option>
                        <option value="onbeschikbaar">Niet beschikbaar</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Skills (komma-gescheiden)"
                    required
                    value={manualCandidate.skills}
                    onChange={(e) => handleCandidateChange('skills', e.target.value)}
                    error={manualErrors.skills}
                    placeholder="Bijv. React, TypeScript, Node.js"
                  />

                  <Input
                    label="Talen (komma-gescheiden)"
                    value={manualCandidate.languages}
                    onChange={(e) => handleCandidateChange('languages', e.target.value)}
                    placeholder="Bijv. Nederlands, Engels"
                  />

                  <Input
                    label="LinkedIn URL"
                    type="url"
                    value={manualCandidate.linkedin}
                    onChange={(e) => handleCandidateChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Input
                      label="BIG-nummer (zorg)"
                      value={manualCandidate.big_nummer}
                      onChange={(e) =>
                        handleCandidateChange('big_nummer', e.target.value)
                      }
                      placeholder="Optioneel"
                    />
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-midnight mb-1.5">
                        KYC-status
                      </label>
                      <select
                        className="input-field"
                        value={manualCandidate.kyc_status}
                        onChange={(e) =>
                          handleCandidateChange('kyc_status', e.target.value)
                        }
                      >
                        <option value="pending">In afwachting</option>
                        <option value="verified">Geverifieerd</option>
                        <option value="rejected">Afgewezen</option>
                      </select>
                    </div>
                  </div>

                  {/* CV upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      CV (PDF, Word of afbeelding)
                    </label>
                    {!cvFile ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          manualErrors.cv
                            ? 'border-red-400 bg-red-50'
                            : 'border-lightgray-800 hover:border-turquoise-500'
                        }`}
                        onClick={() => cvInputRef.current?.click()}
                      >
                        <FileText
                          size={28}
                          className="mx-auto mb-2 text-gray-400"
                        />
                        <p className="text-sm text-gray-600 mb-1">
                          Klik om een CV te uploaden
                        </p>
                        <p className="text-xs text-gray-500">
                          Max. {Math.round(MAX_CV_SIZE_BYTES / 1024 / 1024)}MB —
                          PDF, DOC, DOCX, JPG of PNG
                        </p>
                        <input
                          type="file"
                          ref={cvInputRef}
                          className="hidden"
                          accept={ALLOWED_CV_EXTENSIONS}
                          onChange={handleCvChange}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-turquoise-50 border border-turquoise-200 rounded-lg px-4 py-3">
                        <div className="flex items-center min-w-0">
                          <FileText
                            size={20}
                            className="text-turquoise-700 flex-shrink-0"
                          />
                          <div className="ml-3 min-w-0">
                            <p className="text-sm font-medium text-midnight truncate">
                              {cvFile.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {(cvFile.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearCvFile}
                          className="ml-3 p-1 rounded hover:bg-turquoise-100 text-gray-600 hover:text-midnight flex-shrink-0"
                          aria-label="CV verwijderen"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                    {manualErrors.cv && (
                      <p className="mt-1 text-sm text-red-600" role="alert">
                        {manualErrors.cv}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetManualForm}
                    >
                      Leegmaken
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSaving}>
                      Kandidaat opslaan
                    </Button>
                  </div>
                </form>
              )}

              {inputMode === 'manual' && importType === 'vacatures' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveManualEntry();
                  }}
                  className="max-w-2xl mx-auto"
                >
                  <h3 className="text-lg font-bold mb-4">Vacaturegegevens</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Input
                      label="Titel"
                      required
                      value={manualVacancy.titel}
                      onChange={(e) => handleVacancyChange('titel', e.target.value)}
                      error={manualErrors.titel}
                      placeholder="Bijv. Senior Frontend Developer"
                    />
                    <Input
                      label="Bedrijf"
                      required
                      value={manualVacancy.bedrijf}
                      onChange={(e) => handleVacancyChange('bedrijf', e.target.value)}
                      error={manualErrors.bedrijf}
                    />
                    <Input
                      label="Locatie"
                      required
                      value={manualVacancy.locatie}
                      onChange={(e) => handleVacancyChange('locatie', e.target.value)}
                      error={manualErrors.locatie}
                      placeholder="Bijv. Utrecht"
                    />
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-midnight mb-1.5">
                        Type
                      </label>
                      <select
                        className="input-field"
                        value={manualVacancy.type}
                        onChange={(e) => handleVacancyChange('type', e.target.value)}
                      >
                        <option value="fulltime">Fulltime</option>
                        <option value="parttime">Parttime</option>
                        <option value="freelance">Freelance</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Stage</option>
                      </select>
                    </div>
                    <Input
                      label="Ervaring"
                      value={manualVacancy.ervaring}
                      onChange={(e) => handleVacancyChange('ervaring', e.target.value)}
                      placeholder="Bijv. 3-5 jaar"
                    />
                    <Input
                      label="Salaris"
                      value={manualVacancy.salaris}
                      onChange={(e) => handleVacancyChange('salaris', e.target.value)}
                      placeholder="Bijv. €4.500 - €6.000"
                    />
                  </div>

                  <Input
                    label="Skills (komma-gescheiden)"
                    required
                    value={manualVacancy.skills}
                    onChange={(e) => handleVacancyChange('skills', e.target.value)}
                    error={manualErrors.skills}
                    placeholder="Bijv. React, TypeScript, CSS"
                  />

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      Compliance-vereisten
                    </label>
                    <textarea
                      className="input-field min-h-[100px]"
                      value={manualVacancy.compliance}
                      onChange={(e) =>
                        handleVacancyChange('compliance', e.target.value)
                      }
                      placeholder="Bijv. VOG, BIG-registratie, AVG-certificering..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetManualForm}
                    >
                      Leegmaken
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isSaving}>
                      Vacature opslaan
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-bold mb-4">Velden Mappen</h2>
              <div className="space-y-4 mb-6">
                {headers.map((header) => (
                  <div key={header} className="flex items-center gap-4">
                    <div className="w-1/3">
                      <div className="font-medium">{header}</div>
                    </div>
                    <div className="w-1/3 flex items-center">
                      <ArrowRight size={20} className="text-gray-400" />
                    </div>
                    <div className="w-1/3">
                      <select
                        className="input-field"
                        onChange={(e) => handleMapping(header, e.target.value)}
                      >
                        <option value="">Selecteer veld...</option>
                        {targetFields[importType].map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={validateData}
                  disabled={mapping.length !== headers.length}
                >
                  Valideer Data
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-xl font-bold mb-4">Validatie Resultaten</h2>
              {validationErrors.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {validationErrors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 bg-red-50 text-red-700 p-3 rounded-lg"
                    >
                      <AlertCircle size={20} />
                      <div>
                        <div className="font-medium">
                          Rij {error.row}: {error.field}
                        </div>
                        <div className="text-sm">{error.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-lg mb-6">
                  <CheckCircle size={20} />
                  <div className="font-medium">
                    Alle data is geldig en klaar voor import
                  </div>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={importData}
                  disabled={validationErrors.length > 0}
                >
                  Start Import
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2">
                {inputMode === 'manual'
                  ? `${importType === 'kandidaten' ? 'Kandidaat' : 'Vacature'} opgeslagen`
                  : 'Import Succesvol'}
              </h2>
              <p className="text-gray-600 mb-6">
                {inputMode === 'manual'
                  ? `Het ${importType === 'kandidaten' ? 'kandidaatprofiel' : 'vacatureprofiel'} is succesvol toegevoegd`
                  : 'Alle data is succesvol geïmporteerd en verwerkt'}
              </p>
              <div className="flex justify-center gap-3">
                {inputMode === 'manual' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetManualForm();
                      setStep(1);
                    }}
                  >
                    Nog een toevoegen
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Ga naar Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImportPage;