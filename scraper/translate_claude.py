"""
Claude API를 사용한 고품질 성어 한국어 번역
두 가지 번역:
1. meaning_ko_direct: 성어의 직역 (글자 그대로의 뜻)
2. meaning_ko: 성어의 의역/설명 (의미 풀이)
"""

import json
import os
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")
sys.stdout = open(sys.stdout.fileno(), mode="w", encoding="utf-8", buffering=1)

import anthropic

API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "web", "data", "idioms.json")
BATCH_SIZE = 20  # idioms per API call


def build_prompt(batch: list[dict]) -> str:
    """Build a prompt for batch translation."""
    items = []
    for item in batch:
        items.append(f'- {item["idiom"]} (pinyin: {item["pinyin"]}): {item["meaning_zh"]}')

    return f"""다음 중국어 성어(成语)들을 한국어로 번역해 주세요.

각 성어마다 두 가지 번역을 제공해 주세요:
1. **direct**: 성어 글자의 직역 (예: 逆水行舟 → "물을 거슬러 배를 젓다")
2. **explain**: 성어의 뜻/의미 풀이를 자연스러운 한국어로 (예: "노력하지 않으면 뒤처진다는 비유")

규칙:
- 존댓말이 아닌 설명체로 작성 (~한다, ~이다, ~를 뜻한다)
- "~하십시오", "~하세요" 같은 명령형은 사용하지 마세요
- 간결하게 1~2문장으로
- 기독교 용어(목사, 교회 등) 대신 일반적인 용어 사용
- JSON 배열로 반환: [{{"idiom": "...", "direct": "...", "explain": "..."}}]

성어 목록:
{chr(10).join(items)}

JSON 배열만 반환하세요 (마크다운 코드블록 없이):"""


def translate_batch(client: anthropic.Anthropic, batch: list[dict]) -> list[dict]:
    """Translate a batch using Claude API."""
    prompt = build_prompt(batch)

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    # Remove markdown code block if present
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

    try:
        results = json.loads(text)
        return results
    except json.JSONDecodeError as e:
        print(f"  [JSON ERROR] {e}")
        print(f"  Response: {text[:200]}")
        return []


def run():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    idioms = data["idioms"]
    total = len(idioms)
    print(f"Total idioms: {total}")

    client = anthropic.Anthropic(api_key=API_KEY)

    done = 0
    errors = 0

    for batch_start in range(0, total, BATCH_SIZE):
        batch = idioms[batch_start : batch_start + BATCH_SIZE]
        batch_items = [{"idiom": i["idiom"], "pinyin": i["pinyin"], "meaning_zh": i["meaning_zh"]} for i in batch]

        try:
            results = translate_batch(client, batch_items)

            # Map results back
            result_map = {r["idiom"]: r for r in results}
            for item in batch:
                if item["idiom"] in result_map:
                    r = result_map[item["idiom"]]
                    item["meaning_ko_direct"] = r.get("direct", "")
                    item["meaning_ko"] = r.get("explain", item.get("meaning_ko", ""))
                else:
                    errors += 1

            done += len(batch)
            print(f"  [{done}/{total}] Batch {batch_start // BATCH_SIZE + 1} - {len(results)} translated")

        except Exception as e:
            errors += len(batch)
            done += len(batch)
            print(f"  [{done}/{total}] ERROR: {e}")

        # Rate limit
        if batch_start + BATCH_SIZE < total:
            time.sleep(0.5)

    # Save
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone! {total} idioms processed, {errors} errors")

    # Show samples
    print("\nSamples:")
    for item in idioms[:10]:
        print(f"  {item['idiom']}")
        print(f"    직역: {item.get('meaning_ko_direct', '?')}")
        print(f"    의역: {item.get('meaning_ko', '?')}")
        print()


if __name__ == "__main__":
    run()
