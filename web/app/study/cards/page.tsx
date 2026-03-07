"use client";

import { useState, useMemo } from "react";
import { FlashCard } from "@/components/FlashCard";
import { getAllIdioms } from "@/lib/data";
import type { Idiom } from "@/lib/types";

export default function FlashCardsPage() {
  const allIdioms = useMemo(() => getAllIdioms(), []);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const idioms = useMemo(() => {
    if (difficulty === null) return allIdioms;
    return allIdioms.filter((i) => i.difficulty === difficulty);
  }, [allIdioms, difficulty]);

  const [shuffled, setShuffled] = useState<Idiom[]>(() => [...idioms]);

  const handleShuffle = () => {
    const arr = [...idioms];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
    setCurrentIndex(0);
  };

  const handleDifficultyChange = (d: number | null) => {
    setDifficulty(d);
    const filtered = d === null ? allIdioms : allIdioms.filter((i) => i.difficulty === d);
    setShuffled([...filtered]);
    setCurrentIndex(0);
  };

  if (shuffled.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        해당 난이도의 성어가 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">플래시카드</h2>
          <button
            onClick={handleShuffle}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            🔀 섞기
          </button>
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2">
          {[
            { label: "전체", value: null },
            { label: "쉬움 ★", value: 1 },
            { label: "보통 ★★", value: 2 },
            { label: "어려움 ★★★", value: 3 },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => handleDifficultyChange(value)}
              className={`text-xs px-3 py-1.5 rounded-full ${
                difficulty === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label} ({value === null ? allIdioms.length : allIdioms.filter((i) => i.difficulty === value).length})
            </button>
          ))}
        </div>
      </div>

      <FlashCard
        idiom={shuffled[currentIndex]}
        onNext={() => setCurrentIndex((i) => Math.min(i + 1, shuffled.length - 1))}
        onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
        currentIndex={currentIndex}
        total={shuffled.length}
      />
    </div>
  );
}
