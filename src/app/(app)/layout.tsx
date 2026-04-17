import { Sidebar } from "@/components/layout/Sidebar";
import { BottomTabs } from "@/components/layout/BottomTabs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
}
