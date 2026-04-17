import { EmptyState } from "@/components/shared/EmptyState";

export default function LeaderboardPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="🏆"
        title="Leaderboard"
        description="อันดับแคร์กรุ๊ปจะแสดงที่นี่ — เชื่อมต่อ Supabase ก่อน"
      />
    </div>
  );
}
