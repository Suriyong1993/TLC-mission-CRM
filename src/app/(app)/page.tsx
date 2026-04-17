import Link from "next/link";
import { GlassCard } from "@/components/shared/GlassCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardStats, fetchLatestPillars, fetchCareGroups } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils/cn";
import { Check, ChevronRight, Users, Heart, TrendingUp, Church } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user/tenant info
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const bodyCode = user.email?.split('@')[0];
  if (!bodyCode) return null;

  // Get body info
  const { data: body } = await supabase
    .from('bodies')
    .select('*')
    .eq('code', bodyCode)
    .single();

  if (!body) return null;

  // Fetch all dashboard data in parallel
  const [stats, latestPillars, careGroups] = await Promise.all([
    fetchDashboardStats(supabase, body.id),
    fetchLatestPillars(supabase, body.id),
    fetchCareGroups(supabase, body.id)
  ]);

  const hasData = stats.groupCount > 0;

  if (!hasData) {
    return (
      <div className="p-4 lg:p-6">
        <EmptyState
          emoji="👋"
          title="ยินดีต้อนรับสู่ TLC-mission CRM"
          description="เริ่มต้นด้วยการเพิ่มกลุ่มแคร์กรุ๊ปแรกของคุณ — เชื่อมต่อ Supabase และรัน seed.sql เพื่อเริ่มใช้งาน"
        />
      </div>
    );
  }

  const pillarsData = [
    { name: "การประกาศ", pillar: 1, current: latestPillars?.pillar_1 || 0, target: 60, emoji: "📢" },
    { name: "การติดตามผล", pillar: 2, current: latestPillars?.pillar_2 || 0, target: 800, emoji: "🔍" },
    { name: "การอภิบาล", pillar: 3, current: latestPillars?.pillar_3 || 0, target: 82, emoji: "🤗" },
    { name: "สร้างผู้นำ", pillar: 4, current: latestPillars?.pillar_4 || 0, target: 94, emoji: "⭐" },
    { name: "อธิษฐานพุธ", pillar: 5, current: latestPillars?.pillar_5 || 0, target: 25, emoji: "🙏" },
    { name: "พพช.", pillar: 6, current: latestPillars?.pillar_6 || 0, target: 60, emoji: "📖" },
    { name: "มาคจ.", pillar: 7, current: latestPillars?.pillar_7 || 0, target: 200, emoji: "⛪" },
    { name: "มาแคร์", pillar: 8, current: latestPillars?.pillar_8 || 0, target: 200, emoji: "🏠" },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24">
      {/* Welcome Header */}
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-sarabun font-bold mb-2">
            The Living Manuscript
          </h1>
          <h2 className="text-4xl font-kanit font-black text-on-surface thai-text tracking-tighter">
            {body.name}
          </h2>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="h-10 w-10 rounded-full bg-ink-lift border border-outline-variant flex items-center justify-center mb-2">
            <span className="text-sky font-jetbrains font-bold text-xs">22</span>
          </div>
          <p className="text-[10px] text-on-surface-variant uppercase font-jetbrains tracking-widest">ISO WEEK 22 • 2026</p>
        </div>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "กลุ่ม", value: stats.groupCount, trend: "↑2%", emoji: "🏰" },
          { label: "สมาชิก", value: stats.memberCount, trend: "↑5%", emoji: "📜" },
          { label: "ประชุม", value: stats.meetingCount, trend: "→", emoji: "🕯️" },
          { label: "ท่าทีน้อย", value: stats.attitudeLowCount, trend: "↓1%", emoji: "⚖️" },
        ].map((stat, i) => (
          <GlassCard
            key={stat.label}
            accentLine="sky"
            hover
            className="p-5 relative overflow-hidden border-none bg-gradient-to-br from-ink-mid to-transparent"
          >
            <div className="absolute top-0 right-0 p-3 text-2xl opacity-20">
              {stat.emoji}
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-sarabun font-bold">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-kanit font-black text-4xl text-sky tracking-tight">
                {stat.value}
              </span>
              <span
                className={cn(
                  "text-[10px] font-sarabun px-1.5 py-0.5 rounded bg-ink-lift",
                  stat.trend.startsWith("↑")
                    ? "text-growth"
                    : stat.trend.startsWith("↓")
                    ? "text-alert"
                    : "text-on-surface-variant"
                )}
              >
                {stat.trend}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 8 Pillar Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {pillarsData.map((p) => {
          const pct = Math.round((p.current / p.target) * 100);
          return (
            <GlassCard
              key={p.pillar}
              hover
              className="p-5 relative overflow-hidden cursor-pointer group border-none bg-ink-mid/40 hover:bg-ink-mid/60"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-ink-lift text-xl">
                  {p.emoji}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-jetbrains">
                  Pillar {p.pillar}
                </span>
              </div>
              <p className="font-sarabun font-bold text-on-surface text-base mb-1">
                {p.name}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-kanit font-black text-3xl text-on-surface">
                  {p.current}
                </span>
                <span className="text-on-surface-variant text-xs font-sarabun">/{p.target}</span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="h-1 w-full bg-ink-deep rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-700 ease-out",
                      pct >= 100 ? "bg-growth" : pct >= 50 ? "bg-gold" : "bg-alert"
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-[10px] font-jetbrains font-bold",
                    pct >= 100 ? "text-growth" : pct >= 50 ? "text-gold" : "text-alert"
                  )}>{pct}%</span>
                  <span className="text-[9px] uppercase tracking-tighter text-on-surface-variant font-sarabun">Weekly Harvest</span>
                </div>
              </div>

              {/* Sparkline simulation using CSS mask or simple line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 opacity-20 bg-gradient-to-r from-transparent via-sky to-transparent" />
            </GlassCard>
          );
        })}
      </div>

      {/* Groups Radar */}
      <GlassCard className="p-8 border-none bg-ink-mid/40">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-kanit font-black text-xl text-on-surface thai-text tracking-tight">
              🏰 กลุ่มทั้งหมด
            </h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-sarabun mt-1">
              Active Care Units
            </p>
          </div>
          <button className="h-10 px-4 rounded-full bg-ink-lift text-sky text-xs font-sarabun hover:bg-sky/10 transition-all border border-outline-variant thai-text">
            ดูทั้งหมด →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {careGroups.map((group) => (
            <Link 
              key={group.id} 
              href={`/entry/attendance/${group.id}`}
              className="flex items-center justify-between group py-3 border-b border-outline-variant hover:border-sky/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-ink-lift border border-outline-variant flex items-center justify-center font-jetbrains text-sky font-bold group-hover:border-sky/50 transition-all">
                  {group.code}
                </div>
                <div>
                  <p className="text-base font-sarabun font-bold text-on-surface thai-text leading-tight group-hover:text-sky transition-all">
                    {group.leader_name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant thai-text mt-0.5">{group.village}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className="text-sm font-jetbrains font-bold text-on-surface">15</p>
                  <p className="text-[9px] uppercase tracking-tighter text-on-surface-variant font-sarabun">Members</p>
                </div>
                <div className="h-8 w-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant group-hover:border-sky group-hover:text-sky group-hover:bg-sky/5 transition-all">
                  <Check size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
