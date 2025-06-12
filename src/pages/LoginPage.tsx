import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import MetaTags from '../components/seo/MetaTags';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store the token in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      
      // Redirect to dashboard or home
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'E-mail of wachtwoord onjuist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MetaTags
        title="Inloggen"
        description="Log in op uw Skillure account om toegang te krijgen tot ons AI-recruitment platform."
        canonical="https://skillure.com/login"
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
            <h1 className="text-3xl font-bold text-midnight mb-2">Welkom terug</h1>
            <p className="text-gray-600">Log in op uw account</p>
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
                label="E-mailadres"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} className="text-gray-400" />}
                placeholder="uw@email.com"
                required
              />

              <div className="relative">
                <Input
                  label="Wachtwoord"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={18} className="text-gray-400" />}
                  placeholder="Uw wachtwoord"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded text-turquoise-500 focus:ring-turquoise-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Onthoud mij</span>
                </label>
                <Link
                  to="/wachtwoord-vergeten"
                  className="text-sm text-turquoise-500 hover:text-turquoise-600"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
              >
                Inloggen
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Nog geen account?{' '}
                <Link
                  to="/register"
                  className="text-turquoise-500 hover:text-turquoise-600 font-medium"
                >
                  Registreer hier
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;