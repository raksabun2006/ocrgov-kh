'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { OfficerProfile } from '../types/document';
import { UserProfileResponse, LoginRequest } from '../types/api';
import { loginApi, logoutApi, getCurrentUserProfile } from './api/ocr';
import { setAuthToken, clearAuthToken, getAuthToken } from './api/client';

const defaultOfficer: OfficerProfile = {
  name: '',
  officerId: '',
  departmentKhmer: '',
  departmentEnglish: '',
  roleKhmer: '',
  roleEnglish: '',
};

interface AuthContextType {
  user: UserProfileResponse | null;
  officer: OfficerProfile;
  isAuthenticated: boolean;
  isGuest: boolean;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  updateOfficerName: (name: string) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  officer: defaultOfficer,
  isAuthenticated: false,
  isGuest: true,
  roles: [],
  permissions: [],
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  hasRole: () => false,
  hasAnyRole: () => false,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  updateOfficerName: () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
      setOfficerState({
        name: profile.full_name || profile.username,
        officerId: profile.id,
        departmentKhmer: 'នាយកដ្ឋានអត្រានុកូលដ្ឋាន',
        departmentEnglish: 'Civil Registration Dept',
        roleKhmer: Array.isArray(profile.roles) ? profile.roles.join(', ') : '',
        roleEnglish: Array.isArray(profile.roles) ? profile.roles.join(', ') : '',
      });
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await loginApi(credentials);
      setAuthToken(res.access_token);
      setUser(res.user);
      setOfficerState({
        name: res.user.full_name || res.user.username,
        officerId: res.user.id,
        departmentKhmer: 'នាយកដ្ឋានអត្រានុកូលដ្ឋាន',
        departmentEnglish: 'Civil Registration Dept',
        roleKhmer: Array.isArray(res.user.roles) ? res.user.roles.join(', ') : '',
        roleEnglish: Array.isArray(res.user.roles) ? res.user.roles.join(', ') : '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi().catch(() => {});
    } finally {
      clearAuthToken();
      setUser(null);
      setOfficerState(defaultOfficer);
      setIsLoading(false);
    }
  };

  const roles = user && Array.isArray(user.roles) ? user.roles : [];
  const permissions = user && Array.isArray(user.permissions) ? user.permissions : [];

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    const target = role.toLowerCase();
    return roles.some(
      (r) =>
        r.toLowerCase() === target ||
        r.toUpperCase() === 'ADMIN' ||
        r.toUpperCase() === 'SUPER_ADMIN'
    );
  };

  const hasAnyRole = (checkRoles: string[]): boolean => {
    if (!user) return false;
    return checkRoles.some((r) => hasRole(r));
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    // Administrators with SUPER_ADMIN or ADMIN have root access
    if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return permissions.includes(permission);
  };

  const hasAnyPermission = (checkPermissions: string[]): boolean => {
    if (!user) return false;
    if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return checkPermissions.some((p) => permissions.includes(p));
  };

  const hasAllPermissions = (checkPermissions: string[]): boolean => {
    if (!user) return false;
    if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
      return true;
    }
    return checkPermissions.every((p) => permissions.includes(p));
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
        user,
        officer,
        isAuthenticated: !!user,
        isGuest: !user,
        roles,
        permissions,
        isLoading,
        login,
        logout,
        hasRole,
        hasAnyRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        updateOfficerName,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
