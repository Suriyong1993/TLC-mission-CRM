import { EmptyState } from "@/components/shared/EmptyState";

export default function GroupsPage() {
  return (
    <div className="p-4 lg:p-6">
      <EmptyState
        emoji="👥"
        title="ยังไม่มีกลุ่มแคร์กรุ๊ป"
        description="เพิ่มกลุ่มแรกของคุณได้เลยครับ"
        actionLabel="+ เพิ่มกลุ่มแรก"
      />
    </div>
  );
}
