export interface SourceSentence {
  text: string;
  article: string;
  issue: string;
  documentId: number;
}

export interface Idiom {
  id: string;
  idiom: string;
  pinyin: string;
  meaning_zh: string;
  meaning_ko: string;
  category: string;
  difficulty: number;
  source_sentences: SourceSentence[];
}

export interface IdiomsData {
  metadata: {
    source: string;
    language: string;
    period: string;
    total_idioms: number;
    extracted_date: string;
  };
  idioms: Idiom[];
}

export type QuizMode = "meaning-to-idiom" | "idiom-to-meaning";

export interface QuizQuestion {
  idiom: Idiom;
  options: string[];
  correctIndex: number;
}

export interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: (number | null)[];
  isComplete: boolean;
}
