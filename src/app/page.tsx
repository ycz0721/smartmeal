import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth();

  if (session) {
    // Already logged in — redirect to plan
    const { redirect } = await import('next/navigation');
    redirect('/plan');
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center px-6">
      {/* Logo + Brand name */}
      <div className="flex items-center gap-2 mb-20">
        <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center">
          <span className="text-white text-lg font-bold">S</span>
        </div>
        <span className="text-[#CCCCCC] text-sm tracking-wide">SmartMeal</span>
      </div>

      {/* Three pain point stats */}
      <div className="w-full max-w-sm space-y-8 mb-16">
        <div className="text-center">
          <div className="text-[64px] font-bold text-[#F97316] leading-tight">4.2h</div>
          <div className="text-base text-[#CCCCCC] mt-1">每周花在纠结吃什么上</div>
        </div>

        <div className="text-center">
          <div className="text-[64px] font-bold text-[#F97316] leading-tight">33%</div>
          <div className="text-base text-[#CCCCCC] mt-1">的食材最终进了垃圾桶</div>
        </div>

        <div className="text-center">
          <div className="text-[64px] font-bold text-[#F97316] leading-tight">76%</div>
          <div className="text-base text-[#CCCCCC] mt-1">的家长每天为孩子挑食焦虑</div>
        </div>
      </div>

      {/* Divider + Manifesto */}
      <div className="w-full max-w-sm border-t border-[#333333] pt-8 mb-12">
        <p className="text-xl font-bold text-[#F97316] text-center">我们让这些数字，归零。</p>
      </div>

      {/* CTA Button */}
      <Link
        href="/login"
        className="w-full max-w-sm h-14 rounded-xl bg-[#F97316] text-white text-lg font-medium flex items-center justify-center hover:bg-orange-600 transition-colors active:opacity-90"
      >
        立即开始，生成本周计划
      </Link>
    </div>
  );
}
