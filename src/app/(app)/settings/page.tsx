import { GlassCard } from "@/components/shared/GlassCard";

export default function SettingsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="font-kanit font-extrabold text-2xl text-text-main thai-text">
        ตั้งค่า
      </h1>
      <GlassCard className="p-5">
        <p className="text-text-soft font-sarabun thai-text">
          หน้าตั้งค่าจะพร้อมใช้งานใน Phase 2
        </p>
      </GlassCard>
    </div>
  );
}
