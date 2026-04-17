"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/shared/Button";
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { saveWeeklyMakj } from "./actions";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { SizeBadge, classifySize } from "@/components/shared/SizeBadge";
import { CareGroup } from "@/types/domain";

export default function WeeklyMakjPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [week, setWeek] = useState(22);
  const [year, setYear] = useState(2026);
  const [groups, setGroups] = useState<CareGroup[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    async function fetchGroups() {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const bodyId = user.email?.split('@')[0];
      const { data: body } = await supabase
        .from('bodies')
        .select('id')
        .eq('code', bodyId)
        .single();

      if (body) {
        const { data: groupsData } = await supabase
          .from("care_groups")
          .select("*")
          .eq("body_id", body.id)
          .is("archived_at", null)
          .order("sort_order", { ascending: true });

        if (groupsData) {
          setGroups(groupsData);
        }
      }
      setFetching(false);
    }

    fetchGroups();
  }, []);

  const handleInputChange = (groupId: string, value: string) => {
    setValues((prev) => ({ ...prev, [groupId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveWeeklyMakj(formData);

    if (result?.success) {
      toast.success("บันทึก มาคจ. ทั้งหมดสำเร็จ! ✓");
    } else {
      toast.error(result?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
    setLoading(false);
  };

  const filledCount = Object.values(values).filter(
    (v) => v !== "" && !isNaN(parseInt(v))
  ).length;

  const totalAttendance = Object.values(values).reduce(
    (acc, curr) => acc + (parseInt(curr) || 0),
    0
  );

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between mb-8 py-4">
        <div>
          <h1 className="text-on-surface-variant text-[10px] uppercase tracking-[0.3em] font-sarabun font-bold mb-2">
            Quick Attendance Entry
          </h1>
          <h1 className="font-kanit font-black text-3xl text-on-surface thai-text tracking-tight">
            กรอก มาคจ. ประจำสัปดาห์
          </h1>
        </div>
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant thai-text">
            {filledCount}/{groups.length} Groups Recorded
          </span>
          <span className="text-xs font-jetbrains font-black text-sky">
            {groups.length > 0 ? Math.round((filledCount / groups.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-ink-deep rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky to-water transition-all duration-1000 ease-out"
            style={{ width: `${groups.length > 0 ? (filledCount / groups.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {fetching ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-sky" size={40} />
          <p className="text-on-surface-variant font-sarabun thai-text uppercase tracking-widest text-[10px] font-bold">Summoning Care Units...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="week_number" value={week} />
          <input type="hidden" name="iso_year" value={year} />

          <div className="space-y-3">
            {groups.map((group) => {
              const count = parseInt(values[group.id] || "0");
              const size = classifySize(count);

              return (
                <GlassCard
                  key={group.id}
                  className="p-4 flex items-center justify-between gap-4 group border-none bg-ink-mid/40 hover:bg-ink-mid/60 transition-all"
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

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <input
                        type="number"
                        name={`group_${group.id}`}
                        value={values[group.id] || ""}
                        onChange={(e) => handleInputChange(group.id, e.target.value)}
                        placeholder="0"
                        className="w-24 h-14 bg-white text-ink-deep rounded-xl text-center text-2xl font-kanit font-black focus:ring-4 focus:ring-sky/20 transition-all border-none"
                      />
                    </div>
                    <div className="w-12 flex justify-center">
                      <SizeBadge size={size} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-20 left-0 right-0 p-4 lg:left-64 z-30 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <GlassCard level={3} className="p-5 flex items-center justify-between gap-8 shadow-[0_32px_64px_rgba(0,0,0,0.8)] border-sky/20 bg-ink-deep/95 backdrop-blur-2xl">
                <div className="flex flex-col">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold font-sarabun">
                    Total Attendance
                  </span>
                  <span className="text-3xl font-kanit font-black text-sky tracking-tighter">
                    {totalAttendance} <span className="text-xs font-sarabun text-on-surface-variant tracking-normal">PEOPLE</span>
                  </span>
                </div>
                <Button
                  type="submit"
                  disabled={loading || groups.length === 0}
                  className="flex-1 bg-gradient-to-r from-sky to-water h-14 text-white font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(173,198,255,0.3)]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-3" size={24} />
                      <span className="thai-text">กำลังประมวลผล...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-3" size={24} />
                      <span className="thai-text uppercase tracking-widest font-bold">Commit All</span>
                    </>
                  )}
                </Button>
              </GlassCard>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
