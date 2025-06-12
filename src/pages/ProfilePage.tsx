import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Github, Linkedin, Globe, Calendar, Shield, Plus, X, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import MetaTags from '../components/seo/MetaTags';

interface CandidateProfile {
  id: number;
  user_id: number;
  phone?: string;
  location?: string;
  summary?: string;
  github_url?: string;
  kaggle_url?: string;
  linkedin_url?: string;
  big_number?: string;
  kyc_file_path?: string;
  availability?: string;
  skills: CandidateSkill[];
}

interface CandidateSkill {
  id: number;
  skill_name: string;
  level: number;
}

interface NewSkill {
  skill_name: string;
  level: number;
}

const ProfilePage: React.FC = () => {
  const { user, getAuthHeaders } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState<NewSkill>({ skill_name: '', level: 1 });
  const [showAddSkill, setShowAddSkill] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
    location: '',
    summary: '',
    github_url: '',
    kaggle_url: '',
    linkedin_url: '',
    big_number: '',
    availability: ''
  });

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/candidates/me/profile', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
        setFormData({
          phone: profileData.phone || '',
          location: profileData.location || '',
          summary: profileData.summary || '',
          github_url: profileData.github_url || '',
          kaggle_url: profileData.kaggle_url || '',
          linkedin_url: profileData.linkedin_url || '',
          big_number: profileData.big_number || '',
          availability: profileData.availability || ''
        });
      } else if (response.status === 404) {
        // Profile doesn't exist yet, that's okay
        setProfile(null);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (err) {
      setError('Kon profiel niet laden');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/candidates/me/profile', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save profile');
      }
    } catch (err: any) {
      setError(err.message || 'Kon profiel niet opslaan');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.skill_name.trim()) return;

    try {
      const response = await fetch('http://localhost:8000/candidates/me/skills', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSkill),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setNewSkill({ skill_name: '', level: 1 });
        setShowAddSkill(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add skill');
      }
    } catch (err: any) {
      setError(err.message || 'Kon vaardigheid niet toevoegen');
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/candidates/me/skills/${skillId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchProfile(); // Refresh profile
      } else {
        throw new Error('Failed to remove skill');
      }
    } catch (err) {
      setError('Kon vaardigheid niet verwijderen');
    }
  };

  const getSkillLevelText = (level: number) => {
    const levels = ['Beginner', 'Basis', 'Gemiddeld', 'Gevorderd', 'Expert'];
    return levels[level - 1] || 'Onbekend';
  };

  const getSkillLevelColor = (level: number) => {
    const colors = ['bg-gray-200', 'bg-blue-200', 'bg-yellow-200', 'bg-orange-200', 'bg-green-200'];
    return colors[level - 1] || 'bg-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightgray-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-turquoise-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user?.role !== 'candidate') {
    return (
      <div className="min-h-screen bg-lightgray-500 py-8">
        <div className="container-custom">
          <Card className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profiel niet beschikbaar</h2>
            <p className="text-gray-600">
              Deze pagina is alleen beschikbaar voor kandidaten.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title="Mijn Profiel"
        description="Beheer uw kandidaatprofiel en vaardigheden op Skillure."
        canonical="https://skillure.com/profile"
      />

      <div className="min-h-screen bg-lightgray-500 py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-midnight mb-2">Mijn Profiel</h1>
              <p className="text-gray-600">
                Beheer uw persoonlijke informatie en vaardigheden
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Profile Card */}
            <Card className="p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-turquoise-500 rounded-full flex items-center justify-center text-midnight font-bold text-xl mr-4">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.full_name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <Badge variant="primary" className="mt-1">Kandidaat</Badge>
                  </div>
                </div>
                {!editing && (
                  <Button
                    variant="outline"
                    leftIcon={<Edit3 size={18} />}
                    onClick={() => setEditing(true)}
                  >
                    Bewerken
                  </Button>
                )}
              </div>

              {editing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Telefoon"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      icon={<Phone size={18} className="text-gray-400" />}
                      placeholder="+31 6 12345678"
                    />

                    <Input
                      label="Locatie"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      icon={<MapPin size={18} className="text-gray-400" />}
                      placeholder="Amsterdam, Nederland"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-midnight mb-1.5">
                      Samenvatting
                    </label>
                    <textarea
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      rows={4}
                      className="input-field resize-y"
                      placeholder="Vertel iets over uzelf, uw ervaring en ambities..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="GitHub URL"
                      name="github_url"
                      value={formData.github_url}
                      onChange={handleInputChange}
                      icon={<Github size={18} className="text-gray-400" />}
                      placeholder="https://github.com/username"
                    />

                    <Input
                      label="LinkedIn URL"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      icon={<Linkedin size={18} className="text-gray-400" />}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Kaggle URL"
                      name="kaggle_url"
                      value={formData.kaggle_url}
                      onChange={handleInputChange}
                      icon={<Globe size={18} className="text-gray-400" />}
                      placeholder="https://kaggle.com/username"
                    />

                    <div>
                      <label className="block text-sm font-medium text-midnight mb-1.5">
                        Beschikbaarheid
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Selecteer beschikbaarheid</option>
                        <option value="Direct">Direct</option>
                        <option value="Binnen 2 weken">Binnen 2 weken</option>
                        <option value="Binnen 1 maand">Binnen 1 maand</option>
                        <option value="Anders">Anders</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="BIG-nummer (alleen voor Healthcare)"
                    name="big_number"
                    value={formData.big_number}
                    onChange={handleInputChange}
                    icon={<Shield size={18} className="text-gray-400" />}
                    placeholder="12345678901"
                  />

                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      leftIcon={<Save size={18} />}
                      onClick={handleSave}
                      isLoading={saving}
                    >
                      Opslaan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        if (profile) {
                          setFormData({
                            phone: profile.phone || '',
                            location: profile.location || '',
                            summary: profile.summary || '',
                            github_url: profile.github_url || '',
                            kaggle_url: profile.kaggle_url || '',
                            linkedin_url: profile.linkedin_url || '',
                            big_number: profile.big_number || '',
                            availability: profile.availability || ''
                          });
                        }
                      }}
                    >
                      Annuleren
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Phone size={18} className="text-gray-400 mr-3" />
                          <span>{profile.phone || '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={18} className="text-gray-400 mr-3" />
                          <span>{profile.location || '—'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={18} className="text-gray-400 mr-3" />
                          <span>{profile.availability || '—'}</span>
                        </div>
                        {profile.big_number && (
                          <div className="flex items-center">
                            <Shield size={18} className="text-gray-400 mr-3" />
                            <span>BIG: {profile.big_number}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {profile.github_url && (
                          <div className="flex items-center">
                            <Github size={18} className="text-gray-400 mr-3" />
                            <a
                              href={profile.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-turquoise-500 hover:text-turquoise-600"
                            >
                              GitHub Profiel
                            </a>
                          </div>
                        )}
                        {profile.linkedin_url && (
                          <div className="flex items-center">
                            <Linkedin size={18} className="text-gray-400 mr-3" />
                            <a
                              href={profile.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-turquoise-500 hover:text-turquoise-600"
                            >
                              LinkedIn Profiel
                            </a>
                          </div>
                        )}
                        {profile.kaggle_url && (
                          <div className="flex items-center">
                            <Globe size={18} className="text-gray-400 mr-3" />
                            <a
                              href={profile.kaggle_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-turquoise-500 hover:text-turquoise-600"
                            >
                              Kaggle Profiel
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        U heeft nog geen profiel aangemaakt.
                      </p>
                      <Button
                        variant="primary"
                        onClick={() => setEditing(true)}
                      >
                        Profiel aanmaken
                      </Button>
                    </div>
                  )}

                  {profile?.summary && (
                    <div className="mt-6 pt-6 border-t border-lightgray-800">
                      <h3 className="font-bold mb-2">Samenvatting</h3>
                      <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </Card>

            {/* Skills Section */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Vaardigheden</h2>
                <Button
                  variant="outline"
                  leftIcon={<Plus size={18} />}
                  onClick={() => setShowAddSkill(true)}
                >
                  Vaardigheid toevoegen
                </Button>
              </div>

              {showAddSkill && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-4 bg-lightgray-500 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label="Vaardigheid"
                        value={newSkill.skill_name}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, skill_name: e.target.value }))}
                        placeholder="bijv. React, Python, Machine Learning"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-midnight mb-1.5">
                        Niveau
                      </label>
                      <select
                        value={newSkill.level}
                        onChange={(e) => setNewSkill(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                        className="input-field"
                      >
                        <option value={1}>Beginner</option>
                        <option value={2}>Basis</option>
                        <option value={3}>Gemiddeld</option>
                        <option value={4}>Gevorderd</option>
                        <option value={5}>Expert</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddSkill}
                      disabled={!newSkill.skill_name.trim()}
                    >
                      Toevoegen
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddSkill(false);
                        setNewSkill({ skill_name: '', level: 1 });
                      }}
                    >
                      Annuleren
                    </Button>
                  </div>
                </motion.div>
              )}

              {profile?.skills && profile.skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.skills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-lg border-2 border-transparent ${getSkillLevelColor(skill.level)} relative group`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{skill.skill_name}</h4>
                          <p className="text-sm text-gray-600">{getSkillLevelText(skill.level)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSkill(skill.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                        >
                          <X size={16} className="text-red-500" />
                        </button>
                      </div>
                      <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
                        <div
                          className="bg-turquoise-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(skill.level / 5) * 100}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-lightgray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Nog geen vaardigheden toegevoegd.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddSkill(true)}
                  >
                    Eerste vaardigheid toevoegen
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;