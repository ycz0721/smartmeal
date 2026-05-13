'use client';

import { useState, useEffect, useRef } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useSession } from 'next-auth/react';

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
}

interface FamilySpaceData {
  id: string;
  inviteCode: string;
  isOwner: boolean;
  owner: { id: string; name: string; phone: string };
  members: FamilyMember[];
}

interface FamilySpaceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeave?: () => void;
}

function maskPhone(phone: string): string {
  if (!phone) return '未设置';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

export function FamilySpaceSheet({ open, onOpenChange, onLeave }: FamilySpaceSheetProps) {
  const { data: session } = useSession();
  const currentUserId = (session?.user as any)?.id;
  const [data, setData] = useState<FamilySpaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setConfirmLeave(false);
    try {
      const res = await fetch('/api/family/info');
      if (res.ok) {
        const result = await res.json();
        setData(result.space);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const handleCopy = () => {
    if (!data?.inviteCode) return;
    setShowInput(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
    setCopied(true);
  };

  const handleInputBlur = () => {
    setShowInput(false);
    setCopied(false);
  };

  const handleLeave = async () => {
    try {
      const res = await fetch('/api/family/leave', { method: 'DELETE' });
      if (res.ok) {
        onOpenChange(false);
        onLeave?.();
      }
    } catch {}
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} className="bg-[#1E1E1E]">
      <div className="px-6 pb-8 space-y-5">
        <h3 className="text-lg font-bold text-white text-center">家庭空间</h3>

        {loading ? (
          <p className="text-sm text-[#888888] text-center">加载中...</p>
        ) : data ? (
          <>
            {/* Invite code card */}
            <div className="bg-[#2A2A2A] rounded-xl px-4 py-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#888888] mb-1">邀请码</p>
                {showInput ? (
                  <input
                    ref={inputRef}
                    value={data.inviteCode}
                    readOnly
                    onBlur={handleInputBlur}
                    className="w-full bg-transparent text-[32px] font-bold text-[#F97316] tracking-[4px] focus:outline-none"
                  />
                ) : (
                  <p className="text-[32px] font-bold text-[#F97316] tracking-[4px] truncate">{data.inviteCode}</p>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-md border border-[#F97316] text-[#F97316] text-xs font-medium hover:bg-[#F97316]/10 transition-colors flex-shrink-0"
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
              <h4 className="text-sm font-bold text-white mb-3">
                家庭成员（{data.members.length}人）
              </h4>
              {data.members.length <= 1 ? (
                <p className="text-[13px] text-[#888888] text-center py-4">
                  暂无其他成员，快去邀请家人吧 🎉
                </p>
              ) : (
                <div className="space-y-2">
                  {data.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(m.name || '用户').charAt(0)}
                      </div>
                      <span className="text-sm text-[#CCCCCC]">
                        {m.name || maskPhone(m.phone)}
                      </span>
                      {m.id === data.owner.id && (
                        <span className="text-xs text-[#F97316]">👑 空间主人</span>
                      )}
                      {m.id === currentUserId && m.id !== data.owner.id && (
                        <span className="text-xs text-[#888888]">（我）</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave button (non-owner only) */}
            {!data.isOwner && (
              <div className="pt-2 space-y-3">
                {confirmLeave ? (
                  <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-3">
                    <p className="text-sm text-[#CCCCCC] text-center">
                      确认退出后将无法查看共享数据，是否继续？
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setConfirmLeave(false)}
                        className="flex-1 h-10 rounded-lg border border-[#888888] text-[#888888] text-sm font-medium"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleLeave}
                        className="flex-1 h-10 rounded-lg bg-[#FF4D4F] text-white text-sm font-medium"
                      >
                        确认退出
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmLeave(true)}
                    className="w-full h-11 rounded-xl border border-[#FF4D4F] text-[#FF4D4F] text-sm font-medium hover:bg-[#FF4D4F]/10 transition-colors"
                  >
                    退出家庭空间
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-[#888888] text-center">加载失败</p>
        )}
      </div>
    </BottomSheet>
  );
}
