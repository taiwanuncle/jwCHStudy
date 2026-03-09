"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSettings } from "@/lib/settings-context";

const navItems = [
  { href: "/", label: "홈", short: "홈" },
  { href: "/quiz/meaning", label: "뜻→성어", short: "뜻→성어" },
  { href: "/quiz/idiom", label: "성어→뜻", short: "성어→뜻" },
  { href: "/quiz/fill", label: "빈칸채우기", short: "빈칸" },
  { href: "/study/cards", label: "플래시카드", short: "카드" },
  { href: "/study/review", label: "오답복습", short: "복습" },
  { href: "/study/progress", label: "나의학습", short: "학습" },
];

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
        on
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : "bg-white text-gray-400 border-gray-200 line-through"
      }`}
    >
      {label}
    </button>
  );
}

const fontSizeLabels = { small: "작게", medium: "보통", large: "크게", xlarge: "더크게" } as const;

function InfoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 font-zh">一起学习！</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">만든 사람</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              이 앱은 중국어 성어를 공부하는 형제 자매들을 위해 만들었습니다.
              개선 사항이나 건의가 있다면 언제든 연락해 주세요.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">개발자에게 연락하기</h3>
            <div className="space-y-2">
              <a
                href="mailto:atshane81@gmail.com"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
              >
                <span>📧</span>
                <span className="text-gray-600">atshane81@gmail.com</span>
              </a>
              <a
                href="https://pf.kakao.com/_exghAX"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                style={{ backgroundColor: "#FEE500", color: "#191919" }}
              >
                <span>💬</span>
                <span>카카오톡 채널</span>
              </a>
            </div>
          </div>

          {/* Donate */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">후원</h3>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-gray-600 mb-3 text-center">이 앱이 도움이 되셨다면 후원으로 응원해 주세요!</p>
              {/* Donation link - always visible */}
              <a
                href="https://qr.kakaopay.com/FN0023EGr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                style={{ backgroundColor: "#FEE500", color: "#191919" }}
              >
                <span>💛</span>
                <span>카카오페이로 후원하기</span>
              </a>
              {/* Desktop: QR code */}
              <div className="hidden sm:block text-center mt-3">
                <p className="text-xs text-gray-400 mb-2">QR코드를 스캔해 주세요</p>
                <img
                  className="mx-auto rounded-lg"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent("https://qr.kakaopay.com/FN0023EGr")}`}
                  alt="카카오페이 후원 QR코드"
                  width={160}
                  height={160}
                />
              </div>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-gray-300 text-center pt-2">
            비영리 목적으로 제작되었습니다
          </p>
        </div>
      </div>
    </div>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { showPinyin, showKorean, fontSize, timerSeconds, questionCount, togglePinyin, toggleKorean, setFontSize, setTimerSeconds, setQuestionCount } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);

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
      <nav className="bg-white border-b border-gray-200/80 shadow-sm">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          {/* Desktop: single row */}
          <div className="hidden sm:flex items-center justify-between h-14 gap-1">
            <Link href="/" className="font-bold text-lg text-gradient font-zh flex-shrink-0">
              一起学习！
            </Link>
            <div className="flex items-center gap-1 min-w-0 flex-shrink overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => setInfoOpen(true)}
                className="px-1.5 py-0.5 rounded-lg hover:bg-amber-50 transition-all flex-shrink-0"
                title="정보"
              >
                <img src="/panda.png" alt="정보" className="w-8 h-8 rounded-full object-cover" />
              </button>
            </div>
          </div>

          {/* Mobile: two rows */}
          <div className="sm:hidden">
            {/* Row 1: Logo + panda */}
            <div className="flex items-center justify-between h-11 px-1">
              <Link href="/" className="font-bold text-base text-gradient font-zh">
                一起学习！
              </Link>
              <button
                onClick={() => setInfoOpen(true)}
                className="p-0.5 rounded-lg hover:bg-amber-50 transition-all"
                title="정보"
              >
                <img src="/panda.png" alt="정보" className="w-9 h-9 rounded-full object-cover" />
              </button>
            </div>
            {/* Row 2: Nav items */}
            <div className="flex items-center justify-center gap-1 pb-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                  }`}
                >
                  {item.short}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Settings panel - collapsible */}
      <div className="bg-gray-50/80 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-3 sm:px-4">
          <button
            onClick={toggleSettings}
            className="w-full flex items-center justify-between py-2.5 text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="pb-3 space-y-2.5">
              {/* Row 1: Toggles + Font size */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <Toggle on={showPinyin} onToggle={togglePinyin} label="병음" />
                <Toggle on={showKorean} onToggle={toggleKorean} label="한국어" />

                <span className="w-px h-5 bg-gray-200" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm text-gray-400">글씨</span>
                  <div className="flex gap-1">
                    {(["small", "medium", "large", "xlarge"] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          fontSize === size
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
                        }`}
                      >
                        {fontSizeLabels[size]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Timer + Question count */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm text-gray-400">타이머</span>
                  <div className="flex gap-1">
                    {([0, 20, 30, 45] as const).map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setTimerSeconds(sec)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          timerSeconds === sec
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
                        }`}
                      >
                        {sec === 0 ? "OFF" : `${sec}초`}
                      </button>
                    ))}
                  </div>
                </div>

                <span className="w-px h-5 bg-gray-200" />

                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm text-gray-400">문제</span>
                  <div className="flex gap-1">
                    {([5, 10] as const).map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => setQuestionCount(cnt)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          questionCount === cnt
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-100"
                        }`}
                      >
                        {cnt}개
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
