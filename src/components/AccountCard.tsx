import { useState } from 'react';
import { ExternalLink, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { Account } from '../types';
import { CopyButton } from './CopyButton';
import { ConfirmModal } from './ConfirmModal';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (rowId: number, siteName: string, id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const firstLetter = account.siteName.charAt(0).toUpperCase();

  return (
    <>
      <div className="account-card group h-full flex flex-col justify-between shadow-sm">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className={`w-12 h-12 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-sm`}>
                {firstLetter}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  {account.siteName}
                  {account.url && (
                    <a
                      href={account.url.startsWith('http') ? account.url : `https://${account.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-blue-600 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </h3>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  {account.url ? account.url.replace(/^https?:\/\//, '').split('/')[0] : 'no url'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:border-slate-200 transition-colors">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Login ID</span>
                <span className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{account.id}</span>
              </div>
              <CopyButton value={account.id} />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:border-slate-200 transition-colors">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Password</span>
                <span className="text-sm font-mono tracking-[0.2em] text-slate-700">
                  {showPassword ? account.password : '••••••••'}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <CopyButton value={account.password} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
          <button
            onClick={() => onEdit(account)}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete(account.rowId!, account.siteName, account.id)}
        title="Delete Account"
        message={`"${account.siteName}" 계정 정보를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      />
    </>
  );
}
