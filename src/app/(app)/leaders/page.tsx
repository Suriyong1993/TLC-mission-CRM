import { EmptyState } from "@/components/shared/EmptyState";

export default function LeadersPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="⭐"
        title="Leadership Pipeline"
        description="ผู้นำทั้งหมดจะแสดงที่นี่ — เชื่อมต่อ Supabase ก่อน"
      />
    </div>
  );
}
