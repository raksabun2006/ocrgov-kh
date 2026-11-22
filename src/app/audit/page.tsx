'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History,
  ShieldCheck,
  ChevronRight,
  Filter,
  User,
  Clock,
  Terminal,
} from 'lucide-react';
import { Shell } from '../../components/layout/Shell';
import { getAuditLogs } from '../../lib/api/ocr';
import { AuditLogItem } from '../../types/api';
import { useLanguage } from '../../lib/i18n';

export default function AuditTrailPage() {
  const { t, language } = useLanguage();

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [limit, setLimit] = useState<number>(50);
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-1">
              <Link href="/" className="hover:text-[#17365D] font-khmer">
                {t.navDashboard}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#17365D] font-semibold font-khmer">
                {t.navAudit}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#17365D] font-khmer flex items-center gap-2">
              <History className="w-6 h-6 text-[#2563A6]" />
              <span>{t.auditTrailTitle}</span>
            </h1>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EFF6FF] text-[#17365D] border border-[#BFDBFE]">
            {total} កំណត់ត្រាសវនកម្មសរុប
          </span>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            placeholder="ចម្រាញ់តាមសកម្មភាព (Action e.g. UPLOAD, VERIFY)..."
            className="px-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#1E293B] font-mono min-w-[240px]"
          />
          <input
            type="text"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            placeholder="ឈ្មោះមន្ត្រី (Officer User ID)..."
            className="px-3 py-2 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-[#1E293B] font-khmer min-w-[200px]"
          />
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">ID</th>
                  <th className="py-3 px-4 font-khmer">កាលបរិច្ឆេទ & ម៉ោង</th>
                  <th className="py-3 px-4 font-khmer">មន្ត្រីទទួលបន្ទុក</th>
                  <th className="py-3 px-4 font-khmer">សកម្មភាព</th>
                  <th className="py-3 px-4 font-khmer">ប្រភេទធនធាន</th>
                  <th className="py-3 px-4 font-khmer">លេខកូដធនធាន</th>
                  <th className="py-3 px-5 font-khmer">ព័ត៌មានលម្អិត</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#64748B]">
                      កំពុងទាញយកកំណត់ហេតុ...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#94A3B8] font-khmer">
                      {t.noAuditLogsYet}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3 px-5 font-mono text-[#64748B]">
                        #{log.id}
                      </td>
                      <td className="py-3 px-4 text-[#1E293B] font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#17365D]">
                        {log.user_id}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-sm bg-[#EFF6FF] text-[#17365D] font-mono font-semibold border border-[#BFDBFE]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#64748B]">
                        {log.resource_type}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#475569] max-w-[140px] truncate" title={log.resource_id}>
                        {log.resource_id}
                      </td>
                      <td className="py-3 px-5 font-mono text-[10px] text-[#64748B] max-w-[220px] truncate">
                        {log.details ? JSON.stringify(log.details) : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
