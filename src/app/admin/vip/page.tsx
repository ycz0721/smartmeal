'use client';

import { useState } from 'react';

export default function AdminVipPage() {
  const [password, setPassword] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthorized(true);
  };

  const handleGrant = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/grant-vip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ phone: phone.trim(), days: 30 }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', msg: data.message });
      } else {
        setResult({ type: 'error', msg: data.error || '操作失败' });
      }
    } catch {
      setResult({ type: 'error', msg: '网络错误' });
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-white text-xl font-bold text-center">管理员登录</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入管理员密码"
            className="w-full h-11 rounded-xl bg-[#2A2A2A] px-4 text-white text-sm placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#F97316] text-white font-medium"
          >
            进入
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] px-6 py-12">
      <div className="max-w-sm mx-auto space-y-6">
        <h1 className="text-white text-xl font-bold text-center">会员管理</h1>
        <div className="space-y-3">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="用户手机号"
            className="w-full h-11 rounded-xl bg-[#2A2A2A] px-4 text-white text-sm placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          <button
            onClick={handleGrant}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#F97316] text-white font-medium disabled:opacity-50"
          >
            {loading ? '处理中...' : '开通30天会员'}
          </button>
        </div>
        {result && (
          <p className={`text-sm text-center ${result.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {result.msg}
          </p>
        )}
      </div>
    </div>
  );
}
