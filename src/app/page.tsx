import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  Trophy, 
  Crown,
  TrendingUp,
  BookOpen,
  Heart,
  Edit3,
  MessageCircle
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-deep p-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 pt-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-kanit)' }}>
            🌊 TLC-mission CRM
          </h1>
          <p className="text-text-soft text-lg mb-6">
            ระบบติดตามพันธกิจคริสตจักรแบบครบวงจร
          </p>
          <p className="text-text-ghost text-sm">
            สำหรับทีมพันธกิจกาฬสินธุ์ — ลดเวลาจาก 3 ชั่วโมง เหลือ 3 นาที
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <NavCard 
            href="/entry/weekly-pillars" 
            icon={<Edit3 className="w-6 h-6" />}
            title="กรอก 8 เสา"
            desc="บันทึกรายสัปดาห์"
            color="from-orange-500 to-red-500"
          />
          <NavCard 
            href="/entry/weekly-makj" 
            icon={<Users className="w-6 h-6" />}
            title="กรอก มาคจ."
            desc="20 กลุ่ม"
            color="from-amber-500 to-yellow-500"
          />
          <NavCard 
            href="/" 
            icon={<LayoutDashboard className="w-6 h-6" />}
            title="แดชบอร์ด"
            desc="ภาพรวม 8 เสา"
            color="from-blue-500 to-cyan-500"
          />
          <NavCard 
            href="/groups" 
            icon={<UserCircle className="w-6 h-6" />}
            title="กลุ่มแคร์"
            desc="จัดการกลุ่ม"
            color="from-purple-500 to-pink-500"
          />
          <NavCard 
            href="/members" 
            icon={<Users className="w-6 h-6" />}
            title="สมาชิก"
            desc="165+ คน"
            color="from-emerald-500 to-teal-500"
          />
          <NavCard 
            href="/leaderboard" 
            icon={<Trophy className="w-6 h-6" />}
            title="อันดับ"
            desc="กลุ่มแข่งขัน"
            color="from-yellow-500 to-orange-500"
          />
          <NavCard 
            href="/leaders" 
            icon={<Crown className="w-6 h-6" />}
            title="ผู้นำ"
            desc="Leadership Pipeline"
            color="from-indigo-500 to-purple-500"
          />
          <NavCard 
            href="/trends" 
            icon={<TrendingUp className="w-6 h-6" />}
            title="แนวโน้ม"
            desc="12 สัปดาห์"
            color="from-cyan-500 to-blue-500"
          />
          <NavCard 
            href="/prayer-school" 
            icon={<BookOpen className="w-6 h-6" />}
            title="อธิษฐาน + พพช."
            desc="เรียนรู้พระคำ"
            color="from-pink-500 to-rose-500"
          />
        </div>

        {/* Status */}
        <div className="glass-1 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-4">สถานะระบบ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <StatusBadge label="UI Pages" value="12/16" status="good" />
            <StatusBadge label="Database" value="Ready" status="good" />
            <StatusBadge label="Supabase" value="Schema ✓" status="good" />
            <StatusBadge label="Vercel" value="Ready" status="good" />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-8 text-center text-text-ghost text-sm">
          <p>Built with Next.js 15 + TypeScript + Tailwind CSS + Supabase</p>
          <p className="mt-2">Design System: Deep Ocean Glass</p>
        </div>
      </div>
    </main>
  );
}

function NavCard({ 
  href, 
  icon, 
  title, 
  desc, 
  color 
}: { 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  desc: string;
  color: string;
}) {
  return (
    <Link 
      href={href}
      className="glass-1 rounded-xl p-4 hover:scale-[1.02] transition-transform group"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 group-hover:shadow-lg transition-shadow`}>
        {icon}
      </div>
      <h3 className="font-bold text-white text-lg">{title}</h3>
      <p className="text-text-soft text-sm">{desc}</p>
    </Link>
  );
}

function StatusBadge({ 
  label, 
  value, 
  status 
}: { 
  label: string; 
  value: string; 
  status: 'good' | 'warning' | 'error';
}) {
  const colors = {
    good: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
  };
  
  return (
    <div className="glass-1 rounded-lg p-3">
      <div className="text-text-ghost text-xs uppercase tracking-wider">{label}</div>
      <div className={`font-bold ${colors[status]}`}>{value}</div>
    </div>
  );
}
