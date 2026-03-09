"""
성어 한국어 번역 개선 스크립트
1. meaning_zh에서 글자별 정의(字释) 제거
2. 핵심 의미만 추출하여 재번역
3. 후처리로 번역 품질 개선
"""

import json
import os
import sys
import time
import re

sys.stdout.reconfigure(encoding="utf-8")
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

from deep_translator import GoogleTranslator

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "web", "data", "idioms.json")
BATCH_SIZE = 20
DELAY = 1.0


def clean_meaning_zh(idiom_str: str, meaning_zh: str) -> str:
    """Remove character-by-character definitions from the beginning of meaning_zh.

    Chinese dictionary format often starts with individual character explanations:
    e.g., "策办法。遇到问题..." → "遇到问题..."
    e.g., "集集中；思思考，意见；广扩大。指集中群众..." → "指集中群众..."
    """
    idiom_chars = set(idiom_str.replace("，", "").replace(" ", "").replace("、", ""))
    cleaned = meaning_zh

    # Strip numbered markers like ①②
    cleaned = re.sub(r'^[①②③④⑤]+', '', cleaned)

    # Iteratively remove char definitions from the start
    max_iterations = 10
    for _ in range(max_iterations):
        if not cleaned or cleaned[0] not in idiom_chars:
            break

        # Find the first separator
        best_sep = -1
        for sep in ["。", "；", "，"]:
            pos = cleaned.find(sep, 1)
            if pos > 0:
                if best_sep < 0 or pos < best_sep:
                    best_sep = pos

        if best_sep < 0:
            break

        # Only strip if it's a short definition (char + 1-4 chars + separator)
        definition_part = cleaned[1:best_sep]
        if len(definition_part) <= 4:
            cleaned = cleaned[best_sep + 1:]
        else:
            break

    # If we stripped everything or result is too short, use original
    if len(cleaned) < 4:
        cleaned = meaning_zh

    # Remove remaining char definition fragments at the start
    # Pattern: single leftover short words like "足。" at the start
    while cleaned and len(cleaned) > 4:
        match = re.match(r'^[\u4e00-\u9fff]{1,2}[。；]', cleaned)
        if match and match.end() < len(cleaned):
            cleaned = cleaned[match.end():]
        else:
            break

    return cleaned.strip()


def build_translation_text(idiom_str: str, cleaned_meaning: str) -> str:
    """Build better text for translation by providing context."""
    # For short meanings, add the idiom as context
    # Format: "idiom: meaning" gives better results than just "meaning"
    text = cleaned_meaning

    # Remove trailing incomplete sentences
    if text and text[-1] not in ["。", "！", "？", ".", "!", "?"]:
        # Find last complete sentence
        for sep in ["。", "；"]:
            last = text.rfind(sep)
            if last > 0:
                text = text[:last + 1]
                break

    # Truncate if too long
    if len(text) > 80:
        for sep in ["。", "；", "，"]:
            idx = text.find(sep, 20)
            if 20 < idx < 80:
                text = text[:idx]
                break
        else:
            text = text[:80]

    return text


def post_process_korean(ko: str) -> str:
    """Fix common Google Translate issues in Korean."""
    if not ko:
        return ko

    # Remove imperative endings and make declarative
    # "~하십시오" → "~하다" style
    ko = ko.replace("하십시오.", "한다.")
    ko = ko.replace("하십시오", "한다")
    ko = ko.replace("마십시오.", "않는다.")
    ko = ko.replace("마십시오", "않는다")

    # Remove "~하세요" patterns (too casual/imperative)
    ko = re.sub(r'하세요\.?$', '하는 것을 뜻한다.', ko)

    # Clean up spacing
    ko = re.sub(r'\s+', ' ', ko).strip()

    # Remove trailing period duplication
    ko = re.sub(r'\.+$', '.', ko)

    return ko


def translate_batch(texts: list[str]) -> list[str]:
    """Translate a batch of texts."""
    translator = GoogleTranslator(source="zh-CN", target="ko")
    results = []
    for text in texts:
        try:
            translated = translator.translate(text)
            if translated:
                translated = post_process_korean(translated)
            results.append(translated if translated else "")
        except Exception as e:
            print(f"  [ERROR] {text[:20]}: {e}")
            results.append("")
    return results


def run():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    idioms = data["idioms"]
    total = len(idioms)

    # Prepare all items for retranslation
    items_to_translate = []
    for i, item in enumerate(idioms):
        cleaned = clean_meaning_zh(item["idiom"], item["meaning_zh"])
        trans_text = build_translation_text(item["idiom"], cleaned)
        items_to_translate.append((i, item, trans_text))

    print(f"Total: {total}, Retranslating all with improved method")

    done = 0
    for batch_start in range(0, len(items_to_translate), BATCH_SIZE):
        batch = items_to_translate[batch_start:batch_start + BATCH_SIZE]
        texts = [trans_text for _, _, trans_text in batch]

        translations = translate_batch(texts)

        for (idx, item, _), ko in zip(batch, translations):
            if ko:  # Only update if we got a valid translation
                idioms[idx]["meaning_ko"] = ko

        done += len(batch)
        progress = done / len(items_to_translate) * 100
        print(f"  [{done}/{len(items_to_translate)}] ({progress:.0f}%) Batch {batch_start // BATCH_SIZE + 1}")

        if batch_start + BATCH_SIZE < len(items_to_translate):
            time.sleep(DELAY)

    # Save
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone! All {total} idioms retranslated.")

    # Show samples
    print("\nSamples (idiom → cleaned_zh → ko):")
    for item in idioms[:15]:
        cleaned = clean_meaning_zh(item["idiom"], item["meaning_zh"])
        print(f"  {item['idiom']}")
        print(f"    ZH: {cleaned[:50]}")
        print(f"    KO: {item.get('meaning_ko', '?')[:50]}")
        print()


if __name__ == "__main__":
    run()
