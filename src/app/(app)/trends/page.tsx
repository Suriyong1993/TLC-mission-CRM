import { EmptyState } from "@/components/shared/EmptyState";

export default function TrendsPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="📈"
        title="แนวโน้มรายสัปดาห์"
        description="กราฟ 12 สัปดาห์ของแต่ละเสาจะแสดงที่นี่"
      />
    </div>
  );
}
