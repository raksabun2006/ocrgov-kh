'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { OfficerProfile } from '../types/document';

const defaultOfficer: OfficerProfile = {
  name: 'officer',
  officerId: 'officer',
  departmentKhmer: '',
  departmentEnglish: '',
  roleKhmer: '',
  roleEnglish: '',
};

interface AuthContextType {
  officer: OfficerProfile;
  setOfficer: (officer: OfficerProfile) => void;
  updateOfficerName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  officer: defaultOfficer,
  setOfficer: () => {},
  updateOfficerName: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [officer, setOfficerState] = useState<OfficerProfile>(defaultOfficer);

  useEffect(() => {
    const saved = localStorage.getItem('gov_ocr_officer');
    if (saved) {
      try {
        setOfficerState(JSON.parse(saved));
      } catch {
        // use default
      }
    }
  }, []);

  const setOfficer = (newOfficer: OfficerProfile) => {
    setOfficerState(newOfficer);
    localStorage.setItem('gov_ocr_officer', JSON.stringify(newOfficer));
  };

  const updateOfficerName = (name: string) => {
    const updated = { ...officer, name };
    setOfficerState(updated);
    localStorage.setItem('gov_ocr_officer', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        officer,
        setOfficer,
        updateOfficerName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
