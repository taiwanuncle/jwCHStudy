"""
성어 한국어 번역 스크립트
meaning_zh (중국어 설명) → meaning_ko (한국어 뜻)
Google Translate API를 통해 번역
"""

import json
import os
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")
# Force unbuffered output
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

from deep_translator import GoogleTranslator

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "web", "data", "idioms.json")
BATCH_SIZE = 20  # 한 번에 번역할 개수
DELAY = 1.0  # 배치 간 대기 시간


def translate_batch(texts: list[str]) -> list[str]:
    """여러 텍스트를 한꺼번에 번역."""
    translator = GoogleTranslator(source="zh-CN", target="ko")
    results = []
    for text in texts:
        try:
            translated = translator.translate(text)
            results.append(translated if translated else "")
        except Exception as e:
            print(f"  [ERROR] {text[:20]}: {e}")
            results.append("")
    return results


def make_short_meaning(idiom: str, meaning_zh: str) -> str:
    """번역할 텍스트를 간결하게 준비."""
    # 너무 긴 설명은 앞부분만
    if len(meaning_zh) > 80:
        # 첫 문장만 사용
        for sep in ["。", "；", "，"]:
            idx = meaning_zh.find(sep)
            if idx > 10:
                meaning_zh = meaning_zh[:idx]
                break
        else:
            meaning_zh = meaning_zh[:80]
    return meaning_zh


def run():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    idioms = data["idioms"]
    total = len(idioms)

    # 이미 번역된 것 스킵
    to_translate = [(i, item) for i, item in enumerate(idioms) if not item.get("meaning_ko")]
    print(f"Total: {total}, Need translation: {len(to_translate)}")

    if not to_translate:
        print("All already translated!")
        return

    done = 0
    for batch_start in range(0, len(to_translate), BATCH_SIZE):
        batch = to_translate[batch_start:batch_start + BATCH_SIZE]
        texts = [make_short_meaning(item["idiom"], item["meaning_zh"]) for _, item in batch]

        translations = translate_batch(texts)

        for (idx, item), ko in zip(batch, translations):
            idioms[idx]["meaning_ko"] = ko

        done += len(batch)
        print(f"  [{done}/{len(to_translate)}] Translated batch {batch_start // BATCH_SIZE + 1}")

        if batch_start + BATCH_SIZE < len(to_translate):
            time.sleep(DELAY)

    # 저장
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    translated_count = sum(1 for i in idioms if i.get("meaning_ko"))
    print(f"\nDone! {translated_count}/{total} idioms now have Korean meaning")

    # 샘플 출력
    print("\nSamples:")
    for item in idioms[:10]:
        print(f"  {item['idiom']} → {item.get('meaning_ko', '?')}")


if __name__ == "__main__":
    run()
