'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/ui/bottom-sheet';

interface GeneratePlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (params: {
    prompt: string;
    mealTypes: string[];
    dishCombo: string;
    kidsRequest: string;
  }) => void;
  loading: boolean;
}

const MEAL_TYPES = [
  { key: 'breakfast', label: '早餐' },
  { key: 'lunch', label: '午餐' },
  { key: 'dinner', label: '晚餐' },
];

export function GeneratePlanSheet({ open, onOpenChange, onGenerate, loading }: GeneratePlanSheetProps) {
  const [prompt, setPrompt] = useState('');
  const [mealTypes, setMealTypes] = useState<string[]>(['dinner']);
  const [dishCombo, setDishCombo] = useState('');
  const [kidsRequest, setKidsRequest] = useState('');

  const hasInput = prompt.trim().length > 0;

  const toggleMealType = (key: string) => {
    setMealTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleGenerate = () => {
    if (!hasInput || mealTypes.length === 0) return;
    onGenerate({ prompt, mealTypes, dishCombo: dishCombo.trim() || '一荤一素一汤', kidsRequest: kidsRequest.trim() });
    setPrompt('');
    setMealTypes(['dinner']);
    setDishCombo('');
    setKidsRequest('');
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange}>
      <div className="px-6 pb-8 space-y-5">
        <h3 className="text-card-title text-brand-text text-center">
          告诉我们你的想法（什么都可以说）
        </h3>

        {/* Textarea */}
        <textarea
          placeholder="比如：这周想吃点清淡的，最好有川菜，还想吃一顿好的牛排..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-[#EEEEEE] bg-[#F9F9F9] px-4 py-3 text-sm text-brand-text placeholder:text-[#999999] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Meal type selection */}
        <div>
          <p className="text-sm text-brand-text mb-3">每天需要哪几餐？</p>
          <div className="flex gap-3">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt.key}
                onClick={() => toggleMealType(mt.key)}
                className={`h-10 px-5 rounded-[20px] text-sm font-medium transition-colors ${
                  mealTypes.includes(mt.key)
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-orange-500 border border-orange-500'
                }`}
              >
                {mt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dish combination - free text input */}
        <div>
          <p className="text-sm text-brand-text mb-3">每餐怎么搭配？</p>
          <input
            type="text"
            placeholder="比如：一荤一菜一汤"
            value={dishCombo}
            onChange={(e) => setDishCombo(e.target.value)}
            className="w-full h-10 rounded-xl border border-[#EEEEEE] bg-[#F9F9F9] px-4 text-sm text-brand-text placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Kids request */}
        <div>
          <p className="text-sm text-brand-text mb-3">本周孩子想吃的菜</p>
          <textarea
            placeholder="比如：红烧肉、番茄炒蛋、饺子...没有就填无"
            value={kidsRequest}
            onChange={(e) => setKidsRequest(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-[#EEEEEE] bg-[#F9F9F9] px-4 py-3 text-sm text-brand-text placeholder:text-[#999999] resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!hasInput || mealTypes.length === 0 || loading}
          className={`w-full h-12 rounded-lg text-base font-medium transition-colors ${
            hasInput && mealTypes.length > 0 && !loading
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-[#EEEEEE] text-[#999999] cursor-not-allowed'
          }`}
        >
          {loading ? '生成中...' : '用 AI 生成计划'}
        </button>
      </div>
    </BottomSheet>
  );
}
