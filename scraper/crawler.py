"""
파수대(守望台) 중국어 간체 기사 크롤러
- Publication API로 기사 documentId 목록 수집
- WOL Article API로 기사 전문 가져오기
"""

import json
import os
import time
import requests
from bs4 import BeautifulSoup

PUB_API = "https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS"
WOL_API = "https://wol.jw.org/wol/d/r23/lp-chs"

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "articles")
os.makedirs(DATA_DIR, exist_ok=True)

# 파수대 연구판 Issue 코드 생성 (격월: 1,3,5,7,9,11)
def generate_issue_codes(start_year=2020, end_year=2026, end_month=3):
    codes = []
    for year in range(start_year, end_year + 1):
        for month in [1, 3, 5, 7, 9, 11]:
            if year == end_year and month > end_month:
                break
            codes.append(f"{year}{month:02d}")
    return codes


def fetch_article_ids(issue_code: str) -> list[dict]:
    """Publication API로 해당 호의 기사 documentId 목록을 가져온다."""
    params = {
        "langwritten": "CHS",
        "pub": "w",
        "issue": issue_code,
        "output": "json",
    }
    try:
        resp = requests.get(PUB_API, params=params, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  [ERROR] Issue {issue_code} fetch failed: {e}")
        return []

    articles = []
    files = data.get("files", {})
    # files 구조: { "CHS": { "MP3": [...], "PDF": [...], ... } }
    for lang_key, formats in files.items():
        if not isinstance(formats, dict):
            continue
        for fmt_key, file_list in formats.items():
            if not isinstance(file_list, list):
                continue
            for item in file_list:
                doc_id = item.get("docid")
                title = item.get("title", "")
                track = item.get("track")
                if doc_id and doc_id not in [a["docid"] for a in articles]:
                    articles.append({
                        "docid": doc_id,
                        "title": title,
                        "track": track,
                        "issue": issue_code,
                    })
    return articles


def fetch_article_content(doc_id: int) -> dict | None:
    """WOL Article API로 기사 전문(HTML)을 가져온다."""
    url = f"{WOL_API}/{doc_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"  [ERROR] Article {doc_id} fetch failed: {e}")
        return None

    # JSON 응답에서 items 또는 직접 content 추출
    items = data.get("items", [data]) if isinstance(data, dict) else data
    if isinstance(items, list) and len(items) > 0:
        item = items[0] if isinstance(items[0], dict) else {}
    else:
        item = data if isinstance(data, dict) else {}

    content_html = item.get("content", "")
    title_raw = item.get("title", "")

    # title에서 HTML 태그 제거
    title = BeautifulSoup(title_raw, "html.parser").get_text(strip=True)

    # HTML → 순수 텍스트
    soup = BeautifulSoup(content_html, "html.parser")
    text = soup.get_text(separator="\n", strip=True)

    return {
        "docid": doc_id,
        "title": title,
        "content_html": content_html,
        "content_text": text,
        "url": item.get("url", ""),
        "reference": item.get("reference", ""),
        "publicationTitle": item.get("publicationTitle", ""),
    }


def crawl_issue(issue_code: str) -> list[dict]:
    """한 호의 모든 기사를 크롤링한다."""
    print(f"\n=== Issue {issue_code} ===")

    # 이미 크롤링된 파일이 있으면 스킵
    out_file = os.path.join(DATA_DIR, f"w_{issue_code}.json")
    if os.path.exists(out_file):
        print(f"  [SKIP] Already crawled: {out_file}")
        with open(out_file, "r", encoding="utf-8") as f:
            return json.load(f)

    article_ids = fetch_article_ids(issue_code)
    print(f"  Found {len(article_ids)} article IDs")

    articles = []
    for i, art_info in enumerate(article_ids):
        doc_id = art_info["docid"]
        print(f"  [{i+1}/{len(article_ids)}] Fetching article {doc_id}: {art_info['title']}")
        content = fetch_article_content(doc_id)
        if content:
            content["issue"] = issue_code
            articles.append(content)
        time.sleep(0.5)  # API 부하 방지

    # 저장
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f"  Saved {len(articles)} articles to {out_file}")

    return articles


def crawl_all(start_year=2020, end_year=2026, end_month=3):
    """전체 기간 크롤링."""
    issues = generate_issue_codes(start_year, end_year, end_month)
    print(f"Total issues to crawl: {len(issues)}")
    print(f"Issues: {issues}")

    all_articles = []
    for issue in issues:
        articles = crawl_issue(issue)
        all_articles.extend(articles)
        time.sleep(1)  # 호 간 대기

    print(f"\n=== COMPLETE ===")
    print(f"Total articles crawled: {len(all_articles)}")
    return all_articles


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # 테스트: 2024년 1월호만
        crawl_issue("202401")
    else:
        crawl_all()
