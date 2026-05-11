'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserPrefs } from '@/stores/userPrefs';
import { toast } from 'sonner';

export default function IntolerancesPage() {
  const router = useRouter();
  const { setIntolerances } = useUserPrefs();
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/intolerances')
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (data?.intolerances) {
        setItems(data.intolerances);
        setIntolerances(data.intolerances);
      }
      })
      .finally(() => setLoading(false));
  }, []);

  const addItem = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (items.includes(trimmed)) {
      toast.error('该食材已存在');
      return;
    }
    setInput('');
    const next = [...items, trimmed];
    setItems(next);
    setIntolerances(next);
    fetch('/api/user/intolerances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: trimmed }),
    }).catch(() => {
      const reverted = items.filter((i) => i !== trimmed);
      setItems(reverted);
      setIntolerances(reverted);
      toast.error('添加失败');
    });
  };

  const removeItem = (name: string) => {
    const next = items.filter((i) => i !== name);
    setItems(next);
    setIntolerances(next);
    fetch('/api/user/intolerances', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: name }),
    }).catch(() => {
      const reverted = [...items, name];
      setItems(reverted);
      setIntolerances(reverted);
      toast.error('删除失败');
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="pb-8">
      <div className="flex items-center gap-3 p-4 border-b border-[#EEEEEE] bg-white">
        <button onClick={() => router.back()} className="p-1">
          <ArrowLeft className="w-5 h-5 text-brand-text" />
        </button>
        <h1 className="text-card-title text-brand-text">食物不耐受</h1>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-brand-text">避开不适合你的食物！</h2>
          <p className="text-sm text-brand-secondary mt-1">
            添加你不能吃的食材，我们将在生成菜单时自动为你排除。
          </p>
        </div>

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

        {loading ? (
          <div className="text-center text-sm text-brand-secondary py-4">加载中...</div>
        ) : items.length > 0 ? (
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
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-brand-secondary">还没有添加不耐受食物</p>
          </div>
        )}
      </div>
    </div>
  );
}
