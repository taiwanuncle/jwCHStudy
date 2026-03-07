"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizCard } from "@/components/QuizCard";
import { ScoreBoard } from "@/components/ScoreBoard";
import { getAllIdioms } from "@/lib/data";
import { generateQuizQuestions, saveProgress, addWrongAnswer, removeWrongAnswer } from "@/lib/quiz-utils";
import type { QuizQuestion } from "@/lib/types";

export default function IdiomQuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuizQuestions(getAllIdioms(), "idiom-to-meaning", 10)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

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
    setQuestions(generateQuizQuestions(getAllIdioms(), "idiom-to-meaning", 10));
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        성어가 부족합니다. 최소 4개 이상의 성어가 필요합니다.
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
        <h2 className="text-lg font-semibold">성어 → 뜻 맞추기</h2>
        <span className="text-sm text-gray-500">점수: {score}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-purple-600 h-2 rounded-full transition-all"
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
