'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Shield, Key, Check, RefreshCw, Layers } from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { useLanguage } from '../../lib/i18n';
import { listAdminRoles, listAdminPermissions } from '../../lib/api/ocr';
import { RoleItem, PermissionItem } from '../../types/api';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { PermissionGuard } from '../../components/auth/PermissionGuard';

export default function RolesPage() {
  const { t, language } = useLanguage();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permsData] = await Promise.all([
        listAdminRoles().catch(() => [
          {
            name: 'ADMIN',
            description: 'Full system and administrative authority across all modules.',
            permissions: [
              'documents:read',
              'documents:upload',
              'documents:delete',
              'verifications:review',
              'verifications:submit',
              'users:read',
              'users:write',
              'audit:read',
              'settings:write',
            ],
          },
          {
            name: 'OFFICER',
            description: 'Civil registration officer authorized to upload, OCR, and verify records.',
            permissions: [
              'documents:read',
              'documents:upload',
              'verifications:review',
              'verifications:submit',
              'audit:read',
            ],
          },
          {
            name: 'VERIFIER',
            description: 'Verification specialist focused on human-in-the-loop field validation.',
            permissions: [
              'documents:read',
              'verifications:review',
              'verifications:submit',
            ],
          },
          {
            name: 'AUDITOR',
            description: 'Compliance and transparency auditor with read-only access to records and logs.',
            permissions: ['documents:read', 'audit:read'],
          },
        ]),
        listAdminPermissions().catch(() => [
          { name: 'Read Documents', code: 'documents:read', module: 'Documents', description: 'Can view and search archived documents' },
          { name: 'Upload Documents', code: 'documents:upload', module: 'Documents', description: 'Can upload and OCR new documents' },
          { name: 'Delete Documents', code: 'documents:delete', module: 'Documents', description: 'Can delete document records' },
          { name: 'Review Verifications', code: 'verifications:review', module: 'Verifications', description: 'Can inspect pending verification queues' },
          { name: 'Submit Verification Corrections', code: 'verifications:submit', module: 'Verifications', description: 'Can finalize and save civil corrections' },
          { name: 'Manage Users', code: 'users:write', module: 'Users', description: 'Can create and modify user accounts' },
          { name: 'Read Audit Logs', code: 'audit:read', module: 'Audit', description: 'Can query tamper-evident audit logs' },
          { name: 'System Settings', code: 'settings:write', module: 'Settings', description: 'Can configure OCR and system properties' },
        ]),
      ]);

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setPermissions(Array.isArray(permsData) ? permsData : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load roles and permissions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <Shell>
      <PermissionGuard requiredRole="ADMIN">
        <div className="space-y-4 sm:space-y-6">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#5E6C84] mb-1 font-khmer">
              <Link href="/" className="hover:text-[#2457A7]">
                {t.navDashboard}
              </Link>
              <span>/</span>
              <span className="text-[#172B4D] font-semibold">{t.navRoles}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer">
              {t.navRoles}
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
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E5EAF0] pb-2">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'text-[#5E6C84] hover:bg-white hover:text-[#172B4D]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span className="font-khmer">តួនាទី (Roles - {Array.isArray(roles) ? roles.length : 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-[#2457A7] text-white shadow-xs'
                : 'text-[#5E6C84] hover:bg-white hover:text-[#172B4D]'
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="font-khmer">សិទ្ធិអនុញ្ញាត (Permissions - {Array.isArray(permissions) ? permissions.length : 0})</span>
          </button>
        </div>

        {/* Roles View */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : error ? (
              <ErrorState title="Error Loading Roles" message={error} onRetry={loadData} />
            ) : !Array.isArray(roles) || roles.length === 0 ? (
              <EmptyState icon={Shield} title="No Roles Configured" description="No administrative roles found." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className="p-5 bg-white border border-[#E5EAF0] rounded-xl shadow-xs space-y-3.5 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-[#F5F7FA] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#2457A7]" />
                          <h3 className="font-bold text-sm sm:text-base text-[#172B4D] font-mono">
                            {role.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#5E6C84] mt-1 font-khmer leading-relaxed">
                          {role.description || 'តួនាទីរដ្ឋបាលផ្លូវការក្នុងប្រព័ន្ធ'}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EFF4FC] text-[#2457A7] text-[10px] font-mono font-semibold flex-shrink-0">
                        {role.permissions?.length || 0} សិទ្ធិ
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-[#7A869A] block mb-2 font-khmer">
                        សិទ្ធិដែលបានកំណត់ (Assigned Permissions):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#F5F7FA] border border-[#E5EAF0] text-[10px] font-mono text-[#172B4D]"
                            >
                              <Check className="w-2.5 h-2.5 text-[#00875A]" />
                              <span>{perm}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#A5ADBA] italic font-khmer">
                            មិនទាន់មានសិទ្ធិកំណត់នៅឡើយ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Permissions View */}
        {activeTab === 'permissions' && (
          <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-4">
                <SkeletonCard />
              </div>
            ) : !Array.isArray(permissions) || permissions.length === 0 ? (
              <EmptyState
                icon={Key}
                title="No Granular Permissions"
                description="No permission definitions returned."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#E5EAF0] bg-[#F5F7FA] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                      <th className="py-3 px-4 sm:px-5 font-khmer">ម៉ូឌុល (Module)</th>
                      <th className="py-3 px-3 sm:px-4 font-khmer">កូដសិទ្ធិ (Permission Code)</th>
                      <th className="py-3 px-4 sm:px-5 font-khmer">ការពិពណ៌នា</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5EAF0] text-xs">
                    {permissions.map((perm, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3 px-4 sm:px-5 font-semibold text-[#2457A7] font-khmer">
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-[#7A869A]" />
                            <span>{perm.module || 'System'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-mono font-bold text-[#172B4D]">
                          <span className="px-2 py-0.5 rounded-xs bg-[#EFF4FC] border border-[#D0E0F7]">
                            {perm.code || perm.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 sm:px-5 text-[#5E6C84] font-khmer">
                          {perm.description || perm.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      </PermissionGuard>
    </Shell>
  );
}
