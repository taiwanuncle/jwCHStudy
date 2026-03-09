"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FillBlank } from "@/components/FillBlank";
import { ScoreBoard } from "@/components/ScoreBoard";
import { getIdiomsWithSentences } from "@/lib/data";
import { generateFillBlankQuestions, saveProgress, addWrongAnswer, removeWrongAnswer } from "@/lib/quiz-utils";
import { useSettings } from "@/lib/settings-context";
import type { QuizQuestion } from "@/lib/types";

export default function FillQuizPage() {
  const router = useRouter();
  const { questionCount } = useSettings();
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateFillBlankQuestions(getIdiomsWithSentences(), questionCount)
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
    setQuestions(generateFillBlankQuestions(getIdiomsWithSentences(), questionCount));
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>예문이 포함된 성어가 부족합니다.</p>
        <p className="text-sm mt-2">최소 4개 이상의 예문 포함 성어가 필요합니다.</p>
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
        <h2 className="text-base sm:text-lg font-semibold text-gray-800">빈칸 채우기</h2>
        <span className="text-sm text-amber-500 font-medium">{score}점</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div
          className="bg-amber-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        />
      </div>

      <FillBlank
        key={currentIndex}
        question={questions[currentIndex]}
        onAnswer={handleAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />
    </div>
  );
}
