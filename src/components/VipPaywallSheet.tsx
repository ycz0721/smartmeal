'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface VipPaywallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VipPaywallSheet({ open, onOpenChange }: VipPaywallSheetProps) {
  const [copied, setCopied] = useState(false);
  const wechatId = 'ycz0721k';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} className="bg-[#1E1E1E]">
      <div className="px-6 pb-8 space-y-5">
        <h3 className="text-lg font-bold text-white text-center">
          开通智能膳食会员1个月
        </h3>

        <p className="text-sm text-[#CCCCCC] text-center">
          添加开发者微信，联系开发者开通会员
        </p>

        <div className="flex items-center gap-3 bg-[#2A2A2A] rounded-xl px-4 py-3">
          <span className="text-[#CCCCCC] text-sm flex-shrink-0">微信号：</span>
          <span className="text-white text-sm font-mono flex-1">{wechatId}</span>
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-md border border-[#F97316] text-[#F97316] text-xs font-medium hover:bg-[#F97316]/10 transition-colors"
          >
            {copied ? '已复制 ✅' : '复制'}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
