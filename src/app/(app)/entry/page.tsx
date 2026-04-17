import Link from "next/link";
import { GlassCard } from "@/components/shared/GlassCard";
import { ClipboardList, Church } from "lucide-react";

export default function EntryHubPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <h1 className="font-kanit font-extrabold text-2xl text-text-main thai-text">
        กรอกข้อมูล
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/entry/weekly-pillars">
          <GlassCard accentLine="sky" hover className="p-5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-sky/10 flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-sky" />
              </div>
              <div>
                <h2 className="font-sarabun font-semibold text-text-main thai-text">
                  8 เสาหลัก
                </h2>
                <p className="text-xs text-text-soft thai-text">
                  กรอกข้อมูลประจำสัปดาห์ทีม G
                </p>
              </div>
            </div>
          </GlassCard>
        </Link>
        <Link href="/entry/weekly-makj">
          <GlassCard accentLine="gold" hover className="p-5 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Church className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h2 className="font-sarabun font-semibold text-text-main thai-text">
                  มาคจ. รายกลุ่ม
                </h2>
                <p className="text-xs text-text-soft thai-text">
                  กรอกจำนวนมาคริสตจักร 20 กลุ่ม
                </p>
              </div>
            </div>
          </GlassCard>
        </Link>
      </div>
    </div>
  );
}
