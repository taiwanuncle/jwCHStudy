"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        on
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : "bg-gray-50 text-gray-400 border-gray-200 line-through"
      }`}
    >
      {label}
    </button>
  );
}

const fontSizeLabels = { small: "작게", medium: "보통", large: "크게" } as const;

export function Navigation() {
  const pathname = usePathname();
  const { showPinyin, showKorean, fontSize, togglePinyin, toggleKorean, setFontSize } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("chengyu_settings_panel");
      if (saved !== null) setSettingsOpen(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSettings = () => {
    const next = !settingsOpen;
    setSettingsOpen(next);
    localStorage.setItem("chengyu_settings_panel", JSON.stringify(next));
  };

  return (
    <div className="sticky top-0 z-50">
      {/* Main nav bar */}
      <nav className="glass border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-bold text-lg text-gradient font-zh flex-shrink-0">
              成语学习
            </Link>

            <div className="flex items-center gap-1">
              <div className="flex gap-0.5 overflow-x-auto">
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
            </div>
          </div>
        </div>
      </nav>

      {/* Settings panel - collapsible */}
      <div className="glass border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={toggleSettings}
            className="w-full flex items-center justify-between py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="font-medium">설정</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {settingsOpen && (
            <div className="pb-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Toggles */}
              <Toggle on={showPinyin} onToggle={togglePinyin} label="병음(拼音)" />
              <Toggle on={showKorean} onToggle={toggleKorean} label="한국어 뜻" />

              {/* Divider */}
              <span className="hidden sm:block w-px h-5 bg-gray-200" />

              {/* Font size */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">글씨</span>
                <div className="flex gap-1">
                  {(["small", "medium", "large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        fontSize === size
                          ? "bg-indigo-100 text-indigo-700 shadow-sm"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      {fontSizeLabels[size]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
