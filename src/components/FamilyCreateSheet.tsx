'use client';

import { useState, useEffect } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface FamilyCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export function FamilyCreateSheet({ open, onOpenChange }: FamilyCreateSheetProps) {
  const [data, setData] = useState<{ inviteCode: string; members: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/family/create', { method: 'POST' });
      if (res.ok) setData(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const handleCopy = async () => {
    if (!data?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(data.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} className="bg-[#1E1E1E]">
      <div className="px-6 pb-8 space-y-5">
        <h3 className="text-lg font-bold text-white text-center">我的家庭空间</h3>

        {loading ? (
          <p className="text-sm text-[#888888] text-center">加载中...</p>
        ) : data ? (
          <>
            {/* Invite code card */}
            <div className="bg-[#2A2A2A] rounded-xl px-4 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#888888] mb-1">邀请码</p>
                <p className="text-[32px] font-bold text-[#F97316] tracking-[4px]">{data.inviteCode}</p>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md border border-[#F97316] text-[#F97316] text-xs font-medium hover:bg-[#F97316]/10 transition-colors"
              >
                {copied ? '已复制 ✅' : '复制'}
              </button>
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#888888] text-center leading-relaxed">
              将邀请码分享给家人，家人输入后即可加入你的家庭空间，一起共享食谱计划
            </p>

            {/* Members list */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3">家庭成员（{data.members.length}人）</h4>
              {data.members.length <= 1 ? (
                <p className="text-[13px] text-[#888888] text-center py-4">暂无成员加入，快去邀请家人吧</p>
              ) : (
                <div className="space-y-2">
                  {data.members.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(m.name || '用户').charAt(0)}
                      </div>
                      <span className="text-sm text-[#CCCCCC]">{m.name || maskPhone(m.phone)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#888888] text-center">加载失败</p>
        )}
      </div>
    </BottomSheet>
  );
}
