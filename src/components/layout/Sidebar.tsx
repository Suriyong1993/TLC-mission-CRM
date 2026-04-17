"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  Home,
  ClipboardList,
  Users,
  Trophy,
  UserCog,
  TrendingUp,
  BookOpen,
  Heart,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/entry", label: "กรอกข้อมูล", icon: ClipboardList },
  { href: "/groups", label: "แคร์กรุ๊ป", icon: Users },
  { href: "/members", label: "สมาชิก", icon: Users },
  { href: "/leaderboard", label: "อันดับ", icon: Trophy },
  { href: "/leaders", label: "ผู้นำ", icon: UserCog },
  { href: "/trends", label: "แนวโน้ม", icon: TrendingUp },
  { href: "/prayer-school", label: "อธิษฐาน/พพช.", icon: BookOpen },
  { href: "/care", label: "ศูนย์ดูแล", icon: Heart },
  { href: "/reports", label: "รายงาน", icon: FileText },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col fixed left-0 top-0 h-full z-30",
        "glass-1 border-r border-line transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-line">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky to-water flex items-center justify-center text-xl shadow-lg shadow-sky/20 shrink-0">
          ⛪
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-kanit font-black text-lg tracking-tight leading-none text-text-main">
              TLC-mission
            </span>
            <span className="font-sarabun text-[10px] text-text-soft uppercase tracking-widest mt-0.5">
              CRM System
            </span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all duration-200",
                "text-sm font-sarabun thai-text",
                isActive
                  ? "bg-sky/10 text-sky border border-sky/30"
                  : "text-text-soft hover:bg-ink-lift hover:text-text-main border border-transparent"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-line text-text-ghost hover:text-text-soft transition-colors"
        aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
