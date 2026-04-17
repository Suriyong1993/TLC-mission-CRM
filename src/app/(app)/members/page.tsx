import { EmptyState } from "@/components/shared/EmptyState";

export default function MembersPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="👤"
        title="ยังไม่มีสมาชิก"
        description="เพิ่มสมาชิกคนแรกของกลุ่มได้เลยครับ"
        actionLabel="+ เพิ่มสมาชิก"
      />
    </div>
  );
}
