"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSettings } from "@/lib/settings-context";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/quiz/meaning", label: "뜻→성어" },
  { href: "/quiz/idiom", label: "성어→뜻" },
  { href: "/quiz/fill", label: "빈칸채우기" },
  { href: "/study/cards", label: "플래시카드" },
  { href: "/study/review", label: "오답복습" },
];

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1.5 text-xs">
      <span className={`w-7 h-4 rounded-full relative transition-colors ${on ? "bg-indigo-500" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${on ? "translate-x-3.5" : "translate-x-0.5"}`} />
      </span>
      <span className={on ? "text-indigo-600" : "text-gray-400"}>{label}</span>
    </button>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { showPinyin, showKorean, togglePinyin, toggleKorean } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-lg text-gradient font-zh">
            成语学习
          </Link>

          <div className="flex items-center gap-1">
            <div className="flex gap-0.5 overflow-x-auto mr-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    pathname === item.href
                      ? "bg-indigo-100 text-indigo-700 font-semibold shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Settings gear */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="설정"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              </button>
              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                  <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-48">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">표시 설정</p>
                    <div className="flex flex-col gap-3">
                      <Toggle on={showPinyin} onToggle={togglePinyin} label="병음(拼音)" />
                      <Toggle on={showKorean} onToggle={toggleKorean} label="한국어 뜻" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
