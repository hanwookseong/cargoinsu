#!/usr/bin/env python3
"""rss.xml 생성기 (n2nib.com / cargoinsu.com 공용).

sitemap.xml 의 <loc>·<lastmod> 를 기준으로 가이드·사례·상품 중 최근 수정분 N건을
RSS 2.0 으로 만든다. 제목·설명은 각 페이지의 <title>·meta description 에서 읽는다.
noindex 페이지는 제외한다.

사용법 (저장소 루트에서):  python tools/build_rss.py n2nib.com
                           python tools/build_rss.py cargoinsu.com
sitemap.xml 을 갱신한 뒤 함께 실행하고 rss.xml 을 같이 커밋한다.
"""
import html, os, re, sys
from datetime import datetime, timezone, timedelta
from email.utils import format_datetime

SITES = {
    'n2nib.com': dict(title='엔투엔보험중개 — 기업보험 가이드·사례·상품', brand=' | 엔투엔보험중개',
                      desc='엔투엔보험중개(금융감독원 등록 제2026-012201호)의 기업보험 가이드, 사례, 상품 안내 최근 수정분',
                      include=r'^/(guide-[^/]+|insights/[^/]+|products/[^/]+|am-best)$'),
    'cargoinsu.com': dict(title='cargoinsu — 화물·예술품·귀금속 보험 가이드·사례', brand=' | cargoinsu',
                          desc='엔투엔보험중개가 운영하는 cargoinsu의 화물·예술품·귀금속 보험 가이드, 사례, 상품 안내 최근 수정분',
                          include=r'^/(guide/[^/]+|insights/[^/]+|products/[^/]+)$'),
}
LIMIT = 50
KST = timezone(timedelta(hours=9))


def page_file(path):
    p = path.strip('/')
    for c in (p, p + '.html', p + '/index.html'):
        if c and os.path.isfile(c):
            return c
    return None


def main(host):
    cfg = SITES[host]
    sm = open('sitemap.xml', encoding='utf-8').read()
    rows = []
    for blk in re.findall(r'<url>.*?</url>', sm, re.S):
        loc = re.search(r'<loc>([^<]+)</loc>', blk).group(1).strip()
        lm = re.search(r'<lastmod>([^<]+)</lastmod>', blk)
        path = re.sub(r'^https://[^/]+', '', loc)
        if path.endswith('/index.html'):
            continue
        if not re.match(cfg['include'], path.replace('.html', '')):
            continue
        f = page_file(path)
        if not f:
            continue
        s = open(f, encoding='utf-8').read()
        if re.search(r'<meta name="robots" content="[^"]*noindex', s):
            continue
        t = re.search(r'<title>(.*?)</title>', s, re.S)
        d = re.search(r'<meta name="description" content="([^"]*)"', s)
        title = html.unescape(t.group(1).strip()) if t else path
        for b in (cfg['brand'], ' | cargoinsu.com', ' | 엔투엔보험중개'):
            title = title.replace(b, '')
        rows.append(((lm.group(1)[:10] if lm else '2026-01-01'), loc, title,
                     html.unescape(d.group(1)) if d else ''))
    rows.sort(key=lambda r: (r[0], r[1]), reverse=True)
    rows = rows[:LIMIT]
    now = format_datetime(datetime.now(KST).replace(microsecond=0))
    items = []
    for day, loc, title, desc in rows:
        pub = format_datetime(datetime.strptime(day, '%Y-%m-%d').replace(hour=9, tzinfo=KST))
        items.append(
            '  <item>\n'
            f'    <title>{html.escape(title, quote=False)}</title>\n'
            f'    <link>{loc}</link>\n'
            f'    <guid isPermaLink="true">{loc}</guid>\n'
            f'    <description>{html.escape(desc, quote=False)}</description>\n'
            f'    <pubDate>{pub}</pubDate>\n'
            '  </item>')
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n'
           f'  <title>{html.escape(cfg["title"], quote=False)}</title>\n'
           f'  <link>https://{host}/</link>\n'
           f'  <description>{html.escape(cfg["desc"], quote=False)}</description>\n'
           '  <language>ko</language>\n'
           f'  <lastBuildDate>{now}</lastBuildDate>\n'
           f'  <atom:link href="https://{host}/rss.xml" rel="self" type="application/rss+xml"/>\n'
           + '\n'.join(items) + '\n</channel>\n</rss>\n')
    with open('rss.xml', 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(xml)
    print(f'rss.xml: {len(items)} items')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'n2nib.com')
