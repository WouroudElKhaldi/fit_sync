import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ALL_SPECIALTIES = [
  "Strength Training",
  "Hypertrophy",
  "Weight Loss",
  "Rehabilitation",
  "Sports Conditioning",
  "Powerlifting",
  "Contest Prep"
];

const TrainerPortfolioEditor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [trainerUser, setTrainerUser] = useState<any>(null);

  const [isActive, setIsActive] = useState(true);
  const [bio, setBio] = useState("");
  const [education, setEducation] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchTrainerProfile = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('fitsync_token');
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const response = await fetch(`http://localhost:3000/users/${user.id}`, { headers });
        if (response.ok) {
          const data = await response.json();
          setTrainerUser(data);
          
          const profile = data.trainerProfile || {};
          setIsActive(profile.marketplaceActive ?? true);
          setBio(profile.bio || data.bio || "");
          setEducation(profile.education || "");
          setCertifications(profile.certifications || []);
          setSpecialties(profile.specialties || []);
        }
      } catch (err) {
        console.error('Failed to load portfolio details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainerProfile();
  }, [user]);

  const handleAddCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert("");
    }
  };

  const handleRemoveCert = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const toggleSpecialty = (spec: string) => {
    if (specialties.includes(spec)) {
      setSpecialties(specialties.filter(s => s !== spec));
    } else {
      setSpecialties([...specialties, spec]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const token = localStorage.getItem('fitsync_token');
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    const payload = {
      bio,
      trainerProfile: {
        bio,
        education,
        certifications,
        specialties,
        marketplaceActive: isActive
      }
    };

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update portfolio registry');
      }

      alert("Portfolio updated successfully!");
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during portfolio save.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        <p className="text-on-surface-variant/60 font-bold uppercase tracking-widest text-xs">Loading Portfolio Architect...</p>
      </div>
    );
  }

  if (!trainerUser) {
    return <div className="p-8">Trainer profile not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Page Header & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-bold text-on-surface mb-1 font-['Plus_Jakarta_Sans']">
            Public Portfolio Editor
          </h2>
          <p className="text-[16px] leading-[24px] text-on-surface-variant font-['Plus_Jakarta_Sans']">
            Manage how clients discover you on the marketplace.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container p-3 rounded-lg border border-secondary-container/10">
          <span className="text-[14px] leading-[20px] font-semibold text-on-surface-variant font-['Plus_Jakarta_Sans']">
            Marketplace Active
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors"></div>
          </label>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Avatar Card (Left Col on Desktop) */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-surface-container-low border border-secondary-container/10 rounded-xl p-6 flex flex-col items-center text-center shadow-lg">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-colors relative flex items-center justify-center bg-primary/10 text-primary text-4xl font-black">
                {trainerUser.fullName?.charAt(0) || 'T'}
              </div>
            </div>
            <h3 className="text-[20px] leading-[28px] font-semibold text-on-surface mb-1 font-['Plus_Jakarta_Sans']">
              {trainerUser.fullName}
            </h3>
            <p className="text-[12px] leading-[16px] font-medium text-primary uppercase tracking-wider mb-3 font-['Plus_Jakarta_Sans']">
              Elite Trainer
            </p>
          </div>
        </div>

        {/* Details Form (Right Col on Desktop) */}
        <div className="md:col-span-8 space-y-6">
          {/* Bio Card */}
          <div className="bg-surface-container-low border border-secondary-container/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-[20px] leading-7 font-semibold text-on-surface mb-3 flex items-center gap-1 pb-3 border-b border-secondary-container/10 font-['Plus_Jakarta_Sans']">
              <span className="material-symbols-outlined text-primary">description</span>
              Professional Bio
            </h3>
            <div className="mt-6 glow-focus rounded-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <label htmlFor="bio" className="block text-[12px] leading-4 font-medium text-on-surface-variant mb-1 ml-1 font-['Plus_Jakarta_Sans']">
                About You
              </label>
              <textarea
                id="bio"
                className="w-full bg-surface-container border border-secondary-container/20 rounded-lg p-3 text-on-surface text-[16px] leading-6 focus:outline-none resize-none focus:border-primary/50 font-['Plus_Jakarta_Sans']"
                placeholder="Share your training philosophy..."
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Education & Certifications */}
          <div className="bg-surface-container-low border border-secondary-container/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-[20px] leading-7 font-semibold text-on-surface mb-3 flex items-center gap-1 pb-3 border-b border-secondary-container/10 font-['Plus_Jakarta_Sans']">
              <span className="material-symbols-outlined text-primary">school</span>
              Credentials
            </h3>
            <div className="mt-6 space-y-6">
              <div className="glow-focus rounded-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <label htmlFor="education" className="block text-[12px] leading-4 font-medium text-on-surface-variant mb-1 ml-1 font-['Plus_Jakarta_Sans']">
                  Highest Education
                </label>
                <input
                  id="education"
                  type="text"
                  className="w-full bg-surface-container border border-secondary-container/20 rounded-lg p-3 text-on-surface text-[16px] leading-6 focus:outline-none focus:border-primary/50 font-['Plus_Jakarta_Sans']"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[12px] leading-4 font-medium text-on-surface-variant mb-3 ml-1 font-['Plus_Jakarta_Sans']">
                  Certifications (Tags)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {certifications.map(cert => (
                    <span key={cert} className="inline-flex items-center gap-1 bg-surface-container text-on-surface px-3 py-1 rounded-md text-sm border border-secondary-container/20 font-['Plus_Jakarta_Sans']">
                      {cert}
                      <button onClick={() => handleRemoveCert(cert)} className="hover:text-error transition-colors flex items-center justify-center cursor-pointer">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 bg-surface-container border border-secondary-container/20 rounded-lg p-2 text-on-surface text-sm focus:outline-none focus:border-primary/50 font-['Plus_Jakarta_Sans']"
                    placeholder="Add certification..."
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCert()}
                  />
                  <button onClick={handleAddCert} className="bg-surface-container-high border border-secondary-container/30 text-on-surface px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors font-semibold text-sm font-['Plus_Jakarta_Sans'] cursor-pointer">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="bg-surface-container-low border border-secondary-container/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-[20px] leading-7 font-semibold text-on-surface mb-3 flex items-center gap-1 pb-3 border-b border-secondary-container/10 font-['Plus_Jakarta_Sans']">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Training Specialties
            </h3>
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                {ALL_SPECIALTIES.map(spec => (
                  <label key={spec} className="cursor-pointer relative">
                    <input 
                      type="checkbox" 
                      className="peer sr-only" 
                      checked={specialties.includes(spec)}
                      onChange={() => toggleSpecialty(spec)}
                    />
                    <div className="px-4 py-2 rounded-lg border border-secondary-container/20 bg-surface-container text-on-surface-variant text-[14px] leading-5 font-semibold peer-checked:bg-primary/20 peer-checked:border-primary peer-checked:text-primary transition-all font-['Plus_Jakarta_Sans'] select-none">
                      {spec}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button onClick={() => navigate('/profile')} className="bg-transparent text-on-surface-variant py-3 px-6 rounded-lg text-[14px] leading-5 font-semibold hover:text-on-surface hover:bg-surface-container-highest transition-colors font-['Plus_Jakarta_Sans'] cursor-pointer">
              Discard Changes
            </button>
            <button onClick={handleSave} className="bg-primary text-on-primary py-3 px-8 rounded-lg text-[14px] leading-5 font-semibold hover:bg-primary-fixed transition-colors shadow-[0_0_15px_rgba(208,188,255,0.3)] font-['Plus_Jakarta_Sans'] cursor-pointer">
              Save Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerPortfolioEditor;
