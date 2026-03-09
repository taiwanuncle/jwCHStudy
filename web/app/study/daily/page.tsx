"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FlashCard } from "@/components/FlashCard";
import { QuizCard } from "@/components/QuizCard";
import { FillBlank } from "@/components/FillBlank";
import { getAllIdioms } from "@/lib/data";
import { generateQuizQuestions, generateFillBlankQuestions, saveProgress, addWrongAnswer, removeWrongAnswer } from "@/lib/quiz-utils";
import { useSettings } from "@/lib/settings-context";
import type { Idiom, QuizQuestion } from "@/lib/types";

type Stage = "select" | "flashcard" | "meaning-to-idiom" | "fill-blank" | "idiom-to-meaning" | "complete";

const STAGE_INFO: Record<string, { label: string; color: string; icon: string; step: number }> = {
  flashcard: { label: "플래시카드", color: "from-emerald-500 to-teal-500", icon: "卡", step: 1 },
  "meaning-to-idiom": { label: "뜻 → 성어", color: "from-blue-500 to-indigo-500", icon: "文", step: 2 },
  "fill-blank": { label: "빈칸 채우기", color: "from-amber-500 to-orange-500", icon: "填", step: 3 },
  "idiom-to-meaning": { label: "성어 → 뜻", color: "from-purple-500 to-pink-500", icon: "义", step: 4 },
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getDailyMastered(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("chengyu_daily_mastered") || "[]");
  } catch { return []; }
}

function saveDailyMastered(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("chengyu_daily_mastered", JSON.stringify(ids));
}

function getIncludeMastered(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(localStorage.getItem("chengyu_daily_include_mastered") || "false");
  } catch { return false; }
}

export default function DailyPage() {
  const router = useRouter();
  const { questionCount } = useSettings();
  const allIdioms = useMemo(() => getAllIdioms(), []);

  const [stage, setStage] = useState<Stage>("select");
  const [selectedIdioms, setSelectedIdioms] = useState<Idiom[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [scores, setScores] = useState({ "meaning-to-idiom": 0, "fill-blank": 0, "idiom-to-meaning": 0 });
  const [includeMastered, setIncludeMastered] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIncludeMastered(getIncludeMastered());
    setLoaded(true);
  }, []);

  const availableIdioms = useMemo(() => {
    if (includeMastered) return allIdioms;
    const mastered = getDailyMastered();
    return allIdioms.filter((i) => !mastered.includes(i.id));
  }, [allIdioms, includeMastered]);

  const remainingCount = availableIdioms.length;

  const startDaily = () => {
    const count = Math.min(questionCount, availableIdioms.length);
    const selected = shuffle(availableIdioms).slice(0, count);
    setSelectedIdioms(selected);
    setFlashcardIndex(0);
    setStage("flashcard");
  };

  const advanceStage = useCallback(() => {
    if (stage === "flashcard") {
      // Generate meaning-to-idiom questions
      const q = generateQuizQuestions(allIdioms, "meaning-to-idiom", selectedIdioms.length);
      // Replace questions to use our selected idioms
      const customQ = selectedIdioms.map((idiom) => {
        const others = allIdioms.filter((i) => i.id !== idiom.id);
        const distractors = shuffle(others).slice(0, 3);
        const allOptions = shuffle([idiom, ...distractors]);
        const correctIndex = allOptions.findIndex((i) => i.id === idiom.id);
        return {
          idiom,
          options: allOptions.map((i) => i.idiom),
          optionIdioms: allOptions,
          correctIndex,
        };
      });
      setQuestions(shuffle(customQ));
      setCurrentQIndex(0);
      setStage("meaning-to-idiom");
    } else if (stage === "meaning-to-idiom") {
      // Fill blank - only idioms with sentences
      const withSentences = selectedIdioms.filter((i) => i.source_sentences.length > 0);
      if (withSentences.length >= 4) {
        const fillQ = withSentences.map((idiom) => {
          const sentence = idiom.source_sentences[0];
          const others = allIdioms.filter((i) => i.id !== idiom.id && i.source_sentences.length > 0);
          const distractors = shuffle(others).slice(0, 3);
          const allOptions = shuffle([idiom, ...distractors]);
          return {
            idiom: {
              ...idiom,
              source_sentences: [{ ...sentence, text: sentence.text.replace(idiom.idiom, "____") }],
            },
            options: allOptions.map((i) => i.idiom),
            optionIdioms: allOptions,
            correctIndex: allOptions.findIndex((i) => i.id === idiom.id),
          };
        });
        setQuestions(shuffle(fillQ));
        setCurrentQIndex(0);
        setStage("fill-blank");
      } else {
        // Skip fill-blank if not enough sentences, go to idiom-to-meaning
        goToIdiomToMeaning();
      }
    } else if (stage === "fill-blank") {
      goToIdiomToMeaning();
    } else if (stage === "idiom-to-meaning") {
      // Complete! Mark as mastered
      const mastered = getDailyMastered();
      const newMastered = [...new Set([...mastered, ...selectedIdioms.map((i) => i.id)])];
      saveDailyMastered(newMastered);
      setStage("complete");
    }
  }, [stage, selectedIdioms, allIdioms]);

  const goToIdiomToMeaning = () => {
    const idiomsQ = selectedIdioms.map((idiom) => {
      const others = allIdioms.filter((i) => i.id !== idiom.id);
      const distractors = shuffle(others).slice(0, 3);
      const allOptions = shuffle([idiom, ...distractors]);
      return {
        idiom,
        options: allOptions.map((i) => i.meaning_ko || i.meaning_zh),
        optionIdioms: allOptions,
        correctIndex: allOptions.findIndex((i) => i.id === idiom.id),
      };
    });
    setQuestions(shuffle(idiomsQ));
    setCurrentQIndex(0);
    setStage("idiom-to-meaning");
  };

  const handleQuizAnswer = useCallback((selectedIndex: number, correct: boolean) => {
    const q = questions[currentQIndex];
    saveProgress(q.idiom.id, correct);
    if (correct) {
      setScores((s) => ({ ...s, [stage]: s[stage as keyof typeof s] + 1 }));
      removeWrongAnswer(q.idiom.id);
    } else {
      addWrongAnswer(q.idiom.id);
    }

    if (currentQIndex + 1 >= questions.length) {
      advanceStage();
    } else {
      setCurrentQIndex((i) => i + 1);
    }
  }, [currentQIndex, questions, stage, advanceStage]);

  const handleToggleMastered = () => {
    const next = !includeMastered;
    setIncludeMastered(next);
    localStorage.setItem("chengyu_daily_include_mastered", JSON.stringify(next));
  };

  const handleResetMastered = () => {
    saveDailyMastered([]);
    setIncludeMastered(false);
    localStorage.setItem("chengyu_daily_include_mastered", "false");
  };

  if (!loaded) return null;

  // Selection screen
  if (stage === "select") {
    const masteredCount = getDailyMastered().length;
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold font-zh">核心</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">매일의 핵심!</h2>
          <p className="text-sm text-gray-400">4단계로 같은 성어를 반복 학습합니다</p>
        </div>

        {/* Stage flow */}
        <div className="glass-elevated rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-around text-xs text-gray-500">
            {Object.entries(STAGE_INFO).map(([key, info], i) => (
              <div key={key} className="flex flex-col items-center gap-1">
                {i > 0 && <span className="text-gray-300 text-[10px] sm:hidden">▼</span>}
                <span className={`w-10 h-10 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center`}>
                  <span className="text-white text-sm sm:text-xs font-bold font-zh">{info.icon}</span>
                </span>
                <span className="text-[11px] sm:text-xs text-gray-500">{info.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="glass-elevated rounded-2xl p-4 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">남은 성어</span>
            <span className="font-bold text-gray-800">{remainingCount}개</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-gray-600">학습 완료</span>
            <span className="font-bold text-emerald-600">{masteredCount}개</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">완료한 성어도 포함</span>
            <button
              onClick={handleToggleMastered}
              className={`w-10 h-5 rounded-full transition-all relative ${includeMastered ? "bg-indigo-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${includeMastered ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          {masteredCount > 0 && (
            <button
              onClick={handleResetMastered}
              className="mt-3 text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              학습 기록 초기화
            </button>
          )}
        </div>

        {remainingCount < questionCount ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">
              {remainingCount === 0 ? "모든 성어를 학습했습니다!" : `남은 성어가 ${remainingCount}개입니다.`}
            </p>
            {remainingCount === 0 && (
              <button
                onClick={handleResetMastered}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-medium"
              >
                처음부터 다시
              </button>
            )}
            {remainingCount > 0 && remainingCount >= 4 && (
              <button
                onClick={startDaily}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg transition-all font-medium"
              >
                {remainingCount}개로 시작
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={startDaily}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg hover:shadow-lg transition-all"
          >
            학습 시작 ({questionCount}개)
          </button>
        )}
      </div>
    );
  }

  // Flashcard stage
  if (stage === "flashcard") {
    const stageInfo = STAGE_INFO.flashcard;
    return (
      <div>
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stageInfo.color} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold font-zh">{stageInfo.icon}</span>
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">1단계: {stageInfo.label}</h2>
          </div>
          <span className="text-xs text-gray-400">카드를 모두 확인하세요</span>
        </div>

        <FlashCard
          idiom={selectedIdioms[flashcardIndex]}
          onNext={() => {
            if (flashcardIndex + 1 < selectedIdioms.length) {
              setFlashcardIndex((i) => i + 1);
            }
          }}
          onPrev={() => setFlashcardIndex((i) => Math.max(i - 1, 0))}
          currentIndex={flashcardIndex}
          total={selectedIdioms.length}
        />

        {flashcardIndex === selectedIdioms.length - 1 && (
          <button
            onClick={advanceStage}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-base hover:shadow-lg transition-all"
          >
            2단계로 진행 →
          </button>
        )}
      </div>
    );
  }

  // Quiz stages
  if (stage === "meaning-to-idiom" || stage === "fill-blank" || stage === "idiom-to-meaning") {
    const stageKey = stage === "fill-blank" ? "fill-blank" : stage;
    const stageInfo = STAGE_INFO[stageKey];
    const q = questions[currentQIndex];

    if (!q) return null;

    return (
      <div>
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stageInfo.color} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold font-zh">{stageInfo.icon}</span>
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">{stageInfo.step}단계: {stageInfo.label}</h2>
          </div>
          <span className="text-sm font-medium" style={{ color: stage === "meaning-to-idiom" ? "#6366f1" : stage === "fill-blank" ? "#f59e0b" : "#a855f7" }}>
            {scores[stage as keyof typeof scores]}점
          </span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
          <div
            className={`h-1.5 rounded-full transition-all ${stage === "meaning-to-idiom" ? "bg-indigo-500" : stage === "fill-blank" ? "bg-amber-500" : "bg-purple-500"}`}
            style={{ width: `${(currentQIndex / questions.length) * 100}%` }}
          />
        </div>

        {stage === "fill-blank" ? (
          <FillBlank
            key={`fill-${currentQIndex}`}
            question={q}
            onAnswer={handleQuizAnswer}
            questionNumber={currentQIndex + 1}
            totalQuestions={questions.length}
          />
        ) : (
          <QuizCard
            key={`quiz-${stage}-${currentQIndex}`}
            question={q}
            mode={stage as "meaning-to-idiom" | "idiom-to-meaning"}
            onAnswer={handleQuizAnswer}
            questionNumber={currentQIndex + 1}
            totalQuestions={questions.length}
          />
        )}
      </div>
    );
  }

  // Complete screen
  if (stage === "complete") {
    const totalScore = scores["meaning-to-idiom"] + scores["fill-blank"] + scores["idiom-to-meaning"];
    const totalQuestions = selectedIdioms.length * 3; // 3 quiz stages
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-5 flex items-center justify-center">
          <span className="text-white text-3xl font-bold font-zh">优</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">학습 완료!</h2>
        <p className="text-gray-400 mb-6">{selectedIdioms.length}개 성어를 4단계로 학습했습니다</p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-indigo-600">{scores["meaning-to-idiom"]}/{selectedIdioms.length}</p>
            <p className="text-[10px] text-gray-400">뜻→성어</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{scores["fill-blank"]}/{selectedIdioms.length}</p>
            <p className="text-[10px] text-gray-400">빈칸채우기</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-purple-600">{scores["idiom-to-meaning"]}/{selectedIdioms.length}</p>
            <p className="text-[10px] text-gray-400">성어→뜻</p>
          </div>
        </div>

        <div className="glass-elevated rounded-xl p-4 mb-6 text-left">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">학습한 성어</h3>
          <div className="flex flex-wrap gap-2">
            {selectedIdioms.map((idiom) => (
              <span key={idiom.id} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-zh font-medium">
                {idiom.idiom}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStage("select");
              setScores({ "meaning-to-idiom": 0, "fill-blank": 0, "idiom-to-meaning": 0 });
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold hover:shadow-lg transition-all"
          >
            다음 학습
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 py-3 rounded-xl bg-white border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
          >
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return null;
}
