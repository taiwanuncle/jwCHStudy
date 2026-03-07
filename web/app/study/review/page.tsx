"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizCard } from "@/components/QuizCard";
import { ScoreBoard } from "@/components/ScoreBoard";
import { getAllIdioms } from "@/lib/data";
import {
  getWrongAnswers,
  generateQuizQuestions,
  saveProgress,
  removeWrongAnswer,
  addWrongAnswer,
} from "@/lib/quiz-utils";
import type { Idiom, QuizQuestion } from "@/lib/types";

export default function ReviewPage() {
  const router = useRouter();
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [wrongIdioms, setWrongIdioms] = useState<Idiom[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ids = getWrongAnswers();
    setWrongIds(ids);
    const all = getAllIdioms();
    const wrong = all.filter((i) => ids.includes(i.id));
    setWrongIdioms(wrong);

    if (wrong.length >= 4) {
      setQuestions(generateQuizQuestions(wrong, "idiom-to-meaning", wrong.length));
    }
    setLoaded(true);
  }, []);

  const handleAnswer = useCallback((selectedIndex: number, correct: boolean) => {
    const q = questions[currentIndex];
    saveProgress(q.idiom.id, correct);
    if (correct) {
      setScore((s) => s + 1);
      removeWrongAnswer(q.idiom.id);
    } else {
      addWrongAnswer(q.idiom.id);
    }

    if (currentIndex + 1 >= questions.length) {
      setIsComplete(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions]);

  const handleRestart = () => {
    const ids = getWrongAnswers();
    const all = getAllIdioms();
    const wrong = all.filter((i) => ids.includes(i.id));
    if (wrong.length >= 4) {
      setQuestions(generateQuizQuestions(wrong, "idiom-to-meaning", wrong.length));
      setCurrentIndex(0);
      setScore(0);
      setIsComplete(false);
    }
  };

  const handleClearAll = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chengyu_wrong");
      setWrongIds([]);
      setWrongIdioms([]);
      setQuestions([]);
    }
  };

  if (!loaded) return null;

  if (wrongIdioms.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mx-auto mb-5 flex items-center justify-center">
          <span className="text-white text-2xl font-bold font-zh">优</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">오답이 없습니다!</h2>
        <p className="text-gray-400 mb-6">퀴즈를 풀면서 틀린 성어가 여기에 모입니다.</p>
        <button
          onClick={() => router.push("/quiz/meaning")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all font-medium"
        >
          퀴즈 풀러 가기
        </button>
      </div>
    );
  }

  if (wrongIdioms.length < 4) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">오답 목록</h2>
        <p className="text-gray-400 mb-4">
          오답이 {wrongIdioms.length}개 있습니다. 퀴즈를 시작하려면 최소 4개가 필요합니다.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
          {wrongIdioms.map((idiom) => (
            <div key={idiom.id} className="glass rounded-xl p-3 text-center">
              <p className="text-lg font-bold font-zh">{idiom.idiom}</p>
              <p className="text-xs text-indigo-400">{idiom.pinyin}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push("/quiz/meaning")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transition-all font-medium"
        >
          퀴즈 더 풀기
        </button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <ScoreBoard
        score={score}
        total={questions.length}
        onRestart={handleRestart}
        onHome={() => router.push("/")}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">오답 복습 ({wrongIds.length}개)</h2>
        <button
          onClick={handleClearAll}
          className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          오답 초기화
        </button>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <QuizCard
        question={questions[currentIndex]}
        mode="idiom-to-meaning"
        onAnswer={handleAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />
    </div>
  );
}
