'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Lock,
  RefreshCw,
  MoreVertical,
  X,
  AlertCircle,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { useLanguage } from '../../lib/i18n';
import { useAuth } from '../../lib/auth-context';
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUserStatus,
  assignAdminUserRoles,
  listAdminRoles,
} from '../../lib/api/ocr';
import { UserProfileResponse, CreateUserRequest, RoleItem } from '../../types/api';
import { SkeletonTable } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PermissionGuard } from '../../components/auth/PermissionGuard';

const DEFAULT_ROLES: RoleItem[] = [
  { name: 'ADMIN', description: 'Full system and administrative authority.', permissions: [] },
  { name: 'OFFICER', description: 'Civil registration officer.', permissions: [] },
  { name: 'VERIFIER', description: 'Verification and validation specialist.', permissions: [] },
  { name: 'AUDITOR', description: 'Audit trail and compliance inspector.', permissions: [] },
];

export default function UsersPage() {
  const { t, language } = useLanguage();
  const { isAuthenticated, hasRole } = useAuth();

  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalUser, setStatusModalUser] = useState<UserProfileResponse | null>(null);
  const [rolesModalUser, setRolesModalUser] = useState<UserProfileResponse | null>(null);

  // Create User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRoles, setNewRoles] = useState<string[]>(['OFFICER']);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        listAdminUsers(0, 100).catch(() => []),
        listAdminRoles().catch(() => []),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) && rolesData.length > 0 ? rolesData : DEFAULT_ROLES);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to retrieve administrative users.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload: CreateUserRequest = {
        username: newUsername.trim(),
        email: newEmail.trim(),
        full_name: newFullName.trim(),
        password: newPassword,
        role_names: newRoles,
      };

      await createAdminUser(payload);
      setCreateModalOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      setNewRoles(['OFFICER']);
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'LOCKED') => {
    try {
      await updateAdminUserStatus(userId, newStatus);
      setStatusModalUser(null);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleAssignRoles = async (userId: string, selectedRoles: string[]) => {
    try {
      await assignAdminUserRoles(userId, selectedRoles);
      setRolesModalUser(null);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to assign roles');
    }
  };

  // Safe arrays
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRoles = Array.isArray(roles) && roles.length > 0 ? roles : DEFAULT_ROLES;

  // Filtered Users
  const filteredUsers = safeUsers.filter((u) => {
    if (!u) return false;
    const q = (searchQuery || '').toLowerCase();
    const username = (u.username || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const fullName = (u.full_name || '').toLowerCase();
    const matchesSearch = username.includes(q) || email.includes(q) || fullName.includes(q);
    const matchesStatus = !statusFilter || u.status === statusFilter;
    const userRoles = Array.isArray(u.roles) ? u.roles : [];
    const matchesRole = !roleFilter || userRoles.includes(roleFilter);
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <Shell>
      <PermissionGuard requiredRole="ADMIN" requiredAnyPermissions={['users:read', 'users:write']}>
        <div className="space-y-4 sm:space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#5E6C84] mb-1 font-khmer">
              <Link href="/" className="hover:text-[#2457A7]">
                {t.navDashboard}
              </Link>
              <span>/</span>
              <span className="text-[#172B4D] font-semibold">{t.navUsers}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer">
              {t.navUsers}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-khmer">ផ្ទុកឡើងវិញ</span>
            </button>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] transition-all shadow-xs cursor-pointer font-khmer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'km' ? 'បង្កើតអ្នកប្រើប្រាស់ថ្មី' : 'Create User'}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl p-3.5 sm:p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'km'
                    ? 'ស្វែងរកតាមឈ្មោះ គណនី ឬអ៊ីមែល...'
                    : 'Search by username, name, email...'
                }
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] font-khmer focus:outline-hidden focus:ring-1 focus:ring-[#2457A7]"
              />
              <Search className="w-4 h-4 text-[#7A869A] absolute left-3 top-3 sm:top-2.5 pointer-events-none" />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] font-khmer focus:outline-hidden"
              >
                <option value="">
                  {language === 'km' ? 'គ្រប់តួនាទី (All Roles)' : 'All Roles'}
                </option>
                {safeRoles.map((r) => (
                  <option key={r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] font-khmer focus:outline-hidden"
              >
                <option value="">
                  {language === 'km' ? 'គ្រប់ស្ថានភាព (All Statuses)' : 'All Statuses'}
                </option>
                <option value="ACTIVE">ACTIVE (សកម្ម)</option>
                <option value="INACTIVE">INACTIVE (អសកម្ម)</option>
                <option value="LOCKED">LOCKED (ចាក់សោ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
          {error && !isLoading ? (
            <div className="p-6">
              <ErrorState
                title="មិនអាចទាញយកទិន្នន័យអ្នកប្រើប្រាស់បានទេ"
                message={error}
                onRetry={loadData}
              />
            </div>
          ) : isLoading ? (
            <div className="p-4">
              <SkeletonTable rows={6} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                language === 'km'
                  ? 'មិនមានអ្នកប្រើប្រាស់នៅក្នុងបញ្ជីទេ'
                  : 'No users found matching query'
              }
              description={
                language === 'km'
                  ? 'អ្នកអាចចុចប៊ូតុង "បង្កើតអ្នកប្រើប្រាស់ថ្មី" ដើម្បីបន្ថែមគណនីមន្ត្រីថ្មី។'
                  : 'Click Create User to add a new government officer account.'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E5EAF0] bg-[#F5F7FA] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-5 font-khmer">ឈ្មោះគណនី / មន្ត្រី</th>
                    <th className="py-3 px-3 sm:px-4 font-khmer">អ៊ីមែល</th>
                    <th className="py-3 px-3 sm:px-4 font-khmer">តួនាទី</th>
                    <th className="py-3 px-3 sm:px-4 font-khmer">ស្ថានភាព</th>
                    <th className="py-3 px-4 sm:px-5 text-right font-khmer">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF0] text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-4 sm:px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#EFF4FC] text-[#2457A7] font-bold text-xs flex items-center justify-center">
                            {u.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-[#172B4D] block">
                              {u.username}
                            </span>
                            <span className="text-[11px] text-[#5E6C84] font-khmer">
                              {u.full_name || 'មន្ត្រីរដ្ឋបាល'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 font-mono text-[#5E6C84]">
                        {u.email}
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(u.roles) ? u.roles : []).map((r) => (
                            <span
                              key={r}
                              className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-semibold bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7]"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            u.status === 'ACTIVE'
                              ? 'bg-[#E3FCEF] text-[#00875A] border-[#ABF5D1]'
                              : u.status === 'LOCKED'
                              ? 'bg-[#FFEBE6] text-[#DE350B] border-[#FFBDAD]'
                              : 'bg-[#FFF0B3] text-[#FF991F] border-[#FFE58F]'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : u.status === 'LOCKED' ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{u.status}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setStatusModalUser(u)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-[#D0E0F7] bg-white text-[#172B4D] hover:bg-[#F5F7FA] font-khmer cursor-pointer"
                          >
                            ស្ថានភាព
                          </button>
                          <button
                            onClick={() => setRolesModalUser(u)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer cursor-pointer"
                          >
                            តួនាទី
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-[#E5EAF0] rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5EAF0] bg-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#2457A7]" />
                <h3 className="text-sm sm:text-base font-bold text-[#172B4D] font-khmer">
                  {language === 'km' ? 'បង្កើតគណនីមន្ត្រីថ្មី' : 'Create Government Officer Account'}
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-[#5E6C84] hover:text-[#172B4D] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-[#FFEBE6] border border-[#FFBDAD] text-xs text-[#DE350B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                    ឈ្មោះគណនី (Username) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. sokha_admin"
                    className="w-full px-3 py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                    អ៊ីមែល (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="officer@domain.gov.kh"
                    className="w-full px-3 py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  គោត្តនាម និងនាម (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. សុខ សុខា"
                  className="w-full px-3 py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] font-khmer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  ពាក្យសម្ងាត់ (Password, min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1 font-khmer">
                  តួនាទី (Role Assignment)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['ADMIN', 'OFFICER', 'VERIFIER', 'AUDITOR'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        if (newRoles.includes(role)) {
                          setNewRoles(newRoles.filter((r) => r !== role));
                        } else {
                          setNewRoles([...newRoles, role]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        newRoles.includes(role)
                          ? 'bg-[#2457A7] text-white border-[#2457A7]'
                          : 'bg-white text-[#5E6C84] border-[#D0E0F7] hover:border-[#2457A7]'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAF0]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D0E0F7] bg-white text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#2457A7] text-white hover:bg-[#1c4587] font-khmer shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'កំពុងបង្កើត...' : 'បញ្ជាក់ការបង្កើត'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#172B4D] font-khmer">
              កែប្រែស្ថានភាពគណនី: <span className="text-[#2457A7]">{statusModalUser.username}</span>
            </h3>
            <p className="text-xs text-[#5E6C84] font-khmer">
              ជ្រើសរើសស្ថានភាពថ្មីសម្រាប់មន្ត្រីនេះ៖
            </p>
            <div className="space-y-2">
              <button
                onClick={() => handleUpdateStatus(statusModalUser.id, 'ACTIVE')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#E3FCEF] text-[#00875A] border border-[#ABF5D1] hover:bg-[#ABF5D1]/40 text-left flex items-center justify-between font-khmer"
              >
                <span>ACTIVE (សកម្ម — អាចចូលប្រើបាន)</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateStatus(statusModalUser.id, 'INACTIVE')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#FFF0B3] text-[#FF991F] border border-[#FFE58F] hover:bg-[#FFE58F]/40 text-left flex items-center justify-between font-khmer"
              >
                <span>INACTIVE (អសកម្ម — ផ្អាកបណ្ដោះអាសន្ន)</span>
                <XCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateStatus(statusModalUser.id, 'LOCKED')}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD] hover:bg-[#FFBDAD]/40 text-left flex items-center justify-between font-khmer"
              >
                <span>LOCKED (ចាក់សោ — ហាមឃាត់ការចូល)</span>
                <Lock className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStatusModalUser(null)}
                className="px-4 py-1.5 text-xs rounded-lg border border-[#D0E0F7] text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {rolesModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#172B4D] font-khmer">
              កំណត់តួនាទី: <span className="text-[#2457A7]">{rolesModalUser.username}</span>
            </h3>
            <div className="space-y-2">
              {['ADMIN', 'OFFICER', 'VERIFIER', 'AUDITOR'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleAssignRoles(rolesModalUser.id, [role])}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-[#D0E0F7] hover:border-[#2457A7] text-left flex items-center justify-between font-khmer text-[#172B4D]"
                >
                  <span>{role}</span>
                  {Array.isArray(rolesModalUser.roles) && rolesModalUser.roles.includes(role) && (
                    <span className="text-[10px] text-[#00875A] font-semibold">បច្ចុប្បន្ន</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setRolesModalUser(null)}
                className="px-4 py-1.5 text-xs rounded-lg border border-[#D0E0F7] text-[#5E6C84] hover:bg-[#F5F7FA] font-khmer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      </PermissionGuard>
    </Shell>
  );
}
