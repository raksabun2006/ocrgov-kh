'use client';

import React, { createContext, useContext, useState } from 'react';
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
  const [officer, setOfficerState] = useState<OfficerProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gov_ocr_officer');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return defaultOfficer;
  });

  const setOfficer = (newOfficer: OfficerProfile) => {
    setOfficerState(newOfficer);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gov_ocr_officer', JSON.stringify(newOfficer));
    }
  };

  const updateOfficerName = (name: string) => {
    const updated = { ...officer, name };
    setOfficerState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gov_ocr_officer', JSON.stringify(updated));
    }
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
