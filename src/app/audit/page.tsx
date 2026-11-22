'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  ChevronRight,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { getAuditLogs } from '../../lib/api/ocr';
import { AuditLogItem } from '../../types/api';
import { useLanguage } from '../../lib/i18n';
import { SkeletonTable } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AuditTrailPage() {
  const { t } = useLanguage();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit] = useState<number>(50);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await getAuditLogs({
        action: filterAction || undefined,
        user_id: filterUser || undefined,
        limit,
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [limit, filterAction, filterUser]);

  return (
    <Shell>
      <div className="space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 sm:pb-4 border-b border-[#E5EAF0]">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#5E6C84] mb-1">
              <Link href="/" className="hover:text-[#2457A7] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#2457A7] font-semibold font-khmer">
                {t.navAudit}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-[#172B4D] font-khmer flex items-center gap-2">
              <History className="w-6 h-6 text-[#2457A7]" strokeWidth={2} />
              <span>{t.auditTrailTitle}</span>
            </h1>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFF4FC] text-[#2457A7] border border-[#D0E0F7] w-fit">
            {total} កំណត់ត្រាសវនកម្មសរុប
          </span>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          <input
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            placeholder="ចម្រាញ់តាមសកម្មភាព (e.g. UPLOAD, VERIFY)..."
            className="px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] font-mono w-full sm:w-auto sm:min-w-[220px] focus:outline-hidden focus:ring-1 focus:ring-[#2457A7]"
          />
          <input
            type="text"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            placeholder="ឈ្មោះមន្ត្រី (User ID)..."
            className="px-3 py-2.5 sm:py-2 text-base sm:text-xs bg-[#F5F7FA] border border-[#D0E0F7] rounded-lg text-[#172B4D] font-khmer w-full sm:w-auto sm:min-w-[180px] focus:outline-hidden focus:ring-1 focus:ring-[#2457A7]"
          />
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-[#E5EAF0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <SkeletonTable rows={6} />
              </div>
            ) : logs.length === 0 ? (
              <EmptyState
                icon={History}
                title={t.noAuditLogsYet}
                description="កំណត់ត្រាសវនកម្មនឹងបង្ហាញនៅទីនេះពេលមានសកម្មភាពផ្ទុកឡើង ឬផ្ទៀងផ្ទាត់ឯកសារ"
              />
            ) : (
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-[#E5EAF0] bg-[#F5F7FA] text-[11px] font-semibold text-[#5E6C84] uppercase tracking-wider">
                    <th className="py-3 px-5">ID</th>
                    <th className="py-3 px-4 font-khmer">កាលបរិច្ឆេទ & ម៉ោង</th>
                    <th className="py-3 px-4 font-khmer">មន្ត្រីទទួលបន្ទុក</th>
                    <th className="py-3 px-4 font-khmer">សកម្មភាព</th>
                    <th className="py-3 px-4 font-khmer">ប្រភេទធនធាន</th>
                    <th className="py-3 px-4 font-khmer">លេខកូដធនធាន</th>
                    <th className="py-3 px-5 font-khmer">ព័ត៌មានលម្អិត</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF0] text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3 px-5 font-mono text-[#5E6C84]">
                        #{log.id}
                      </td>
                      <td className="py-3 px-4 text-[#172B4D] font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#2457A7]">
                        {log.user_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-sm bg-[#EFF4FC] text-[#2457A7] font-mono font-semibold border border-[#D0E0F7]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#5E6C84]">
                        {log.resource_type}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#172B4D] max-w-[140px] truncate" title={log.resource_id}>
                        {log.resource_id}
                      </td>
                      <td className="py-3 px-5 font-mono text-[10px] text-[#5E6C84] max-w-[220px] truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
