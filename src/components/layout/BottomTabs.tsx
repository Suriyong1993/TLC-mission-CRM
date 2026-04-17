"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Home, ClipboardList, Users, Heart, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const tabs = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/entry", label: "กรอกข้อมูล", icon: ClipboardList },
  { href: "/members", label: "สมาชิก", icon: Users },
  { href: "/care", label: "แจ้งเตือน", icon: Heart, badge: true },
  { href: "#more", label: "เพิ่มเติม", icon: MoreHorizontal },
];

const moreItems = [
  { href: "/leaderboard", label: "อันดับ" },
  { href: "/leaders", label: "ผู้นำ" },
  { href: "/trends", label: "แนวโน้ม" },
  { href: "/prayer-school", label: "อธิษฐาน/พพช." },
  { href: "/reports", label: "รายงาน" },
  { href: "/settings", label: "ตั้งค่า" },
];

export function BottomTabs() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  return (
    <>
      {/* Bottom tabs — mobile only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-2 border-t border-line">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive =
              tab.href !== "#more" &&
              (pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href)));

            if (tab.href === "#more") {
              return (
                <button
                  key={tab.href}
                  onClick={() => setShowMore(!showMore)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1 text-text-soft",
                    showMore && "text-sky"
                  )}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="text-[10px] font-sarabun thai-text">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
                  isActive
                    ? "text-sky"
                    : "text-text-soft hover:text-text-main"
                )}
              >
                <div className="relative">
                  <tab.icon className="h-5 w-5" />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-alert" />
                  )}
                </div>
                <span className="text-[10px] font-sarabun thai-text">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* More sheet */}
      {showMore && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 z-50 glass-2 rounded-t-2xl border-t border-line p-4 lg:hidden">
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  className="flex items-center justify-center py-3 rounded-lg bg-ink-lift/50 text-text-soft hover:text-text-main text-sm font-sarabun thai-text transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
