'use client';

import { useState, useEffect, useRef } from 'react';

interface GenerateProgressSheetProps {
  open: boolean;
  status: 'generating' | 'success' | 'error';
  onRetry: () => void;
}

const STEPS = [
  '正在读取你的饮食偏好',
  '正在避开不喜欢的食物',
  '正在参考孩子想吃的菜',
  '正在检查储藏室已有食材',
  '正在搭配菜品',
  '正在生成购物清单',
];

const TIPS = [
  '正在帮你解决"今晚吃什么"的世纪难题...',
  '孩子想吃的菜，已经安排进计划里了',
  '尽量减少重复买菜，省钱又省力',
  '优先消耗冰箱里已有的食材',
  '本周菜单马上出炉，锅铲已经热身完毕',
];

export function GenerateProgressSheet({ open, status, onRetry }: GenerateProgressSheetProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const [tipIndex, setTipIndex] = useState(0);
  const [closing, setClosing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tipRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveStep(-1);
      setTipIndex(0);
      setClosing(false);
      return;
    }

    if (status === 'generating') {
      // Start step animation
      let step = -1;
      setActiveStep(-1);
      intervalRef.current = setInterval(() => {
        step++;
        setActiveStep(step);
        if (step >= STEPS.length - 1 && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 4000);

      // Start tip rotation
      let tip = 0;
      setTipIndex(0);
      tipRef.current = setInterval(() => {
        tip = (tip + 1) % TIPS.length;
        setTipIndex(tip);
      }, 2000);
    }

    if (status === 'success') {
      setActiveStep(STEPS.length);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (tipRef.current) {
        clearInterval(tipRef.current);
        tipRef.current = null;
      }
      setClosing(true);
    }

    if (status === 'error') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (tipRef.current) {
        clearInterval(tipRef.current);
        tipRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tipRef.current) clearInterval(tipRef.current);
    };
  }, [open, status]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div
        className="w-[calc(100%-48px)] max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: '#1E1E1E' }}
      >
        {/* Title */}
        <h2 className="text-lg font-bold text-white text-center mb-8">
          {status === 'success'
            ? '🎉 本周膳食计划已生成！'
            : '正在为你生成本周膳食计划...'}
        </h2>

        {/* Steps */}
        <div className="space-y-4 mb-6">
          {STEPS.map((step, i) => {
            let state: 'done' | 'active' | 'pending';
            if (status === 'error') {
              state = i < activeStep ? 'done' : 'pending';
            } else if (status === 'success') {
              state = 'done';
            } else {
              if (i < activeStep) state = 'done';
              else if (i === activeStep) state = 'active';
              else state = 'pending';
            }

            return (
              <div key={i} className="flex items-center gap-3">
                {/* Indicator */}
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {state === 'done' && (
                    <span className="text-green-500 text-sm">✅</span>
                  )}
                  {state === 'active' && (
                    <span className="w-3 h-3 rounded-full bg-[#F97316] animate-ping" />
                  )}
                  {state === 'pending' && (
                    <span className="w-2 h-2 rounded-full bg-[#555555]" />
                  )}
                </div>
                {/* Label */}
                <span
                  className="text-[15px]"
                  style={{
                    color:
                      state === 'active'
                        ? '#F97316'
                        : state === 'done'
                          ? '#CCCCCC'
                          : '#666666',
                  }}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic tips or error */}
        {status === 'generating' && (
          <p className="text-[13px] text-[#888888] text-center italic">
            {TIPS[tipIndex]}
          </p>
        )}

        {status === 'success' && closing && (
          <p className="text-[13px] text-[#888888] text-center italic">
            即将自动刷新...
          </p>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <p className="text-[13px] text-[#888888]">
              生成失败了，可能是网络有点慢，请稍后再试
            </p>
            <button
              onClick={onRetry}
              className="w-full h-11 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              重新生成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
