import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, MapPin, Calendar, ChevronRight, ChevronLeft, Save, Check, AlertTriangle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';

interface VacancyFormData {
  title: string;
  description: string;
  skills: string[];
  branch: string;
  location: string;
  duration: string;
  rateMin: string;
  rateMax: string;
  bigNumber: string;
  kycFile: File | null;
  availability: string;
}

const VacancyFormPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<VacancyFormData>({
    title: '',
    description: '',
    skills: [],
    branch: '',
    location: '',
    duration: '',
    rateMin: '',
    rateMax: '',
    bigNumber: '',
    kycFile: null,
    availability: '',
  });

  const ALL_SKILLS = [
    'Python', 'JavaScript', 'React', 'TypeScript', 'Node.js', 'Docker', 'Kubernetes', 
    'AWS', 'Azure', 'SQL', 'PostgreSQL', 'MongoDB', 'GraphQL', 'Vue.js', 'Angular',
    'Java', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'Machine Learning', 'Data Science', 'AI', 'DevOps', 'CI/CD', 'Terraform'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, kycFile: e.target.files![0] }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  // Validation function per step
  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (step === 1) {
      if (!formData.title.trim()) errors.push('Titel is verplicht');
      if (formData.description.trim().length < 50) errors.push('Omschrijving moet minstens 50 tekens bevatten');
    }
    
    if (step === 2) {
      if (formData.skills.length === 0) errors.push('Kies minimaal één vaardigheid');
      if (!formData.branch) errors.push('Branche is verplicht');
      if (!formData.location.trim()) errors.push('Locatie is verplicht');
      if (!formData.duration) errors.push('Duur is verplicht');
      if (!formData.rateMin || !formData.rateMax) errors.push('Vul zowel min als max tarief in');
      if (formData.rateMin && formData.rateMax && parseInt(formData.rateMin) >= parseInt(formData.rateMax)) {
        errors.push('Maximum tarief moet hoger zijn dan minimum tarief');
      }
      if (formData.branch === 'Healthcare' && !formData.bigNumber.trim()) {
        errors.push('BIG-nummer is verplicht voor Healthcare');
      }
      if (formData.branch === 'Finance' && !formData.kycFile) {
        errors.push('Upload KYC-document voor Finance');
      }
      if (!formData.availability) errors.push('Beschikbaarheid is verplicht');
    }
    
    return errors;
  };

  const canProceed = () => {
    return getValidationErrors().length === 0;
  };

  const handleNext = () => {
    if (canProceed()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleSaveDraft = () => {
    localStorage.setItem('vacancyDraft', JSON.stringify(formData));
    alert('Concept opgeslagen!');
  };

  const handlePublish = () => {
    alert('Vacature succesvol geplaatst!');
    // Reset form
    setFormData({
      title: '',
      description: '',
      skills: [],
      branch: '',
      location: '',
      duration: '',
      rateMin: '',
      rateMax: '',
      bigNumber: '',
      kycFile: null,
      availability: '',
    });
    setStep(1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-6">
              <Briefcase className="w-6 h-6 text-turquoise-500 mr-2" />
              <h2 className="text-xl font-bold">Basisinformatie</h2>
            </div>

            <Input
              label="Vacaturetitel"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Bijv. Senior React Developer"
              icon={<Briefcase size={18} className="text-gray-400" />}
              required
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-midnight mb-1.5">
                Vacatureomschrijving
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Beschrijf de functie, verantwoordelijkheden en het team (minimaal 50 tekens)..."
                className="input-field min-h-[150px] resize-y"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/50 minimum
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-6">
              <FileText className="w-6 h-6 text-turquoise-500 mr-2" />
              <h2 className="text-xl font-bold">Functie-eisen en Details</h2>
            </div>

            {/* Skills Selection */}
            <div>
              <label className="block text-sm font-medium text-midnight mb-2">
                Vaardigheden ({formData.skills.length} geselecteerd)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-lightgray-800 rounded-lg p-4">
                {ALL_SKILLS.map(skill => (
                  <label key={skill} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded text-turquoise-500 focus:ring-turquoise-500 mr-2"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
              {formData.skills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="primary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-midnight mb-1.5">
                  Branche
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Selecteer branche</option>
                  <option value="Tech">Tech</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>

              <Input
                label="Locatie"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Bijv. Amsterdam"
                icon={<MapPin size={18} className="text-gray-400" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-midnight mb-1.5">
                  Duur
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Selecteer duur</option>
                  <option value="1–3 mnd">1 – 3 maanden</option>
                  <option value="3–6 mnd">3 – 6 maanden</option>
                  <option value="6–12 mnd">6 – 12 maanden</option>
                  <option value=">12 mnd">&gt; 12 maanden</option>
                  <option value="Onbepaalde tijd">Onbepaalde tijd</option>
                </select>
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-midnight mb-1.5">
                  Beschikbaarheid
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Selecteer beschikbaarheid</option>
                  <option value="Direct">Direct</option>
                  <option value="Binnen 2 weken">Binnen 2 weken</option>
                  <option value="Binnen 1 maand">Binnen 1 maand</option>
                  <option value="Anders">Anders</option>
                </select>
              </div>
            </div>

            {/* Rate Range */}
            <div>
              <label className="block text-sm font-medium text-midnight mb-1.5">
                Tariefindicatie (€ per uur)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum"
                  name="rateMin"
                  type="number"
                  value={formData.rateMin}
                  onChange={handleChange}
                  placeholder="60"
                  min="0"
                />
                <Input
                  label="Maximum"
                  name="rateMax"
                  type="number"
                  value={formData.rateMax}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            {/* Compliance Section */}
            {(formData.branch === 'Healthcare' || formData.branch === 'Finance') && (
              <div className="bg-lightgray-500 rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                  Compliance Vereisten
                </h3>
                
                {formData.branch === 'Healthcare' && (
                  <Input
                    label="BIG-nummer (verplicht voor Healthcare)"
                    name="bigNumber"
                    value={formData.bigNumber}
                    onChange={handleChange}
                    placeholder="Bijv. 1234567890"
                    required
                  />
                )}

                {formData.branch === 'Finance' && (
                  <div>
                    <label htmlFor="kycFile\" className="block text-sm font-medium text-midnight mb-1.5">
                      KYC-document (verplicht voor Finance)
                    </label>
                    <input
                      id="kycFile"
                      name="kycFile"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-turquoise-50 file:text-turquoise-700 hover:file:bg-turquoise-100"
                      required
                    />
                    {formData.kycFile && (
                      <p className="text-sm text-green-600 mt-1">
                        ✓ {formData.kycFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-6">
              <Check className="w-6 h-6 text-turquoise-500 mr-2" />
              <h2 className="text-xl font-bold">Review & Publiceren</h2>
            </div>

            <Card className="p-6 bg-lightgray-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Basisinformatie</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-turquoise-500"
                >
                  Bewerken
                </Button>
              </div>
              <div className="space-y-2">
                <p><strong>Titel:</strong> {formData.title}</p>
                <p><strong>Omschrijving:</strong> {formData.description.substring(0, 100)}...</p>
              </div>
            </Card>

            <Card className="p-6 bg-lightgray-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Functie-eisen</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-turquoise-500"
                >
                  Bewerken
                </Button>
              </div>
              <div className="space-y-2">
                <div>
                  <strong>Vaardigheden:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.skills.map(skill => (
                      <Badge key={skill} variant="primary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <p><strong>Branche:</strong> {formData.branch}</p>
                <p><strong>Locatie:</strong> {formData.location}</p>
                <p><strong>Duur:</strong> {formData.duration}</p>
                <p><strong>Tarief:</strong> €{formData.rateMin} – €{formData.rateMax}/uur</p>
                <p><strong>Beschikbaarheid:</strong> {formData.availability}</p>
                
                {formData.branch === 'Healthcare' && formData.bigNumber && (
                  <p><strong>BIG-nummer:</strong> {formData.bigNumber}</p>
                )}
                {formData.branch === 'Finance' && formData.kycFile && (
                  <p><strong>KYC-document:</strong> {formData.kycFile.name}</p>
                )}
              </div>
            </Card>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700 font-medium">
                  Uw vacature is klaar voor publicatie!
                </span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const validationErrors = getValidationErrors();

  return (
    <>
      <MetaTags
        title="Vacature Uploaden"
        description="Upload uw vacature en vind de beste kandidaten via onze AI-matching technologie."
        canonical="https://skillure.com/vacancies/new"
      />

      <div className="bg-lightgray-500 min-h-screen py-8">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Vacature Uploaden</h1>
              <p className="text-gray-600">
                Maak uw vacature in 3 eenvoudige stappen en vind direct de beste kandidaten
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                          stepNumber <= step
                            ? 'bg-turquoise-500 text-midnight'
                            : 'bg-lightgray-800 text-gray-500'
                        }`}
                      >
                        {stepNumber < step ? <Check size={20} /> : stepNumber}
                      </div>
                      {stepNumber < 3 && (
                        <div
                          className={`w-16 h-1 mx-2 ${
                            stepNumber < step ? 'bg-turquoise-500' : 'bg-lightgray-800'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Stap {step} van 3
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {step === 1 && 'Basisinformatie'}
                {step === 2 && 'Functie-eisen en Details'}
                {step === 3 && 'Review & Publiceren'}
              </div>
            </div>

            <Card className="p-8">
              {renderStep()}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800 mb-2">
                        Corrigeer de volgende fouten:
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="text-red-700 text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-3">
                  {step > 1 && (
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      leftIcon={<ChevronLeft size={16} />}
                    >
                      Vorige
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={handleSaveDraft}
                    leftIcon={<Save size={16} />}
                    className="text-gray-600"
                  >
                    Opslaan als concept
                  </Button>

                  {step < 3 ? (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      rightIcon={<ChevronRight size={16} />}
                      disabled={!canProceed()}
                    >
                      Volgende
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={handlePublish}
                      leftIcon={<Check size={16} />}
                      disabled={!canProceed()}
                    >
                      Publiceer Vacature
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default VacancyFormPage;