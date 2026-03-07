import type { IdiomsData, Idiom } from "./types";
import idiomsRaw from "@/data/idioms.json";

const idiomsData = idiomsRaw as IdiomsData;

export function getAllIdioms(): Idiom[] {
  return idiomsData.idioms;
}

export function getIdiomById(id: string): Idiom | undefined {
  return idiomsData.idioms.find((i) => i.id === id);
}

export function getIdiomsByDifficulty(difficulty: number): Idiom[] {
  return idiomsData.idioms.filter((i) => i.difficulty === difficulty);
}

export function getIdiomsWithSentences(): Idiom[] {
  return idiomsData.idioms.filter((i) => i.source_sentences.length > 0);
}

export function getMetadata() {
  return idiomsData.metadata;
}
