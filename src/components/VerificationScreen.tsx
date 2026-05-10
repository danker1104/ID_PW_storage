import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

interface VerificationScreenProps {
  onVerify: () => void;
}

export function VerificationScreen({ onVerify }: VerificationScreenProps) {
  const [password, setPassword] = useState('');
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [puzzle, setPuzzle] = useState({ a: 0, b: 0, operator: '+', result: 0 });
  const [error, setError] = useState('');
  const [failCount, setFailCount] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    generatePuzzle();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutTime > 0) {
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.ceil((lockoutTime - now) / 1000);
        if (diff <= 0) {
          setLockoutTime(0);
          setTimeLeft(0);
          setFailCount(0);
          setError('');
        } else {
          setTimeLeft(diff);
        }
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const generatePuzzle = () => {
    const type = Math.random() > 0.5 ? 'mult' : 'add';
    let a, b, result, operator;

    if (type === 'mult') {
      a = Math.floor(Math.random() * 12) + 7;
      b = Math.floor(Math.random() * 9) + 3;
      operator = '×';
      result = a * b;
    } else {
      a = Math.floor(Math.random() * 80) + 20;
      b = Math.floor(Math.random() * 80) + 20;
      operator = '+';
      result = a + b;
    }

    setPuzzle({ a, b, operator, result });
    setPuzzleAnswer('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;
    
    if (password !== '20091104') {
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= 5) {
        setLockoutTime(Date.now() + 10000);
        setError('너무 많은 시도 실패! 10초 후에 다시 시도하세요.');
      } else {
        setError(`비밀번호가 올바르지 않습니다. (실패: ${newCount}/5)`);
      }
      return;
    }

    if (parseInt(puzzleAnswer) !== puzzle.result) {
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= 5) {
        setLockoutTime(Date.now() + 10000);
        setError('너무 많은 시도 실패! 10초 후에 다시 시도하세요.');
      } else {
        setError(`인간 검증 퍼즐 정답이 틀렸습니다. (실패: ${newCount}/5)`);
      }
      generatePuzzle();
      return;
    }

    onVerify();
  };

  const isLocked = lockoutTime > 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950 p-4 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 ${isLocked ? 'bg-red-600/20 ring-red-500/50' : 'bg-blue-600/20 ring-blue-500/50'} rounded-2xl flex items-center justify-center mb-4 ring-1 transition-all`}>
              <Shield className={`w-8 h-8 ${isLocked ? 'text-red-500' : 'text-blue-500'}`} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Account Safe</h1>
            <p className="text-slate-400 text-sm text-center">
              {isLocked ? `${timeLeft}초 후에 다시 시도할 수 있습니다.` : '민감한 보관소에 접근하기 위해 인증이 필요합니다.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLocked}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bot Verification</label>
                <button 
                  type="button" 
                  onClick={generatePuzzle}
                  disabled={isLocked}
                  className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-500 disabled:opacity-30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center font-mono text-xl font-bold text-blue-400 select-none opacity-80">
                  {puzzle.a} {puzzle.operator} {puzzle.b} = ?
                </div>
                <input
                  type="number"
                  value={puzzleAnswer}
                  onChange={(e) => setPuzzleAnswer(e.target.value)}
                  placeholder="?"
                  disabled={isLocked}
                  className="w-24 px-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-white text-center text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-2 ${isLocked ? 'text-red-400 bg-red-400/10 border-red-400/30' : 'text-amber-400 bg-amber-400/10 border-amber-400/20'} p-3 rounded-xl border`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLocked}
              className={`w-full py-4 ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'} rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group`}
            >
              {isLocked ? `Locked (${timeLeft}s)` : 'Verify & Unlock'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-[10px] font-medium tracking-tighter">
            PROHIBITED FOR UNAUTHORIZED ACCESS • AES-256 ENCRYPTED SYNC
          </p>
        </div>
      </motion.div>
    </div>
  );
}
