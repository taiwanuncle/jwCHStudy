import type { Idiom, QuizQuestion, QuizMode } from "./types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuizQuestions(
  idioms: Idiom[],
  mode: QuizMode,
  count: number = 10
): QuizQuestion[] {
  if (idioms.length < 4) return [];

  const selected = shuffle(idioms).slice(0, Math.min(count, idioms.length));

  return selected.map((idiom) => {
    // 오답 3개를 나머지에서 랜덤 선택
    const others = idioms.filter((i) => i.id !== idiom.id);
    const distractors = shuffle(others).slice(0, 3);

    let options: string[];
    let correctIndex: number;

    const allOptions = shuffle([idiom, ...distractors]);
    correctIndex = allOptions.findIndex((i) => i.id === idiom.id);

    if (mode === "meaning-to-idiom") {
      options = allOptions.map((i) => i.idiom);
    } else {
      options = allOptions.map((i) => i.meaning_ko || i.meaning_zh);
    }

    return { idiom, options, optionIdioms: allOptions, correctIndex };
  });
}

export function generateFillBlankQuestions(
  idioms: Idiom[],
  count: number = 10
): QuizQuestion[] {
  // 출처 문장이 있는 성어만 사용
  const withSentences = idioms.filter(
    (i) => i.source_sentences.length > 0
  );
  if (withSentences.length < 4) return [];

  const selected = shuffle(withSentences).slice(
    0,
    Math.min(count, withSentences.length)
  );

  return selected.map((idiom) => {
    const sentence = idiom.source_sentences[0];
    const others = withSentences.filter((i) => i.id !== idiom.id);
    const distractors = shuffle(others).slice(0, 3);

    const allOptions = shuffle([idiom, ...distractors]);
    const options = allOptions.map((i) => i.idiom);
    const correctIndex = allOptions.findIndex((i) => i.id === idiom.id);

    return {
      idiom: {
        ...idiom,
        // 문장에서 성어를 빈칸으로 교체
        source_sentences: [
          {
            ...sentence,
            text: sentence.text.replace(idiom.idiom, "____"),
          },
        ],
      },
      options,
      optionIdioms: allOptions,
      correctIndex,
    };
  });
}

export function getStoredProgress(): Record<string, { correct: number; total: number }> {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem("chengyu_progress");
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveProgress(idiomId: string, correct: boolean) {
  if (typeof window === "undefined") return;
  const progress = getStoredProgress();
  if (!progress[idiomId]) {
    progress[idiomId] = { correct: 0, total: 0 };
  }
  progress[idiomId].total++;
  if (correct) progress[idiomId].correct++;
  localStorage.setItem("chengyu_progress", JSON.stringify(progress));
}

export function getWrongAnswers(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("chengyu_wrong");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addWrongAnswer(idiomId: string) {
  if (typeof window === "undefined") return;
  const wrong = getWrongAnswers();
  if (!wrong.includes(idiomId)) {
    wrong.push(idiomId);
    localStorage.setItem("chengyu_wrong", JSON.stringify(wrong));
  }
}

export function removeWrongAnswer(idiomId: string) {
  if (typeof window === "undefined") return;
  const wrong = getWrongAnswers().filter((id) => id !== idiomId);
  localStorage.setItem("chengyu_wrong", JSON.stringify(wrong));
}
