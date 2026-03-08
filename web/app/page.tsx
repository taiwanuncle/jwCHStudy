"use client";

import Link from "next/link";
import { getAllIdioms, getMetadata, getIdiomsWithSentences } from "@/lib/data";
import { useSettings } from "@/lib/settings-context";

const features = [
  {
    href: "/quiz/meaning",
    title: "뜻 → 성어 맞추기",
    description: "한국어 뜻을 보고 4개 성어 중 정답을 고르세요",
    icon: "文",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    href: "/quiz/idiom",
    title: "성어 → 뜻 맞추기",
    description: "성어를 보고 4개 뜻 중 정답을 고르세요",
    icon: "义",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    href: "/quiz/fill",
    title: "빈칸 채우기",
    description: "파수대 원문에서 빠진 성어를 맞추세요",
    icon: "填",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    href: "/study/cards",
    title: "플래시카드",
    description: "카드를 뒤집으며 성어와 뜻을 학습하세요",
    icon: "卡",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    href: "/study/review",
    title: "오답 복습",
    description: "틀린 문제를 집중적으로 복습하세요",
    icon: "复",
    gradient: "from-red-500 to-rose-500",
  },
];

export default function Home() {
  const idioms = getAllIdioms();
  const metadata = getMetadata();
  const withSentences = getIdiomsWithSentences();
  const { showPinyin, showKorean } = useSettings();

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-gradient font-zh">成语</span>
          <span className="text-gray-900"> 학습</span>
        </h1>
        <p className="text-gray-400">파수대 연구용 기사의 성어/관용어들을 공부해요!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
        <div className="glass rounded-2xl p-3 sm:p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gradient">{idioms.length}</p>
          <p className="text-xs text-gray-400 mt-1">성어</p>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gradient">{withSentences.length}</p>
          <p className="text-xs text-gray-400 mt-1">예문 포함</p>
        </div>
        <div className="glass rounded-2xl p-3 sm:p-5 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gradient">{metadata.period}</p>
          <p className="text-xs text-gray-400 mt-1">수록 기간</p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {features.map((feature) => (
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
    </div>
  );
}
