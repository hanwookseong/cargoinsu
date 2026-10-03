#!/usr/bin/env python3
"""cargoinsu 검색 인덱스 생성기 → assets/search-index.js

국문 상품·가이드·사례 페이지의 <title>·meta description·h1·meta keywords 를 읽어
window.CARGO_SEARCH_INDEX 로 내보낸다. 페이지를 추가·수정한 뒤 저장소 루트에서 실행:
    python tools/build_search_index.py
"""
import glob, html, json, re

# 상품별 검색 동의어 (사용자가 실제로 입력할 만한 말)
SYN = {
    'products/marine-cargo.html': '적하 적하보험 수출 수입 해상 항공 화물보험 ICC 인코텀즈 CIF 컨테이너 제주 카페리 즉시계산 견적',
    'products/marine-transit.html': '운송보험 국내운송 국내운송보험 운송 화물 이동',
    'products/inland-transit.html': '내륙운송 육상운송 육상운송보험 트럭 국내 화물 공장 이전 장비 운반',
    'products/open-policy.html': '포괄 포괄보험 연간 오픈커버 open cover 정기화주 포괄계약 연간 적하보험',
    'products/specialty-art.html': '예술품 미술품 그림 작품 전시 갤러리 미술관 fine art 파인아트 조각 약정가액 wall to wall',
    'products/jewellers-block.html': '보석 귀금속 시계 명품 다이아몬드 금 jewellers block 주얼러스블록 고급재화 위탁 memo',
    'products/carriers-liability.html': '적재물 적재물배상 화물차 운송사 운송사업자 주선 화물배상 의무보험 과태료',
    'products/liability-freight-forwarders.html': '포워더 FFL 운송주선 국제물류주선 화물배상책임 NVOCC 주선인',
    'guide/carrier-claims.html': '적재물 사고 보험처리 청구서류 보험금 청구 화물 파손 도난 손해사정 합의 운송사 주선',
    'guide/jewelry-watch.html': '귀금속 시계 명품시계 보석 택배 특송 분실 미수령',
    'guide/fine-art-individual.html': '개인 컬렉터 작가 개인명의 미술품',
    'guide/incoterms.html': '인코텀즈 FOB CIF EXW DAP 무역조건',
    'guide/clauses.html': '약관 ICC A B C 전위험 분손',
    'guide/claims.html': '사고 청구 보상 클레임 사고처리 서류',
    'guide/period.html': '보험기간 담보기간 창고 간 warehouse',
    'guide/marine-cargo.html': '적하 적하보험 기초 가이드',
}
# 대표 검색어 — 검색어가 이 목록과 정확히 같으면(공백 무시) 해당 페이지를 최상단에 올린다.
# 모호한 말(예: "화물배상" — 적재물/FFL 양쪽)은 넣지 않는다.
BOOST = {
    'products/marine-cargo.html': ['적하보험', '적하', '해상적하보험', '해상적하', '수출적하보험', '수입적하보험', '수출입적하보험', '화물보험', '해상보험', '항공화물보험', '항공적하보험', '적하보험료', '적하보험견적', 'icc', 'cif보험', 'marine cargo', 'cargo insurance'],
    'products/marine-transit.html': ['운송보험', '국내운송보험', '운송화물보험'],
    'products/inland-transit.html': ['내륙운송', '내륙운송보험', '육상운송보험', '트럭화물보험', '장비운반보험', '공장이전보험', '도로운송보험'],
    'products/open-policy.html': ['포괄보험', '오픈커버', 'opencover', 'open policy', '연간적하보험', '포괄계약', '적하포괄보험', '포괄적하보험'],
    'products/specialty-art.html': ['예술품보험', '예술품', '미술품보험', '미술품', '작품보험', '전시미술품보험', 'fineart', '갤러리보험', '미술관보험'],
    'products/jewellers-block.html': ['보석보험', '보석', '귀금속보험', '귀금속', '시계보험', '명품보험', '주얼러스블록', 'jewellersblock', "jeweller'sblock"],
    'products/carriers-liability.html': ['적재물배상', '적재물배상책임보험', '적재물보험', '적재물', '적재물배상보험', '화물차보험', '운송사보험', '적재물배상의무'],
    'products/liability-freight-forwarders.html': ['ffl', '포워더보험', '포워더배상책임', '포워더', '화물배상책임보험', '운송주선인배상책임', '운송주선업자배상책임', 'nvocc'],
}
CAT = [('products/', '상품'), ('guide/', '가이드'), ('insights/', '사례')]
BRANDS = [' | cargoinsu.com', ' | cargoinsu', ' | 현장에서 본 화물보험', ' — cargoinsu.com']


def clean(t):
    t = html.unescape(re.sub(r'<[^>]+>', ' ', t or ''))
    return re.sub(r'\s+', ' ', t).strip()


def main():
    files = sorted(glob.glob('products/*.html') + glob.glob('guide/*.html') + glob.glob('insights/*.html')) + ['about.html', 'am-best.html']
    out = []
    for f in files:
        if f.endswith('index.html'):
            continue
        s = open(f, encoding='utf-8').read()
        if re.search(r'<meta name="robots" content="[^"]*noindex', s):
            continue
        title = clean((re.search(r'<title>(.*?)</title>', s, re.S) or [None, ''])[1])
        for b in BRANDS:
            title = title.replace(b, '')
        h1 = clean((re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S) or [None, ''])[1])
        desc = clean((re.search(r'<meta name="description" content="([^"]*)"', s) or [None, ''])[1])
        kw = clean((re.search(r'<meta name="keywords" content="([^"]*)"', s) or [None, ''])[1])
        cat = next((c for p, c in CAT if f.startswith(p)), '안내')
        out.append({
            't': title, 'u': '/' + f, 'c': cat,
            'd': desc[:160],
            'k': ' '.join(x for x in [h1, kw.replace(',', ' '), SYN.get(f, '')] if x),
        })
        if BOOST.get(f):
            out[-1]['b'] = BOOST[f]
    js = ('/* 자동 생성 — tools/build_search_index.py. 직접 수정하지 마세요. */\n'
          'window.CARGO_SEARCH_INDEX = ' + json.dumps(out, ensure_ascii=False, indent=0) + ';\n')
    open('assets/search-index.js', 'w', encoding='utf-8', newline='\n').write(js)
    print(f'assets/search-index.js: {len(out)} pages')


if __name__ == '__main__':
    main()
