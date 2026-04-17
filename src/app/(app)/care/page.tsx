import { EmptyState } from "@/components/shared/EmptyState";

export default function CarePage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="✅"
        title="ทุกคนได้รับการดูแลดีแล้ว 🙏"
        description="ยอดเยี่ยม! ทีมของคุณกำลังทำงานอย่างดี"
      />
    </div>
  );
}
