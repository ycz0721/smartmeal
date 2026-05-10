'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserPrefs } from '@/stores/userPrefs';
import { toast } from 'sonner';

export default function IntolerancesPage() {
  const router = useRouter();
  const { intolerances, setIntolerances } = useUserPrefs();
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setItems([...intolerances]);
  }, [intolerances]);

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      toast.error('该食材已存在');
      return;
    }
    setItems((prev) => [...prev, trimmed]);
    setInput('');
  };

  const removeItem = (name: string) => {
    setItems((prev) => prev.filter((i) => i !== name));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const handleSave = () => {
    setIntolerances(items);
    toast.success('已保存');
    router.back();
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[#EEEEEE] bg-white">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </button>
        <h1 className="text-card-title text-brand-text">食物不耐受</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Title & Description */}
        <div>
          <h2 className="text-lg font-bold text-brand-text">避开不适合你的食物！</h2>
          <p className="text-sm text-brand-secondary mt-1">
            添加你不能吃的食材，我们将在生成菜单时自动为你排除。
          </p>
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入食材名称，按回车添加"
            className="flex-1 h-10 px-3 rounded-lg border border-[#EEEEEE] bg-white text-sm text-brand-text placeholder:text-gray-400 focus:outline-none focus:border-orange-500"
          />
          <Button onClick={addItem} className="h-10 px-4 text-sm">
            添加
          </Button>
        </div>

        {/* Tags */}
        {items.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-orange-500 border border-orange-500 text-sm"
              >
                {item}
                <button
                  onClick={() => removeItem(item)}
                  className="ml-0.5 p-0.5 rounded-full hover:bg-orange-50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#EEEEEE] z-10">
        <Button onClick={handleSave} className="w-full h-12 rounded-lg text-base">
          保存
        </Button>
      </div>
    </div>
  );
}
