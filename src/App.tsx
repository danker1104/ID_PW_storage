/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Shield, AlertTriangle, Loader2, Database, Activity, Settings, ExternalLink, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './services/api';
import { Account, GASRequest } from './types';
import { AccountCard } from './components/AccountCard';
import { AccountForm } from './components/AccountForm';
import { VerificationScreen } from './components/VerificationScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState(false);

  const loadAccounts = async () => {
    if (!import.meta.env.VITE_GAS_URL) {
      setError('Google Apps Script URL이 설정되지 않았습니다. GAS_BACKEND.js 파일을 참고하여 백엔드를 설정하고 VITE_GAS_URL 환경 변수를 입력해 주세요.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAll();
      console.log("API Response Data:", data); // For debugging

      if (Array.isArray(data)) {
        setAccounts(data);
      } else if (data && typeof data === 'object' && (data as any).message) {
        throw new Error((data as any).message);
      } else {
        throw new Error('API로부터 유효한 배열 데이터를 받지 못했습니다.');
      }
    } catch (err: any) {
      console.error("Load Accounts Error:", err);
      setError(`데이터 동기화 실패: ${err.message || '네트워크 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    // Poll for changes every 30 seconds to sync with manual sheet edits
    const interval = setInterval(loadAccounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (payload: GASRequest) => {
    try {
      setLoading(true);
      const result = await api.mutate(payload);
      if (result && result.status === 'error') {
        throw new Error(result.message);
      }
      setIsFormOpen(false);
      setEditingAccount(null);
      loadAccounts();
    } catch (err: any) {
      console.error(err);
      setError(`저장 실패: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowId: number, siteName: string, id: string) => {
    try {
      setLoading(true);
      const result = await api.mutate({ action: 'delete', rowId, siteName, id });
      if (result && result.status === 'error') {
        throw new Error(result.message);
      }
      loadAccounts();
    } catch (err: any) {
      console.error("Delete Error:", err);
      setError(`삭제 실패: ${err.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      return acc.siteName.toLowerCase().includes(searchQuery.toLowerCase()) || 
             acc.id.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [accounts, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnimatePresence>
        {!isAuthenticated && (
          <VerificationScreen onVerify={() => setIsAuthenticated(true)} />
        )}
      </AnimatePresence>

      {/* Navbar with dark background */}
      <nav className="flex items-center justify-between px-8 py-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">My Account Safe</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3" />
              CONNECTED: Google Sheets API v4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Admin Menu"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={loadAccounts}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            title="Manual Sync"
            disabled={loading}
          >
            <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <span className="hidden sm:flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
            Live Sync
          </span>
          <div className="hidden sm:block w-px h-6 bg-slate-700"></div>
          <button
            onClick={() => {
              setEditingAccount(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors font-bold text-xs uppercase tracking-wide active:scale-95"
          >
            + New Account
          </button>
        </div>
      </nav>

      {/* Filter and Search Bar */}
      <div className="flex-none bg-white border-b border-slate-200 px-8 py-4 sticky top-[72px] z-40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="사이트명, 아이디 또는 카테고리 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">
          {loading && accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">실시간 데이터 동기화 중...</p>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sync Error</h3>
              <p className="text-sm text-slate-600 mb-6">{error}</p>
              <button
                onClick={loadAccounts}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredAccounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
              <AnimatePresence mode="popLayout">
                {filteredAccounts.map((acc) => (
                  <motion.div
                    key={`${acc.rowId}-${acc.siteName}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <AccountCard
                      key={acc.rowId}
                      account={acc}
                      onEdit={(a) => {
                        setEditingAccount(a);
                        setIsFormOpen(true);
                      }}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-3xl">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">일치하는 정보가 없습니다</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 font-bold text-sm hover:underline"
                >
                  Clear search filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex-none px-8 py-3 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3 h-3" />
          TOTAL: {accounts.length} Accounts &bull; SECURE VAULT ACTIVE
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-[10px] text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider transition-colors">Documentation</a>
          <a href="#" className="text-[10px] text-slate-500 hover:text-slate-900 font-bold uppercase tracking-wider transition-colors">Privacy</a>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">v1.0.4-STABLE</span>
        </div>
      </footer>

      {/* Modals and Overlays */}
      <AccountForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingAccount}
      />

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-slate-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Admin Control Panel</h2>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAdminOpen(false);
                      setAdminError(false);
                      setAdminPassword('');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>

                {!isAdminLoggedIn ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 font-medium">관리자 비밀번호를 입력해주세요.</p>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setAdminError(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && adminPassword === '1234566789') {
                            setIsAdminLoggedIn(true);
                          } else if (e.key === 'Enter') {
                            setAdminError(true);
                          }
                        }}
                        className={`w-full px-4 py-3 bg-slate-50 border ${adminError ? 'border-red-500 bg-red-50' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono text-center text-lg`}
                      />
                      {adminError && (
                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> 비밀번호가 올바르지 않습니다.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (adminPassword === '1234566789') {
                          setIsAdminLoggedIn(true);
                        } else {
                          setAdminError(true);
                        }
                      }}
                      className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                      Login to Admin
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-900">Authenticated</h4>
                        <p className="text-xs text-emerald-700 leading-relaxed font-medium">관리자 권한으로 접속되었습니다. 데이터베이스를 직접 관리할 수 있습니다.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <a 
                        href="https://docs.google.com/spreadsheets/d/16I94j_32UsvNliP_pM48Ru4iYlSRLXWorACv2TXeWxM/edit?usp=sharing" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Database className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">Google Sheet Open</span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                      </a>

                      <button
                        onClick={() => {
                          setIsAdminLoggedIn(false);
                          setAdminPassword('');
                        }}
                        className="w-full py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
                      >
                        Logout Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading && accounts.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white shadow-2xl rounded-full px-5 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Syncing Data...</span>
        </div>
      )}
    </div>
  );
}

