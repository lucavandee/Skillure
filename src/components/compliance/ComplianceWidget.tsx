import React, { useState } from 'react';
import { Shield, Upload, Check, AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface ComplianceWidgetProps {
  sector: 'healthcare' | 'finance';
  onValidate: (data: any) => void;
}

const ComplianceWidget: React.FC<ComplianceWidgetProps> = ({ sector, onValidate }) => {
  const [bigNumber, setBigNumber] = useState('');
  const [kycChecked, setKycChecked] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');

  const handleValidate = () => {
    if (sector === 'healthcare') {
      // Simulate BIG number validation
      const isValid = bigNumber.length === 11 && /^\d+$/.test(bigNumber);
      setValidationStatus(isValid ? 'valid' : 'invalid');
      onValidate({ bigNumber, isValid });
    } else {
      // Simulate KYC validation
      setValidationStatus(kycChecked && file ? 'valid' : 'invalid');
      onValidate({ kycChecked, file, isValid: kycChecked && file !== null });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-card">
      <div className="flex items-center mb-4">
        <Shield className="w-6 h-6 text-turquoise-500 mr-2" />
        <h3 className="font-bold">
          {sector === 'healthcare' ? 'BIG-registratie' : 'KYC/AML Check'}
        </h3>
      </div>

      {sector === 'healthcare' ? (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">BIG-nummer</label>
            <input
              type="text"
              value={bigNumber}
              onChange={(e) => setBigNumber(e.target.value)}
              className="input-field"
              placeholder="Voer BIG-nummer in"
            />
          </div>
        </>
      ) : (
        <>
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={kycChecked}
                onChange={(e) => setKycChecked(e.target.checked)}
                className="rounded text-turquoise-500 focus:ring-turquoise-500"
              />
              <span>KYC/AML-check uitgevoerd</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Upload verificatiedocument
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-lightgray-800 rounded-lg hover:border-turquoise-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-turquoise-500 hover:text-turquoise-400">
                    <span>Upload een bestand</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <p className="pl-1">of sleep en zet neer</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, JPG tot 10MB
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <Button
        variant="primary"
        onClick={handleValidate}
        className="w-full"
      >
        Valideer
      </Button>

      {validationStatus !== 'pending' && (
        <div className="mt-4">
          {validationStatus === 'valid' ? (
            <Badge variant="success" className="flex items-center">
              <Check size={14} className="mr-1" />
              Verificatie succesvol
            </Badge>
          ) : (
            <Badge variant="error" className="flex items-center">
              <AlertTriangle size={14} className="mr-1" />
              Verificatie mislukt
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default ComplianceWidget;