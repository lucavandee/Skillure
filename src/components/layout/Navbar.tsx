// This file is being replaced by the new Header component
// Keeping this as a backup/reference but the new Header.tsx will be used instead
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, User, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'menu' | 'profile' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    {
      label: 'Branches',
      children: [
        { path: '/branches/tech', label: 'Tech' },
        { path: '/branches/healthcare', label: 'Healthcare' },
        { path: '/branches/finance', label: 'Finance' },
      ]
    }
  ];

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
                  {menuItems.map((item, index) => (
                    'children' in item ? (
                      <div key={index}>
                        <div className="px-4 py-2 text-sm font-medium text-gray-500">
                          {item.label}
                        </div>
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className="block px-4 py-2 text-midnight hover:bg-gray-100"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block px-4 py-2 text-midnight hover:bg-gray-100"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button 
              variant="outline"
              className="hidden lg:inline-flex"
            >
              Inloggen
            </Button>
          </Link>
          <Link to="/gratis-proefperiode">
            <Button variant="primary">
              Gratis Proefperiode
            </Button>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
              className="w-10 h-10 rounded-full bg-turquoise-500 flex items-center justify-center text-midnight"
              aria-expanded={activeDropdown === 'profile'}
            >
              <span className="font-semibold">R</span>
            </button>

            <AnimatePresence>
              {activeDropdown === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-lg rounded-lg"
                >
                  <ul>
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-midnight hover:bg-gray-100"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <User size={16} className="mr-2" />
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
                        onClick={() => setActiveDropdown(null)}
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
                {menuItems.map((item, index) => (
                  'children' in item ? (
                    <div key={index}>
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className="block py-2 px-4 text-midnight hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className="block py-2 text-midnight hover:text-turquoise-500"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  )
                ))}
                <li className="pt-4 border-t border-gray-200">
                  <Link
                    to="/login"
                    className="block py-2 text-midnight hover:text-turquoise-500"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inloggen
                  </Link>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;