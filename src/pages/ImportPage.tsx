import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight, Download } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface MappingField {
  sourceField: string;
  targetField: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const ImportPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<MappingField[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [importType, setImportType] = useState<'vacatures' | 'kandidaten'>('kandidaten');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="bg-lightgray-500 min-h-screen py-8">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data Importeren</h1>
          <p className="text-gray-600">
            Importeer uw vacatures of kandidaatprofielen via CSV/Excel
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-lightgray-800 -z-10" />
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                s <= step ? 'bg-turquoise-500 text-midnight' : 'bg-lightgray-800 text-gray-500'
              } font-medium relative`}
            >
              {s}
              <div className="absolute -bottom-6 whitespace-nowrap text-sm">
                {s === 1 && 'Bestand uploaden'}
                {s === 2 && 'Velden mappen'}
                {s === 3 && 'Valideren'}
                {s === 4 && 'Importeren'}
              </div>
            </div>
          ))}
        </div>

        <Card className="p-6">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Kies importtype</h2>
                <div className="flex justify-center gap-4 mb-8">
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
              </div>

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
              <h2 className="text-2xl font-bold mb-2">Import Succesvol</h2>
              <p className="text-gray-600 mb-6">
                Alle data is succesvol geïmporteerd en verwerkt
              </p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/dashboard'}
              >
                Ga naar Dashboard
              </Button>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImportPage;