"use client";

import { useState } from "react";
import type { Idiom } from "@/lib/types";
import { useSettings } from "@/lib/settings-context";

interface Props {
  idiom: Idiom;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  total: number;
}

export function FlashCard({ idiom, onNext, onPrev, currentIndex, total }: Props) {
  const [flipped, setFlipped] = useState(false);
  const { showPinyin, showKorean } = useSettings();

  const handleFlip = () => setFlipped(!flipped);

  const handleNext = () => {
    setFlipped(false);
    onNext();
  };

  const handlePrev = () => {
    setFlipped(false);
    onPrev();
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <span className="text-gray-400 font-medium">{currentIndex + 1} / {total}</span>
        <span className="text-xs text-gray-400">카드를 클릭하면 뒤집힙니다</span>
      </div>

      {/* Card with flip */}
      <div className="card-flip" onClick={handleFlip}>
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front glass-elevated rounded-2xl p-4 sm:p-8 min-h-[200px] sm:min-h-[260px] flex flex-col items-center justify-center cursor-pointer select-none">
            <p className="text-3xl sm:text-5xl font-bold text-gray-900 mb-3 font-zh tracking-widest text-zh-card">
              {idiom.idiom}
            </p>
            {showPinyin && (
              <p className="text-zh-sub text-indigo-400 mb-2 font-pinyin">{idiom.pinyin}</p>
            )}
            {showKorean && (idiom.meaning_ko_direct || idiom.meaning_ko) && (
              <p className="text-zh-body text-gray-500 mb-2 text-center leading-relaxed">
                {idiom.meaning_ko_direct || idiom.meaning_ko}
              </p>
            )}
            <div className="flex gap-1">
              {Array.from({ length: idiom.difficulty }).map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
              {Array.from({ length: 3 - idiom.difficulty }).map((_, i) => (
                <span key={i} className="text-gray-200 text-sm">★</span>
              ))}
            </div>
          </div>

          {/* Back */}
          <div className="card-back glass-elevated rounded-2xl p-4 sm:p-8 min-h-[200px] sm:min-h-[260px] flex flex-col items-center justify-center cursor-pointer select-none">
            <p className="font-bold text-gray-900 mb-1.5 font-zh tracking-wide text-zh-card-back">
              {idiom.idiom}
            </p>
            {showPinyin && (
              <p className="text-zh-sub text-indigo-400 mb-1.5 font-pinyin">{idiom.pinyin}</p>
            )}
            {showKorean && idiom.meaning_ko_direct && (
              <p className="text-zh-body text-emerald-700 font-medium mb-1 text-center leading-relaxed">{idiom.meaning_ko_direct}</p>
            )}
            <p className="text-zh-body text-gray-600 mb-1 leading-relaxed text-center font-zh">{idiom.meaning_zh}</p>
            {showKorean && idiom.meaning_ko && (
              <p className="text-zh-body text-indigo-700 mb-3 text-center leading-relaxed">{idiom.meaning_ko}</p>
            )}
            {idiom.source_sentences.length > 0 && (
              <div className="bg-indigo-50/50 rounded-lg p-2.5 sm:p-3 text-left w-full border border-indigo-100">
                <p className="text-zh-body text-gray-700 font-zh leading-relaxed">
                  &ldquo;{idiom.source_sentences[0].text}&rdquo;
                </p>
                <p className="text-zh-sub text-gray-400 mt-1 font-zh">
                  — {idiom.source_sentences[0].article} ({idiom.source_sentences[0].issue})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:shadow-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← 이전
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === total - 1}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
