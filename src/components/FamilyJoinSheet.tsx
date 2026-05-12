'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface FamilyJoinSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FamilyJoinSheet({ open, onOpenChange }: FamilyJoinSheetProps) {
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null);

  const handleJoin = async () => {
    if (code.length !== 8 || joining) return;
    setJoining(true);
    setResult(null);
    try {
      const res = await fetch('/api/family/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', msg: data.message });
        setTimeout(() => onOpenChange(false), 1500);
      } else if (res.status === 409) {
        setResult({ type: 'warning', msg: data.error });
      } else {
        setResult({ type: 'error', msg: data.error || '邀请码无效，请检查后重试' });
      }
    } catch {
      setResult({ type: 'error', msg: '网络错误，请重试' });
    } finally {
      setJoining(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCode(v);
    setResult(null);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} className="bg-[#1E1E1E]">
      <div className="px-6 pb-8 space-y-5">
        <h3 className="text-lg font-bold text-white text-center">加入家庭空间</h3>

        <p className="text-[13px] text-[#888888] text-center">输入家人分享给你的8位邀请码</p>

        <input
          type="text"
          inputMode="numeric"
          value={code}
          onChange={handleCodeChange}
          placeholder="请输入8位数字邀请码"
          maxLength={8}
          className="w-full h-11 rounded-lg bg-[#2A2A2A] border border-[#333333] px-4 text-white text-sm placeholder:text-[#888888] text-center tracking-[4px] focus:outline-none focus:border-[#F97316]"
        />

        <button
          onClick={handleJoin}
          disabled={code.length !== 8 || joining}
          className="w-full h-11 rounded-lg bg-[#F97316] text-white font-medium disabled:opacity-50"
        >
          {joining ? '加入中...' : '加入'}
        </button>

        {result && (
          <p className={`text-sm text-center ${
            result.type === 'success' ? 'text-green-500' : result.type === 'warning' ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {result.msg}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
