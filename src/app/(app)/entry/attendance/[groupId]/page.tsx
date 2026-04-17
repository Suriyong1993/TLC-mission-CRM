"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/shared/Button";
import { Loader2, CheckCircle2, ChevronLeft, User, Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { saveAttendance } from "./actions";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { CareGroup, Member } from "@/types/domain";

export default function AttendancePage() {
  const { groupId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [group, setGroup] = useState<CareGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, "present" | "leave" | "absent">>({});

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setFetching(true);
      
      const [groupRes, membersRes] = await Promise.all([
        supabase.from("care_groups").select("*").eq("id", groupId).single(),
        supabase.from("members").select("*").eq("care_group_id", groupId).is("archived_at", null).order("full_name")
      ]);

      if (groupRes.data) setGroup(groupRes.data);
      if (membersRes.data) {
        setMembers(membersRes.data);
        // Default everyone to present
        const initial: Record<string, "present" | "leave" | "absent"> = {};
        membersRes.data.forEach(m => initial[m.id] = "present");
        setAttendance(initial);
      }
      
      setFetching(false);
    }

    if (groupId) fetchData();
  }, [groupId]);

  const toggleStatus = (memberId: string, status: "present" | "leave" | "absent") => {
    setAttendance(prev => ({ ...prev, [memberId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await saveAttendance(formData);

    if (result?.success) {
      toast.success("บันทึกการเช็คชื่อสำเร็จ!");
      router.push("/");
    } else {
      toast.error(result?.error || "เกิดข้อผิดพลาดในการบันทึก");
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-sky" size={40} />
        <p className="text-text-soft font-sarabun thai-text">กำลังโหลดรายชื่อสมาชิก...</p>
      </div>
    );
  }

  if (!group) return <div>Group not found</div>;

  const presentCount = Object.values(attendance).filter(v => v === "present").length;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto pb-32">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-ink-lift rounded-full text-text-soft transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="font-kanit font-extrabold text-2xl text-text-main thai-text">
            เช็คชื่อ: {group.leader_name}
          </h1>
          <p className="font-sarabun text-sm text-text-soft thai-text">
            กลุ่ม {group.code} · {members.length} สมาชิก
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="groupId" value={groupId as string} />
        <input type="hidden" name="meetingDate" value={new Date().toISOString().split('T')[0]} />
        <input type="hidden" name="weekNumber" value="22" />
        <input type="hidden" name="isoYear" value="2026" />

        {members.map((member) => (
          <input key={`hidden-${member.id}`} type="hidden" name={`member_${member.id}`} value={attendance[member.id]} />
        ))}

        <div className="space-y-2">
          {members.map((member) => (
            <GlassCard key={member.id} className={cn(
              "p-3 flex items-center justify-between transition-all duration-200",
              attendance[member.id] === "present" ? "border-growth/30 bg-growth/5" : 
              attendance[member.id] === "leave" ? "border-gold/30 bg-gold/5" : "border-alert/30 bg-alert/5"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold font-sarabun",
                  attendance[member.id] === "present" ? "bg-growth" : 
                  attendance[member.id] === "leave" ? "bg-gold" : "bg-alert"
                )}>
                  {member.full_name[0]}
                </div>
                <div>
                  <p className="font-sarabun font-bold text-text-main thai-text">{member.full_name}</p>
                  <p className="text-[11px] text-text-soft thai-text">{member.nickname || "ไม่มีชื่อเล่น"}</p>
                </div>
              </div>

              <div className="flex bg-ink-deep rounded-lg p-1 gap-1">
                <button
                  type="button"
                  onClick={() => toggleStatus(member.id, "present")}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    attendance[member.id] === "present" ? "bg-growth text-white" : "text-text-ghost hover:text-text-soft"
                  )}
                >
                  <Check size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(member.id, "leave")}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    attendance[member.id] === "leave" ? "bg-gold text-white" : "text-text-ghost hover:text-text-soft"
                  )}
                >
                  <Clock size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleStatus(member.id, "absent")}
                  className={cn(
                    "p-2 rounded-md transition-all",
                    attendance[member.id] === "absent" ? "bg-alert text-white" : "text-text-ghost hover:text-text-soft"
                  )}
                >
                  <X size={18} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Sticky Bottom Bar */}
        <div className="fixed bottom-20 left-0 right-0 p-4 lg:left-64 z-30 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            <GlassCard level={3} className="p-4 flex items-center justify-between gap-6 shadow-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-text-soft uppercase tracking-wider font-sarabun thai-text">
                  มาประชุมวันนี้
                </span>
                <span className="text-2xl font-kanit font-black text-glow-growth text-growth">
                  {presentCount} <span className="text-sm font-sarabun text-text-soft">คน</span>
                </span>
              </div>
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
                    <span className="thai-text">บันทึกการเช็คชื่อ</span>
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
