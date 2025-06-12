import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-lightgray-500 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Geen toegang</h1>
        <p className="text-gray-600 mb-8">
          U heeft geen toestemming om deze pagina te bekijken. Neem contact op met uw beheerder als u denkt dat dit een fout is.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="primary"
            leftIcon={<ArrowLeft size={18} />}
            onClick={() => window.history.back()}
          >
            Ga Terug
          </Button>
          <Link to="/">
            <Button
              variant="outline"
              leftIcon={<Home size={18} />}
            >
              Naar Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;