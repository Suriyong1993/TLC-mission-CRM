"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/shared/Button";
import { Input } from "@/components/shared/Input";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { login } from "./actions";

type LoginTab = "body" | "admin";

const bodies = [
  { code: "body_1", name: "เมือง 1", color: "#3b82f6" },
  { code: "body_2", name: "เมือง 2", color: "#06b6d4" },
  { code: "body_3", name: "สมเด็จ", color: "#8b5cf6" },
  { code: "body_4", name: "ท่าคันโท", color: "#10b981" },
  { code: "body_5", name: "กุฉินารายณ์", color: "#f59e0b" },
  { code: "body_6", name: "คำใหญ่", color: "#ec4899" },
];

export default function LoginPage() {
  const [tab, setTab] = useState<LoginTab>("body");
  const [selectedBody, setSelectedBody] = useState(bodies[0].code);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background texture */}
      <div className="absolute inset-0 bg-ink-deep" />

      <GlassCard level={2} className="w-full max-w-[440px] p-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
              boxShadow:
                "0 0 0 4px rgba(59,130,246,0.15), 0 0 30px rgba(59,130,246,0.3)",
            }}
          >
            ⛪
          </div>
        </div>

        {/* Title */}
        <h1 className="font-kanit font-extrabold text-[22px] text-text-main text-center thai-text">
          ระบบติดตามกลุ่มพันธกิจ
        </h1>
        <p className="font-sarabun text-[13px] text-text-soft text-center mt-1 thai-text">
          คริสตจักรกาฬสินธุ์
        </p>

        {/* Tab switcher */}
        <div className="flex mt-6 rounded-lg bg-ink-deep/50 p-1">
          {(["body", "admin"] as LoginTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className={cn(
                "flex-1 py-2 rounded-md text-sm font-sarabun font-medium transition-all duration-150 thai-text",
                tab === t
                  ? "bg-gradient-to-r from-sky to-water text-white shadow-sm"
                  : "text-text-soft hover:text-text-main"
              )}
            >
              {t === "body" ? "Body" : "Admin"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input type="hidden" name="tab" value={tab} />
          {/* Body selector (Body tab only) */}
          {tab === "body" && (
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-text-soft font-sarabun font-medium">
                เลือก Body
              </label>
              <input type="hidden" name="selectedBody" value={selectedBody} />
              <div className="grid grid-cols-2 gap-2">
                {bodies.map((body) => (
                  <button
                    key={body.code}
                    type="button"
                    onClick={() => setSelectedBody(body.code)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all duration-150",
                      selectedBody === body.code
                        ? "border-sky bg-sky/10"
                        : "border-line bg-ink-input hover:bg-ink-lift"
                    )}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: body.color }}
                    />
                    <span className="text-sm font-sarabun text-text-main thai-text">
                      {body.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-ghost" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="รหัสผ่าน"
              className="w-full h-11 pl-9 pr-10 rounded-md border border-line bg-ink-input text-text-main font-sarabun text-sm placeholder:text-text-ghost focus:border-sky focus:ring-2 focus:ring-sky/25 focus:outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-ghost hover:text-text-soft transition-colors"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-alert font-sarabun thai-text animate-[fadeIn_0.3s_ease]">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full h-12 text-base font-semibold mt-4 gap-2",
              tab === "admin"
                ? "bg-gradient-to-r from-spirit to-sky text-white"
                : "bg-gradient-to-r from-sky to-water text-white"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : (
              <>
                <span>เข้าสู่ระบบ</span>
                <span className="text-xl">►</span>
              </>
            )}
          </Button>
        </form>

        {/* Demo hint */}
        <details className="mt-4">
          <summary className="text-xs text-text-ghost cursor-pointer font-sarabun thai-text">
            💡 รหัสผ่านทดลอง...
          </summary>
          <div className="mt-2 text-xs text-text-ghost font-jetbrains space-y-1">
            <p>Body: body_1@mission.local / password123</p>
            <p>Admin: admin@mission.local / admin123</p>
          </div>
        </details>
      </GlassCard>
    </div>
  );
}
