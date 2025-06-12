import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import MetaTags from '../components/seo/MetaTags';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    role: 'candidate' as 'candidate' | 'recruiter' | 'company'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens bevatten');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.full_name,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registratie mislukt');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-lightgray-500 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-midnight mb-2">Registratie succesvol!</h2>
            <p className="text-gray-600 mb-4">
              Uw account is aangemaakt. U wordt doorgestuurd naar de inlogpagina.
            </p>
            <div className="animate-spin w-6 h-6 border-2 border-turquoise-500 border-t-transparent rounded-full mx-auto"></div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title="Registreren"
        description="Maak een account aan bij Skillure en begin met het vinden van talent via onze AI-matching technologie."
        canonical="https://skillure.com/register"
      />

      <div className="min-h-screen bg-lightgray-500 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-turquoise-500 rounded-lg flex items-center justify-center">
                <span className="text-midnight font-bold text-xl">SK</span>
              </div>
              <span className="text-2xl font-bold text-midnight">Skillure</span>
            </Link>
            <h1 className="text-3xl font-bold text-midnight mb-2">Account aanmaken</h1>
            <p className="text-gray-600">Begin met het vinden van talent</p>
          </div>

          <Card className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Volledige naam"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                icon={<User size={18} className="text-gray-400" />}
                placeholder="Voor- en achternaam"
                required
              />

              <Input
                label="E-mailadres"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                icon={<Mail size={18} className="text-gray-400" />}
                placeholder="uw@email.com"
                required
              />

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-midnight mb-1.5">
                  Ik ben een
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="candidate">Kandidaat</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="company">Bedrijf</option>
                </select>
              </div>

              <div className="relative">
                <Input
                  label="Wachtwoord"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  icon={<Lock size={18} className="text-gray-400" />}
                  placeholder="Minimaal 8 tekens"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Bevestig wachtwoord"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  icon={<Lock size={18} className="text-gray-400" />}
                  placeholder="Herhaal uw wachtwoord"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="text-xs text-gray-500">
                Door te registreren gaat u akkoord met onze{' '}
                <Link to="/terms" className="text-turquoise-500 hover:text-turquoise-600">
                  Gebruiksvoorwaarden
                </Link>{' '}
                en{' '}
                <Link to="/privacy" className="text-turquoise-500 hover:text-turquoise-600">
                  Privacybeleid
                </Link>
                .
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Account aanmaken
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Al een account?{' '}
                <Link
                  to="/login"
                  className="text-turquoise-500 hover:text-turquoise-600 font-medium"
                >
                  Log hier in
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default RegisterPage;