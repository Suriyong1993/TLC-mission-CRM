import { EmptyState } from "@/components/shared/EmptyState";

export default function ReportsPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="📋"
        title="รายงาน"
        description="รายงานประจำสัปดาห์จะแสดงที่นี่"
      />
    </div>
  );
}
