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
      <div className="flex justify-between items-center mb-4 text-sm">
        <span className="text-gray-400 font-medium">{currentIndex + 1} / {total}</span>
        <span className="text-xs text-gray-400">카드를 클릭하면 뒤집힙니다</span>
      </div>

      {/* Card with flip */}
      <div className="card-flip" onClick={handleFlip}>
        <div className={`card-flip-inner relative ${flipped ? "flipped" : ""}`}>
          {/* Front */}
          <div className="card-front glass rounded-2xl shadow-lg p-10 min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none">
            <p className="text-5xl font-bold text-gray-900 mb-4 font-zh tracking-widest text-zh-card">
              {idiom.idiom}
            </p>
            {showPinyin && (
              <p className="text-lg text-indigo-400 mb-3">{idiom.pinyin}</p>
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
          <div className="card-back absolute inset-0 glass rounded-2xl shadow-lg p-8 min-h-[300px] flex flex-col items-center justify-center cursor-pointer select-none">
            <p className="text-2xl font-bold text-gray-900 mb-2 font-zh tracking-wide">
              {idiom.idiom}
            </p>
            {showPinyin && (
              <p className="text-sm text-indigo-400 mb-2">{idiom.pinyin}</p>
            )}
            {showKorean && idiom.meaning_ko && (
              <p className="text-lg text-indigo-700 font-semibold mb-2">{idiom.meaning_ko}</p>
            )}
            <p className="text-sm text-gray-600 mb-4 leading-relaxed text-center">{idiom.meaning_zh}</p>
            {idiom.source_sentences.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-lg p-3 text-left w-full border border-indigo-100/50">
                <p className="text-sm text-gray-700 font-zh">
                  &ldquo;{idiom.source_sentences[0].text}&rdquo;
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  — {idiom.source_sentences[0].article} ({idiom.source_sentences[0].issue})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-5">
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
