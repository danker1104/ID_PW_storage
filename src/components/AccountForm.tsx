import { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { Account, GASRequest } from '../types';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GASRequest) => void;
  initialData?: Account | null;
}

const CATEGORIES = []; // Removed

export function AccountForm({ isOpen, onClose, onSubmit, initialData }: AccountFormProps) {
  const [formData, setFormData] = useState<Partial<Account>>({
    siteName: '',
    url: '',
    id: '',
    password: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        siteName: '',
        url: '',
        id: '',
        password: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      action: initialData ? 'update' : 'create',
      rowId: initialData?.rowId,
      ...formData as any
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
      >
        <div className="flex items-center justify-between p-6 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              {initialData ? 'Edit Account' : 'New Vault Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Site Name</label>
              <input
                required
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="Google, Netflix, etc."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">URL</label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Username / ID</label>
                <input
                  required
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-sm text-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Access Password</label>
                <input
                  required
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-mono tracking-widest text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              {initialData ? 'Update Record' : 'Save to Vault'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
