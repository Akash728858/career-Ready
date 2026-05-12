import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const PROFILE_STORAGE_KEY = 'career_platform_profile';

const defaultProfile = {
  photoUrl: '',
  name: '',
  email: '',
  phone: '',
  summary: '',
  skills: [],
  linkedIn: '',
  github: '',
  portfolio: '',
  projects: [],
};

function getStorageKey(email) {
  return email ? `${PROFILE_STORAGE_KEY}_${email.replace(/[^a-zA-Z0-9]/g, '_')}` : null;
}

function loadProfile(email) {
  const key = getStorageKey(email);
  if (!key) return { ...defaultProfile };
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...defaultProfile };
    const parsed = JSON.parse(raw);
    const projects = (parsed.projects || []).map((p) => ({
      ...p,
      id: p.id || `p-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    return { ...defaultProfile, ...parsed, projects };
  } catch {
    return { ...defaultProfile };
  }
}

function saveProfileToStorage(email, data) {
  const key = getStorageKey(email);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState(defaultProfile);

  useEffect(() => {
    if (!user?.email) {
      setProfileState({ ...defaultProfile });
      return;
    }
    const loaded = loadProfile(user.email);
    setProfileState({
      ...loaded,
      name: loaded.name || user.name || '',
      email: user.email,
    });
  }, [user?.email, user?.name]);

  const updateProfile = useCallback((updates) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      saveProfileToStorage(prev.email, next);
      return next;
    });
  }, []);

  const setPhotoUrl = useCallback((url) => {
    setProfileState((prev) => {
      const next = { ...prev, photoUrl: url };
      saveProfileToStorage(prev.email, next);
      return next;
    });
  }, []);

  const value = { profile, updateProfile, setPhotoUrl };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
