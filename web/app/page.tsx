"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { getAllIdioms, getMetadata, getIdiomsWithSentences } from "@/lib/data";
import { useSettings } from "@/lib/settings-context";

interface Category {
  id: string;
  titleZh: string;
  titleKo: string;
  subtitle: string;
  gradient: string;
  count: number;
  sentenceCount: number;
  period: string;
  available: boolean;
  features: { href: string; title: string; description: string; icon: string; gradient: string }[];
}

export default function Home() {
  const idioms = getAllIdioms();
  const metadata = getMetadata();
  const withSentences = getIdiomsWithSentences();
  const { showPinyin, showKorean } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });

  const categories: Category[] = [
    {
      id: "chengyu",
      titleZh: "成语",
      titleKo: "성어학습",
      subtitle: "파수대 연구용 기사의 성어들을 공부해요!",
      gradient: "from-indigo-500 to-purple-500",
      count: idioms.length,
      sentenceCount: withSentences.length,
      period: metadata.period,
      available: true,
      features: [
        { href: "/quiz/meaning", title: "뜻 → 성어 맞추기", description: "한국어 뜻을 보고 4개 성어 중 정답을 고르세요", icon: "文", gradient: "from-blue-500 to-indigo-500" },
        { href: "/quiz/idiom", title: "성어 → 뜻 맞추기", description: "성어를 보고 4개 뜻 중 정답을 고르세요", icon: "义", gradient: "from-purple-500 to-pink-500" },
        { href: "/quiz/fill", title: "빈칸 채우기", description: "파수대 원문에서 빠진 성어를 맞추세요", icon: "填", gradient: "from-amber-500 to-orange-500" },
        { href: "/study/cards", title: "플래시카드", description: "카드를 뒤집으며 성어와 뜻을 학습하세요", icon: "卡", gradient: "from-emerald-500 to-teal-500" },
        { href: "/study/review", title: "오답 복습", description: "틀린 문제를 집중적으로 복습하세요", icon: "复", gradient: "from-red-500 to-rose-500" },
      ],
    },
    {
      id: "guanyongyu",
      titleZh: "惯用语",
      titleKo: "관용어학습",
      subtitle: "자주 쓰이는 관용어를 학습해요!",
      gradient: "from-emerald-500 to-teal-500",
      count: 0,
      sentenceCount: 0,
      period: "준비중",
      available: false,
      features: [],
    },
    {
      id: "suyu",
      titleZh: "俗语",
      titleKo: "속담학습",
      subtitle: "중국어 속담과 격언을 배워요!",
      gradient: "from-amber-500 to-orange-500",
      count: 0,
      sentenceCount: 0,
      period: "준비중",
      available: false,
      features: [],
    },
    {
      id: "kouyu",
      titleZh: "口语",
      titleKo: "구어학습",
      subtitle: "일상에서 쓰이는 구어 표현을 학습해요!",
      gradient: "from-rose-500 to-pink-500",
      count: 0,
      sentenceCount: 0,
      period: "준비중",
      available: false,
      features: [],
    },
  ];

  const cat = categories[activeIndex];

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveIndex((i) => Math.min(categories.length - 1, i + 1));

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStart.current = { x: e.touches[0].clientX, scrollLeft: 0 };
    setIsDragging(true);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = dragStart.current.x - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  // Keyboard arrow support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div>
      {/* Category Selector */}
      <div
        className="relative mb-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        ref={scrollRef}
      >
        {/* Navigation arrows (PC) */}
        {activeIndex > 0 && (
          <button
            onClick={goPrev}
            className="hidden sm:flex absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-lg border border-gray-100 items-center justify-center text-gray-500 hover:text-indigo-600 hover:shadow-xl transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        {activeIndex < categories.length - 1 && (
          <button
            onClick={goNext}
            className="hidden sm:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/90 shadow-lg border border-gray-100 items-center justify-center text-gray-500 hover:text-indigo-600 hover:shadow-xl transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        )}

        {/* Header card */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">
            <span className={`bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent font-zh`}>{cat.titleZh}</span>
            <span className="text-gray-900"> 학습</span>
          </h1>
          <p className="text-gray-400">{cat.subtitle}</p>
        </div>

        {/* Category dots */}
        <div className="flex justify-center gap-2 mt-4">
          {categories.map((c, i) => (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                i === activeIndex
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                  : c.available
                    ? "bg-white text-gray-500 border-gray-200 hover:border-indigo-200"
                    : "bg-gray-50 text-gray-300 border-gray-100"
              }`}
            >
              {c.titleKo}
            </button>
          ))}
        </div>
      </div>

      {cat.available ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
            <div className="glass rounded-2xl p-3 sm:p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{cat.count}</p>
              <p className="text-xs text-gray-400 mt-1">성어</p>
            </div>
            <div className="glass rounded-2xl p-3 sm:p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{cat.sentenceCount}</p>
              <p className="text-xs text-gray-400 mt-1">예문 포함</p>
            </div>
            <div className="glass rounded-2xl p-3 sm:p-5 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gradient">{cat.period}</p>
              <p className="text-xs text-gray-400 mt-1">수록 기간</p>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {cat.features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="glass rounded-2xl p-5 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-lg font-bold font-zh">{feature.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Idioms Preview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">수록 성어 미리보기</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {idioms.slice(0, 8).map((idiom) => (
                <div
                  key={idiom.id}
                  className="glass rounded-xl p-3 text-center hover:shadow-md transition-all"
                >
                  <p className="text-xl font-bold font-zh text-gray-900">{idiom.idiom}</p>
                  {showPinyin && (
                    <p className="text-xs text-indigo-400 mt-1">{idiom.pinyin}</p>
                  )}
                  {showKorean && idiom.meaning_ko && (
                    <p className="text-xs text-gray-500 mt-0.5">{idiom.meaning_ko}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Coming Soon */
        <div className="text-center py-16">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cat.gradient} mx-auto mb-5 flex items-center justify-center opacity-50`}>
            <span className="text-white text-3xl font-bold font-zh">{cat.titleZh[0]}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-400 mb-2">{cat.titleKo}</h2>
          <p className="text-gray-300 mb-1">준비 중입니다</p>
          <p className="text-sm text-gray-300">파수대 기사에서 데이터를 수집하고 있어요</p>
        </div>
      )}
    </div>
  );
}
