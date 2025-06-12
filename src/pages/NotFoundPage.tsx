import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-lightgray-500 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl font-bold text-turquoise-500">404</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Pagina niet gevonden</h1>
        <p className="text-gray-600 mb-8">
          De pagina die u probeert te bezoeken bestaat niet of is verplaatst.
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

export default NotFoundPage;