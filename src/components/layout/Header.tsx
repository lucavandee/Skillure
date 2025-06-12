import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, User, Settings, LogOut, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'menu' | 'profile' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { path: '/search', label: 'Zoek Kandidaten' },
    { path: '/radar', label: 'Freelance Radar' },
    { path: '/vacancies/new', label: 'Vacature Uploaden' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/about', label: 'Over ons' },
    { path: '/faq', label: 'FAQ' },
    { path: '/branches/tech', label: 'Branches' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setActiveDropdown(null);
  };

  const getProfilePath = () => {
    if (user?.role === 'company' || user?.role === 'recruiter') {
      return '/profile/company';
    }
    return '/profile';
  };

  return (
    <nav className="sticky top-0 bg-white shadow-md py-4 px-8 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo & Brand */}
        <Link 
          to="/" 
          className="flex items-center space-x-2"
          aria-label="Skillure home"
        >
          <div className="w-8 h-8 bg-turquoise-500 rounded-lg flex items-center justify-center">
            <span className="text-midnight font-bold text-xl">SK</span>
          </div>
          <span className="text-2xl font-bold text-midnight">Skillure</span>
        </Link>

        {/* Menu Dropdown - Desktop */}
        <div className="hidden lg:block relative" ref={dropdownRef}>
          <button
            className={cn(
              'text-lg font-medium text-midnight focus:outline-none flex items-center gap-1',
              activeDropdown === 'menu' && 'text-turquoise-500'
            )}
            onClick={() => setActiveDropdown(activeDropdown === 'menu' ? null : 'menu')}
            aria-haspopup="true"
            aria-expanded={activeDropdown === 'menu'}
          >
            Menu
            <ChevronDown 
              size={16} 
              className={cn(
                'transition-transform duration-200',
                activeDropdown === 'menu' && 'rotate-180'
              )} 
            />
          </button>

          <AnimatePresence>
            {activeDropdown === 'menu' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg"
              >
                <ul>
                  {menuItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="block px-4 py-2 text-midnight hover:bg-gray-100 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Authenticated User Menu */}
              <div className="hidden lg:flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welkom, {user?.full_name?.split(' ')[0]}
                </span>
                <Link to="/dashboard">
                  <Button variant="outline">
                    Dashboard
                  </Button>
                </Link>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                  className="w-10 h-10 rounded-full bg-turquoise-500 flex items-center justify-center text-midnight font-semibold hover:bg-turquoise-600 transition-colors"
                  aria-expanded={activeDropdown === 'profile'}
                >
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg"
                    >
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-midnight">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <p className="text-xs text-turquoise-600 capitalize">{user?.role}</p>
                      </div>
                      <ul>
                        <li>
                          <Link
                            to={getProfilePath()}
                            className="flex items-center px-4 py-2 text-midnight hover:bg-gray-100"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {user?.role === 'company' || user?.role === 'recruiter' ? (
                              <Building size={16} className="mr-2" />
                            ) : (
                              <User size={16} className="mr-2" />
                            )}
                            Mijn Profiel
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-midnight hover:bg-gray-100"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <Settings size={16} className="mr-2" />
                            Instellingen
                          </Link>
                        </li>
                        <li>
                          <button
                            className="w-full flex items-center px-4 py-2 text-red-500 hover:bg-gray-100 text-left"
                            onClick={handleLogout}
                          >
                            <LogOut size={16} className="mr-2" />
                            Uitloggen
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated User Menu */}
              <Link to="/login">
                <Button 
                  variant="outline"
                  className="hidden lg:inline-flex"
                >
                  Inloggen
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">
                  Registreren
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-midnight"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label="Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-[72px] bg-white z-40 lg:hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <ul className="space-y-4">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="block py-2 text-midnight hover:text-turquoise-500"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                
                {isAuthenticated ? (
                  <>
                    <li className="pt-4 border-t border-gray-200">
                      <Link
                        to={getProfilePath()}
                        className="block py-2 text-midnight hover:text-turquoise-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mijn Profiel
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dashboard"
                        className="block py-2 text-midnight hover:text-turquoise-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        className="block py-2 text-red-500 hover:text-red-600 text-left"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        Uitloggen
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="pt-4 border-t border-gray-200">
                      <Link
                        to="/login"
                        className="block py-2 text-midnight hover:text-turquoise-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Inloggen
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="block py-2 text-midnight hover:text-turquoise-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Registreren
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;