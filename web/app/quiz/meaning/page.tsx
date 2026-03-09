"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuizCard } from "@/components/QuizCard";
import { ScoreBoard } from "@/components/ScoreBoard";
import { getAllIdioms } from "@/lib/data";
import { generateQuizQuestions, saveProgress, addWrongAnswer, removeWrongAnswer } from "@/lib/quiz-utils";
import { useSettings } from "@/lib/settings-context";
import type { QuizQuestion } from "@/lib/types";

export default function MeaningQuizPage() {
  const router = useRouter();
  const { questionCount } = useSettings();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuizQuestions(getAllIdioms(), "meaning-to-idiom", questionCount)
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
    setQuestions(generateQuizQuestions(getAllIdioms(), "meaning-to-idiom", questionCount));
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
      <div className="mb-3 flex justify-between items-center">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">뜻 → 성어 맞추기</h2>
        <span className="text-sm text-indigo-500 font-medium">{score}점</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <QuizCard
        key={currentIndex}
        question={questions[currentIndex]}
        mode="meaning-to-idiom"
        onAnswer={handleAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />
    </div>
  );
}
