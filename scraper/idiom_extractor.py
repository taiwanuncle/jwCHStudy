"""
파수대 기사에서 중국어 성어(成语)/관용어 추출기
- 성어 사전 매칭
- 원문 문장 컨텍스트 추출
- 한국어 뜻 매핑 (기본 중국어 설명 포함)
"""

import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ARTICLES_DIR = os.path.join(DATA_DIR, "articles")
DICT_PATH = os.path.join(os.path.dirname(__file__), "chengyu_dict.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "idioms.json")


def load_chengyu_dict() -> dict[str, dict]:
    """성어 사전을 로드하여 {성어: 정보} 딕셔너리로 반환."""
    with open(DICT_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    return {item["word"]: item for item in raw}


def clean_text(text: str) -> str:
    """텍스트에서 병음(pinyin) 주석 및 불필요한 문자를 제거."""
    # 병음 패턴 제거 (중국어 글자 뒤에 오는 소문자 라틴 문자열)
    # 예: "你Nǐ的de回答huídá" → "你的回答"
    # 성조 표시가 있는 라틴 문자 포함
    pinyin_chars = r'[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]'
    # 중국어 글자 뒤에 바로 오는 병음 제거
    text = re.sub(
        r'([\u4e00-\u9fff])(' + pinyin_chars + r'+)',
        r'\1',
        text
    )
    return text


def split_sentences(text: str) -> list[str]:
    """텍스트를 문장 단위로 분리."""
    # 중국어 문장 부호로 분리
    sentences = re.split(r'[。！？\n]+', text)
    return [s.strip() for s in sentences if len(s.strip()) >= 4]


def extract_idioms_from_article(article: dict, chengyu_dict: dict) -> list[dict]:
    """한 기사에서 성어를 찾아 컨텍스트와 함께 반환."""
    text = article.get("content_text", "")
    if not text:
        return []

    # 텍스트 정리
    cleaned = clean_text(text)
    sentences = split_sentences(cleaned)

    found = []
    seen_idioms = set()

    for sentence in sentences:
        for idiom, info in chengyu_dict.items():
            if idiom in sentence and idiom not in seen_idioms:
                seen_idioms.add(idiom)
                found.append({
                    "idiom": idiom,
                    "pinyin": info.get("pinyin", ""),
                    "explanation": info.get("explanation", ""),
                    "sentence": sentence,
                    "article_title": clean_text(
                        re.sub(r'<[^>]+>', '', article.get("title", ""))
                    ),
                    "issue": article.get("issue", ""),
                    "docid": article.get("docid", 0),
                    "publicationTitle": article.get("publicationTitle", ""),
                })

    return found


def format_issue_label(issue_code: str) -> str:
    """Issue 코드를 읽기 쉬운 형식으로 변환. 예: '202401' → '2024年1月'"""
    if len(issue_code) == 6:
        year = issue_code[:4]
        month = int(issue_code[4:])
        return f"{year}年{month}月"
    return issue_code


def assign_difficulty(idiom: str, explanation: str) -> int:
    """성어 난이도 추정 (1=쉬움, 2=보통, 3=어려움)."""
    # 일상적으로 자주 쓰이는 성어 → 1
    common = {
        "一心一意", "自言自语", "各种各样", "全心全意", "同心协力",
        "不知不觉", "不由自主", "心甘情愿", "理所当然", "一如既往",
        "毫无疑问", "千方百计", "独一无二", "与众不同", "迫不及待",
        "一模一样", "坚定不移", "毫不犹豫", "不计其数", "千千万万",
    }
    if idiom in common:
        return 1
    # 4자 이하 → 1, 4자 → 2, 그 이상 → 3
    if len(idiom) <= 3:
        return 1
    if len(idiom) == 4:
        return 2
    return 3


def run_extraction():
    """전체 추출 실행."""
    print("Loading chengyu dictionary...")
    chengyu_dict = load_chengyu_dict()
    print(f"  Loaded {len(chengyu_dict)} idioms")

    # 모든 기사 파일 로드
    article_files = sorted([
        f for f in os.listdir(ARTICLES_DIR)
        if f.endswith(".json")
    ])
    print(f"\nFound {len(article_files)} article files")

    all_found = {}  # idiom → merged info

    for fname in article_files:
        filepath = os.path.join(ARTICLES_DIR, fname)
        with open(filepath, "r", encoding="utf-8") as f:
            articles = json.load(f)

        issue = fname.replace("w_", "").replace(".json", "")
        print(f"\n  Processing {fname} ({len(articles)} articles)...")

        for article in articles:
            found = extract_idioms_from_article(article, chengyu_dict)
            for item in found:
                idiom = item["idiom"]
                if idiom not in all_found:
                    all_found[idiom] = {
                        "id": f"chengyu_{len(all_found)+1:04d}",
                        "idiom": idiom,
                        "pinyin": item["pinyin"],
                        "meaning_zh": item["explanation"],
                        "meaning_ko": "",  # 나중에 매핑
                        "category": "成语",
                        "difficulty": assign_difficulty(idiom, item["explanation"]),
                        "source_sentences": [],
                    }
                # 출처 문장 추가 (최대 5개)
                if len(all_found[idiom]["source_sentences"]) < 5:
                    all_found[idiom]["source_sentences"].append({
                        "text": item["sentence"],
                        "article": item["article_title"],
                        "issue": format_issue_label(item["issue"]),
                        "documentId": item["docid"],
                    })

    # 결과 정리
    idioms_list = sorted(all_found.values(), key=lambda x: x["id"])

    output = {
        "metadata": {
            "source": "守望台/警醒! (Watchtower/Awake!)",
            "language": "zh-Hans (简体中文)",
            "period": "2016~2026",
            "total_idioms": len(idioms_list),
            "extracted_date": __import__("datetime").datetime.now().isoformat(),
        },
        "idioms": idioms_list,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n=== EXTRACTION COMPLETE ===")
    print(f"Total unique idioms found: {len(idioms_list)}")
    print(f"Output saved to: {OUTPUT_PATH}")

    # Top 10 출력
    print(f"\nTop 10 idioms:")
    for item in idioms_list[:10]:
        n = len(item["source_sentences"])
        print(f"  {item['idiom']} ({item['pinyin']}) - {n} occurrences")


if __name__ == "__main__":
    run_extraction()
