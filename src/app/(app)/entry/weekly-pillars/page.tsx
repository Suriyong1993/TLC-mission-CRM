"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/shared/Button";
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { saveWeeklyPillars } from "./actions";
import { toast } from "sonner";

const pillars = [
  { id: 1, name: "การประกาศ", emoji: "📢", color: "pillar-1", target: 60 },
  { id: 2, name: "การติดตามผล", emoji: "🔍", color: "pillar-2", target: 800 },
  { id: 3, name: "การอภิบาล", emoji: "🤗", color: "pillar-3", target: 82 },
  { id: 4, name: "สร้างผู้นำ", emoji: "⭐", color: "pillar-4", target: 94 },
  { id: 5, name: "อธิษฐานพุธ", emoji: "🙏", color: "pillar-5", target: 25 },
  { id: 6, name: "พพช.", emoji: "📖", color: "pillar-6", target: 60 },
  { id: 7, name: "มาคจ.", emoji: "⛪", color: "pillar-7", target: 200 },
  { id: 8, name: "มาแคร์", emoji: "🏠", color: "pillar-8", target: 200 },
];

export default function WeeklyPillarsPage() {
  const [loading, setLoading] = useState(false);
  const [week, setWeek] = useState(22);
  const [year, setYear] = useState(2026);
  const [values, setValues] = useState<Record<number, string>>({});

  const handleInputChange = (id: number, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveWeeklyPillars(formData);

    if (result?.success) {
      toast.success("บันทึกข้อมูลสำเร็จ!");
    } else {
      toast.error(result?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
    setLoading(false);
  };

  const filledCount = Object.values(values).filter(
    (v) => v !== "" && !isNaN(parseInt(v))
  ).length;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8 py-4">
        <div>
          <h1 className="text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-sarabun font-bold mb-2">
            Weekly Harvest Entry
          </h1>
          <h1 className="font-kanit font-black text-3xl text-on-surface thai-text tracking-tight">
            กรอกข้อมูลประจำสัปดาห์
          </h1>
        </div>
        <button className="h-10 px-5 rounded-full bg-ink-lift text-sky text-xs font-sarabun hover:bg-sky/10 transition-all border border-outline-variant thai-text">
          ประวัติ →
        </button>
      </div>

      {/* Week Selector */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {[week - 2, week - 1, week, week + 1].map((w) => (
          <button
            key={w}
            onClick={() => setWeek(w)}
            className={cn(
              "px-6 py-3 rounded-xl text-sm font-sarabun font-bold transition-all flex-shrink-0 border",
              week === w
                ? "bg-sky/10 border-sky/50 text-sky shadow-[0_0_20px_rgba(173,198,255,0.15)]"
                : "bg-ink-mid/40 border-outline-variant text-on-surface-variant hover:border-sky/30"
            )}
          >
            สัปดาห์ {w}
            {week === w && " •"}
          </button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="sticky top-4 z-20 mb-8">
        <GlassCard className="p-4 bg-ink-mid/90 backdrop-blur-xl border-sky/20 shadow-2xl">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant thai-text">
              {filledCount}/8 Pillars Recorded
            </span>
            <span className="text-xs font-jetbrains font-black text-sky">
              {Math.round((filledCount / 8) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-ink-deep rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky to-water transition-all duration-1000 ease-out"
              style={{ width: `${(filledCount / 8) * 100}%` }}
            />
          </div>
        </GlassCard>
      </div>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="week_number" value={week} />
        <input type="hidden" name="iso_year" value={year} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((p) => (
            <GlassCard
              key={p.id}
              className="p-6 relative overflow-hidden group border-none bg-ink-mid/40 hover:bg-ink-mid/60 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-ink-lift flex items-center justify-center text-xl">
                    {p.emoji}
                  </div>
                  <span className="font-sarabun font-bold text-on-surface text-base thai-text">
                    {p.name}
                  </span>
                </div>
                <span className="text-[9px] text-on-surface-variant font-jetbrains tracking-widest uppercase opacity-50">
                  Pillar 0{p.id}
                </span>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    name={`pillar_${p.id}`}
                    value={values[p.id] || ""}
                    onChange={(e) => handleInputChange(p.id, e.target.value)}
                    placeholder="0"
                    className="w-full bg-white text-ink-deep h-16 rounded-2xl text-center text-3xl font-kanit font-black focus:ring-4 focus:ring-sky/20 transition-all border-none placeholder:text-ink-deep/10"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-sarabun uppercase tracking-wider font-bold">
                  <span className="text-on-surface-variant thai-text">เป้าหมาย: {p.target}</span>
                  <span className="text-on-surface-variant thai-text">สป.ก่อน: 0</span>
                </div>
                <div className="h-1 w-full bg-ink-deep rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-700",
                      `bg-pillar-${p.id}`
                    )}
                    style={{
                      width: `${Math.min(
                        (parseInt(values[p.id] || "0") / p.target) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-20 left-0 right-0 p-4 lg:left-64 z-30 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <GlassCard level={3} className="p-4 flex items-center justify-between gap-4">
              <button
                type="reset"
                onClick={() => setValues({})}
                className="text-text-ghost hover:text-alert text-sm font-sarabun transition-colors thai-text"
              >
                ล้างฟอร์ม
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-sky to-water h-12 text-white font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    <span className="thai-text">กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2" size={20} />
                    <span className="thai-text">บันทึกข้อมูล</span>
                  </>
                )}
              </Button>
            </GlassCard>
          </div>
        </div>
      </form>
    </div>
  );
}
