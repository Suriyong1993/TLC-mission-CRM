import { EmptyState } from "@/components/shared/EmptyState";

export default function PrayerSchoolPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="🙏"
        title="อธิษฐานเช้าพุธ & พพช."
        description="ข้อมูลการอธิษฐานและหลักสูตรจะแสดงที่นี่"
      />
    </div>
  );
}
