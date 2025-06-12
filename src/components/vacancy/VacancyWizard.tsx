import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, MapPin, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface VacancyWizardProps {
  onSubmit?: (data: any) => void;
}

export const VacancyWizard: React.FC<VacancyWizardProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    remote: false,
    description: '',
    requirements: [''],
    salary: {
      min: '',
      max: '',
      currency: 'EUR'
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-6">Basisinformatie</h2>
            <div className="space-y-6">
              <Input
                label="Functietitel"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="bijv. Senior Frontend Developer"
                icon={<Briefcase size={18} className="text-gray-400" />}
                required
              />

              <Input
                label="Bedrijfsnaam"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="bijv. TechNova"
                required
              />

              <Input
                label="Locatie"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="bijv. Amsterdam"
                icon={<MapPin size={18} className="text-gray-400" />}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type dienstverband
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="">Selecteer type</option>
                  <option value="fulltime">Fulltime</option>
                  <option value="parttime">Parttime</option>
                  <option value="freelance">Freelance</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remote werken mogelijk?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="remote"
                      value="true"
                      checked={formData.remote === true}
                      onChange={() => setFormData(prev => ({ ...prev, remote: true }))}
                      className="form-radio text-turquoise-500"
                    />
                    <span className="ml-2">Ja</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="remote"
                      value="false"
                      checked={formData.remote === false}
                      onChange={() => setFormData(prev => ({ ...prev, remote: false }))}
                      className="form-radio text-turquoise-500"
                    />
                    <span className="ml-2">Nee</span>
                  </label>
                </div>
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
          >
            <h2 className="text-xl font-bold mb-6">Functie-eisen en Beschrijving</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Functiebeschrijving
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input-field min-h-[150px]"
                  placeholder="Beschrijf de functie, verantwoordelijkheden en het team..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Functie-eisen
                </label>
                <div className="space-y-3">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        placeholder={`Functie-eis ${index + 1}`}
                      />
                      <Button
                        variant="outline"
                        onClick={() => removeRequirement(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Verwijder
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addRequirement}
                    leftIcon={<FileText size={16} />}
                  >
                    Voeg eis toe
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-6">Review & Publiceren</h2>
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{formData.title}</h3>
                  <p className="text-gray-600">{formData.company}</p>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin size={14} />
                    {formData.location}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formData.type}
                  </Badge>
                  {formData.remote && (
                    <Badge variant="secondary">Remote mogelijk</Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Beschrijving</h4>
                  <p className="text-gray-600">{formData.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Functie-eisen</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {formData.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-lightgray-800 -z-10" />
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                s <= step ? 'bg-turquoise-500 text-white' : 'bg-lightgray-800 text-gray-500'
              } font-medium relative`}
            >
              {s}
              <div className="absolute -bottom-6 whitespace-nowrap text-sm">
                {s === 1 && 'Basisinformatie'}
                {s === 2 && 'Functie-eisen'}
                {s === 3 && 'Review'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="p-6">
        {renderStep()}

        <div className="flex justify-between mt-8 pt-6 border-t border-lightgray-800">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              leftIcon={<ChevronLeft size={16} />}
            >
              Vorige
            </Button>
          )}
          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
              rightIcon={<ChevronRight size={16} />}
              className="ml-auto"
            >
              Volgende
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="ml-auto"
            >
              Publiceer Vacature
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};