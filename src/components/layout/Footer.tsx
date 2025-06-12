import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-midnight text-white py-12" role="contentinfo">
      <div className="container-custom">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Product Column */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Product</h2>
            <nav aria-label="Product navigation">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/search" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Zoek Kandidaten
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/radar" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Freelance Radar
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/vacancies/new" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Vacature Uploaden
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Company Column */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Bedrijf</h2>
            <nav aria-label="Company navigation">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/about" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/faq" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/prijzen" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Prijzen
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Resources & Legal Column */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Resources</h2>
            <nav aria-label="Resources navigation">
              <ul className="space-y-2 mb-6">
                <li>
                  <Link 
                    to="/blog" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/api-docs" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    API Docs
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/support" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </nav>
            <h2 className="text-lg font-semibold mb-4">Legal</h2>
            <nav aria-label="Legal navigation">
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/privacy" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Privacybeleid
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/terms" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Gebruiksvoorwaarden
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/cookies" 
                    className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded"
                  >
                    Cookiebeleid
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Newsletter & Social Column */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Nieuwsbrief</h2>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert('Bedankt voor je inschrijving!');
              }}
              className="space-y-3"
              aria-label="Nieuwsbrief inschrijving"
            >
              <div>
                <label htmlFor="newsletter-email" className="sr-only">
                  E-mail adres
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="E-mail adres"
                  className="w-full px-4 py-2 bg-midnight-200 border border-midnight-100 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  aria-label="Voer je e-mailadres in voor de nieuwsbrief"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-turquoise-500 text-midnight font-semibold rounded-lg hover:bg-turquoise-400 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight"
              >
                Abonneer
              </button>
            </form>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Volg ons</h2>
              <div className="flex space-x-4">
                <a
                  href="https://linkedin.com/company/skillure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded-full p-1"
                  aria-label="Bezoek onze LinkedIn pagina"
                >
                  <Linkedin size={20} aria-hidden="true" />
                </a>
                <a
                  href="https://twitter.com/skillure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded-full p-1"
                  aria-label="Bezoek onze Twitter pagina"
                >
                  <Twitter size={20} aria-hidden="true" />
                </a>
                <a
                  href="https://github.com/skillure"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-turquoise-500 transition-colors focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:ring-offset-2 focus:ring-offset-midnight rounded-full p-1"
                  aria-label="Bezoek onze GitHub pagina"
                >
                  <Github size={20} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-midnight-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Skillure · Alle rechten voorbehouden</p>
          <p className="flex items-center mt-4 md:mt-0">
            Gemaakt met <Heart size={14} className="text-red-500 mx-1" aria-label="liefde" /> in Nederland
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;