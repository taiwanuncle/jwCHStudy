"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { getAllIdioms, getMetadata, getIdiomsWithSentences } from "@/lib/data";
import { useSettings } from "@/lib/settings-context";

function WelcomeModal({ isOpen, onClose }: { isOpen: boolean; onClose: (dontShowToday: boolean) => void }) {
  const [dontShowToday, setDontShowToday] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => onClose(dontShowToday)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center pt-6 pb-3 px-5">
          <div className="text-4xl mb-2">📖</div>
          <h2 className="text-xl font-bold text-gray-800 font-zh">一起学习！</h2>
          <p className="text-sm text-gray-400 mt-1">함께 공부해요!</p>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 space-y-3">
          <div className="bg-indigo-50 rounded-xl p-4 space-y-2.5 text-sm text-gray-600 leading-relaxed">
            <p>이 앱은 파수대와 깨어라 기사에 등장하는 <strong className="text-indigo-700">중국어 성어(成语)</strong>를 재미있게 학습할 수 있도록 만들었습니다.</p>
            <div className="space-y-1.5">
              <p className="flex items-start gap-2"><span className="text-indigo-500 font-bold">1.</span> <span><strong>뜻↔성어</strong> 퀴즈로 의미를 익히세요</span></p>
              <p className="flex items-start gap-2"><span className="text-indigo-500 font-bold">2.</span> <span><strong>빈칸 채우기</strong>로 실제 문맥을 연습하세요</span></p>
              <p className="flex items-start gap-2"><span className="text-indigo-500 font-bold">3.</span> <span><strong>플래시카드</strong>로 반복 학습하세요</span></p>
              <p className="flex items-start gap-2"><span className="text-indigo-500 font-bold">4.</span> <span><strong>오답복습</strong>으로 약점을 보강하세요</span></p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 text-center">
            <p className="text-white text-sm font-medium mb-1">어디서부터 시작할지 모르겠다면?</p>
            <p className="text-white text-lg font-bold font-zh">핵심 버튼을 눌러보세요! 🚀</p>
            <p className="text-indigo-100 text-xs mt-1">매일 핵심 성어를 4단계로 학습합니다</p>
          </div>

          {/* Don't show today checkbox */}
          <label className="flex items-center gap-2 justify-center cursor-pointer py-1">
            <input
              type="checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-400">오늘은 다시 보지 않음</span>
          </label>

          {/* Close button */}
          <button
            onClick={() => onClose(dontShowToday)}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors text-sm"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const features = [
  { href: "/quiz/meaning", title: "뜻 → 성어 맞추기", description: "한국어 뜻을 보고 4개 성어 중 정답을 고르세요", icon: "文", gradient: "from-blue-500 to-indigo-500" },
  { href: "/quiz/idiom", title: "성어 → 뜻 맞추기", description: "성어를 보고 4개 뜻 중 정답을 고르세요", icon: "义", gradient: "from-purple-500 to-pink-500" },
  { href: "/quiz/fill", title: "빈칸 채우기", description: "파수대 원문에서 빠진 성어를 맞추세요", icon: "填", gradient: "from-amber-500 to-orange-500" },
  { href: "/study/cards", title: "플래시카드", description: "카드를 뒤집으며 성어와 뜻을 학습하세요", icon: "卡", gradient: "from-emerald-500 to-teal-500" },
  { href: "/study/review", title: "오답 복습", description: "틀린 문제를 집중적으로 복습하세요", icon: "复", gradient: "from-red-500 to-rose-500" },
  { href: "/study/progress", title: "나의 학습", description: "학습 진도와 성적을 확인하세요", icon: "绩", gradient: "from-cyan-500 to-blue-500" },
];

export default function Home() {
  const idioms = getAllIdioms();
  const metadata = getMetadata();
  const { showPinyin, showKorean } = useSettings();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const [previewIdioms, setPreviewIdioms] = useState(() => shuffle(idioms).slice(0, 8));

  const handleRandomize = useCallback(() => {
    setPreviewIdioms(shuffle(idioms).slice(0, 8));
  }, [idioms]);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("chengyu_welcome_dismissed");
      if (dismissed) {
        const date = JSON.parse(dismissed);
        const today = new Date().toISOString().slice(0, 10);
        if (date === today) return; // 오늘 이미 닫음
      }
      setWelcomeOpen(true);
    } catch {
      setWelcomeOpen(true);
    }
  }, []);

  const handleCloseWelcome = (dontShowToday: boolean) => {
    setWelcomeOpen(false);
    if (dontShowToday) {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem("chengyu_welcome_dismissed", JSON.stringify(today));
    }
  };

  return (
    <div className="max-w-full overflow-x-hidden">
      <WelcomeModal isOpen={welcomeOpen} onClose={handleCloseWelcome} />
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-zh">成语学习</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">파수대 / 깨어라 기사의 성어들을 공부해요!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        <div className="stat-card rounded-2xl p-3 sm:p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gradient">{idioms.length}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">성어(예문포함)</p>
        </div>
        <Link
          href="/study/daily"
          className="rounded-2xl p-3 sm:p-5 text-center bg-gradient-to-br from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all hover:shadow-lg"
        >
          <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5 font-zh">核心</p>
          <p className="text-[10px] sm:text-xs text-indigo-100 font-medium">매일의 핵심!</p>
        </Link>
        <div className="stat-card rounded-2xl p-3 sm:p-5 text-center">
          <p className="text-lg sm:text-3xl font-bold text-gradient whitespace-nowrap">{metadata.period}</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">수록 기간</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="glass-elevated rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-base sm:text-lg font-bold font-zh">{feature.icon}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-sm sm:text-base">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Random Idioms Preview */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="section-title text-base sm:text-lg">수록 성어 미리보기</h2>
          <button
            onClick={handleRandomize}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all text-xs font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
            랜덤
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {previewIdioms.map((idiom) => (
            <div
              key={idiom.id}
              className="bg-white rounded-xl p-3 text-center border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <p className="text-lg sm:text-xl font-bold font-zh text-gray-800">{idiom.idiom}</p>
              {showPinyin && (
                <p className="text-[10px] sm:text-xs text-indigo-400 mt-1 font-pinyin">{idiom.pinyin}</p>
              )}
              {showKorean && idiom.meaning_ko && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-2">{idiom.meaning_ko}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
