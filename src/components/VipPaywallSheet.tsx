'use client';

import { useState, useRef } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface VipPaywallSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VipPaywallSheet({ open, onOpenChange }: VipPaywallSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wechatId = 'ycz0721k';

  const handleCopy = () => {
    // On mobile HTTP, programmatic copy is unreliable.
    // Show an auto-selected input so the native "Copy" menu appears.
    setShowInput(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 100);
  };

  const handleInputBlur = () => {
    setShowInput(false);
    setCopied(false);
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
          {showInput ? (
            <input
              ref={inputRef}
              value={wechatId}
              readOnly
              onBlur={handleInputBlur}
              className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none"
            />
          ) : (
            <span className="text-white text-sm font-mono flex-1">{wechatId}</span>
          )}
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-md border border-[#F97316] text-[#F97316] text-xs font-medium hover:bg-[#F97316]/10 transition-colors flex-shrink-0"
          >
            {copied ? '已复制 ✅' : '复制'}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
