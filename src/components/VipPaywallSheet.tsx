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

  const handleCopy = () => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(wechatId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(() => legacyCopy());
    } else {
      legacyCopy();
    }
  };

  const legacyCopy = () => {
    // Use visible but tiny textarea for mobile compatibility
    const textarea = document.createElement('textarea');
    textarea.value = wechatId;
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.opacity = '0';
    textarea.style.fontSize = '16px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
    document.body.removeChild(textarea);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} className="bg-[#1E1E1E]">
      <div className="px-6 pb-8 space-y-5">
        <h3 className="text-lg font-bold text-white text-center">
          开通智能膳食会员1个月
        </h3>

        <p className="text-sm text-[#CCCCCC] text-center">
          添加开发者微信，联系开发者开通会员，才能使用生成本周计划食谱功能
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
