'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const UNITS = ['个', '斤', '克', '毫升', '杯', '茶匙', '汤匙'];

export default function GroceriesPage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'pantry') return 'pantry';
    }
    return 'shopping';
  });
  const [items, setItems] = useState<any[]>([]);
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('个');
  const [newAmount, setNewAmount] = useState('');
  const [pantryEditing, setPantryEditing] = useState(false);

  useEffect(() => {
    if (activeTab === 'shopping') fetchGroceries();
    else fetchPantry();
  }, [activeTab]);

  const fetchGroceries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/groceries/aggregate');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('获取购物清单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPantry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pantry');
      if (res.ok) {
        const data = await res.json();
        setPantryItems(data);
      } else {
        setPantryItems([]);
      }
    } catch {
      setPantryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = async (id: string) => {
    try {
      await fetch(`/api/groceries/${id}/toggle`, { method: 'POST' });
      setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
    } catch {
      toast.error('操作失败');
    }
  };

  const clearAll = async () => {
    if (items.length === 0) return;
    if (!window.confirm(`确定要将全部 ${items.length} 种食材标记为已购买并清空？`)) return;

    try {
      const res = await fetch('/api/groceries/clear-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Re-fetch to get latest list
        await fetchGroceries();
        if (data.remaining === 0) {
          toast.success(`已清空 ${data.cleared} 种食材`);
        } else {
          toast.success(`已清空 ${data.cleared} 种食材，库存仍缺 ${data.remaining} 种`);
        }
      } else {
        toast.error('清空失败');
      }
    } catch {
      toast.error('清空失败');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await fetch(`/api/groceries?id=${id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== id));
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  const addPantryItem = async () => {
    if (!newName.trim()) {
      toast.error('请输入食材名称');
      return;
    }
    try {
      const res = await fetch('/api/pantry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, amount: parseFloat(newAmount) || 0, unit: newUnit }),
      });
      if (res.ok) {
        setNewName('');
        setNewAmount('');
        fetchPantry();
        toast.success('已添加到冰箱');
      }
    } catch {
      toast.error('添加失败');
    }
  };

  const deletePantryItem = async (id: string) => {
    try {
      await fetch(`/api/pantry/${id}`, { method: 'DELETE' });
      setPantryItems(pantryItems.filter((item) => item.id !== id));
      toast.success('已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="underline" className="w-full">
          <TabsTrigger value="shopping" variant="underline" className="flex-1">
            购物清单
          </TabsTrigger>
          <TabsTrigger value="pantry" variant="underline" className="flex-1">
            食材冰箱
          </TabsTrigger>
        </TabsList>

        {/* Shopping List Tab */}
        <TabsContent value="shopping" className="space-y-4 mt-4">
          {/* Top actions */}
          <div className="flex items-center justify-end">
            <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-orange-500">
              <Trash2 className="w-4 h-4" />
              <span>清空</span>
            </button>
          </div>

          {/* List */}
          {loading ? (
            <p className="text-center text-brand-secondary text-sm py-8">加载中...</p>
          ) : items.length > 0 ? (
            <div className="space-y-0">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-3 border-b border-[#EEEEEE]"
                >
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleCheck(item.id)}
                  />
                  <span className={`flex-1 text-sm ${item.checked ? 'line-through text-brand-secondary' : 'text-brand-text'}`}>
                    {item.name}
                  </span>
                  <span className="text-sm text-brand-secondary flex-shrink-0">
                    {item.amount}{item.unit}
                  </span>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-[#CCCCCC] hover:text-[#EF4444] p-1 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <div className="text-4xl mb-3">🛒</div>
              <p className="text-sm text-brand-secondary">购物清单为空</p>
            </Card>
          )}
        </TabsContent>

        {/* Pantry Tab */}
        <TabsContent value="pantry" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <span />
            <button
              onClick={() => setPantryEditing(!pantryEditing)}
              className="text-sm text-orange-500 font-medium"
            >
              {pantryEditing ? '完成' : '编辑'}
            </button>
          </div>

          {/* Input bar for pantry */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="食材名称..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />
              <select
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="h-12 px-2 rounded-md border border-[#EEEEEE] bg-white text-sm text-brand-text"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <Input
                placeholder="数量"
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-20"
              />
            </div>
            <button
              onClick={addPantryItem}
              className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {loading ? (
            <p className="text-center text-brand-secondary text-sm py-8">加载中...</p>
          ) : pantryItems.length > 0 ? (
            <div className="space-y-0">
              {pantryItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-[#EEEEEE]"
                >
                  <div className="flex-1">
                    <span className="text-sm text-brand-text">{item.name}</span>
                    <span className="text-sm text-brand-secondary ml-2">
                      {item.amount}{item.unit}
                    </span>
                  </div>
                  {pantryEditing && (
                    <button
                      onClick={() => deletePantryItem(item.id)}
                      className="text-[#EF4444] text-sm p-1"
                    >
                      删除
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm text-brand-secondary">冰箱暂无食材</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
