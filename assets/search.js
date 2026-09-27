/* ============================================================
   cargoinsu.com — GNB 상품·키워드 검색
   - 인덱스: /assets/search-index.js (tools/build_search_index.py 로 생성)
   - 페이지 마크업을 고치지 않고, 메뉴 구조를 찾아 검색창을 주입
     1) .gnb-search-li 자리표시가 있으면 그 안에
     2) .navi_wrap .gnb > ul 이 있으면 마지막 항목 뒤에
     3) .nav .nav__right 가 있으면 그 앞에
   - cargoinsu에 없는 종목은 n2nib.com 검색(110여 종)으로 연결
   ============================================================ */
(function () {
  'use strict';
  if (location.pathname.indexOf('/en/') === 0) return; // 국문 전용

  var CSS = [
    '.cg-search{position:relative}',
    '.cg-search input[type=search]{width:190px;padding:8px 12px 8px 32px;font:inherit;font-size:.84rem;color:#1F1F1B;',
    'background:#EAE4D6 url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236B6B67\' stroke-width=\'2.2\'%3E%3Ccircle cx=\'11\' cy=\'11\' r=\'7\'/%3E%3Cpath d=\'m20 20-3.5-3.5\'/%3E%3C/svg%3E") no-repeat 10px center;',
    'background-size:15px;border:1px solid rgba(31,31,27,.12);border-radius:3px;outline:0;transition:width .2s,background-color .2s,border-color .2s}',
    '.cg-search input[type=search]:focus{width:260px;background-color:#fff;border-color:#C9A24B}',
    '.cg-search input[type=search]::placeholder{color:#6B6B67;font-size:.8rem}',
    '.cg-search-dd{display:none;position:absolute;top:calc(100% + 8px);right:0;width:440px;max-width:92vw;max-height:70vh;overflow-y:auto;',
    'background:#fff;border:1px solid rgba(31,31,27,.15);border-radius:3px;box-shadow:0 8px 28px rgba(11,40,24,.18);z-index:1000;text-align:left}',
    '.cg-search-dd.open{display:block}',
    '.cg-sr{display:block;padding:12px 16px;border-bottom:1px solid rgba(31,31,27,.08);text-decoration:none!important;color:#1F1F1B!important}',
    '.cg-sr:hover,.cg-sr.active{background:#F4F0E8}',
    '.cg-sr-c{display:inline-block;font-size:.66rem;font-weight:700;letter-spacing:.06em;color:#8a6d1f;border:1px solid rgba(201,162,75,.5);padding:1px 6px;border-radius:2px;margin-bottom:5px}',
    '.cg-sr-t{font-size:.94rem;font-weight:700;line-height:1.45;color:#0B2818}',
    '.cg-sr-d{font-size:.8rem;line-height:1.55;color:#5a5a55;margin:3px 0 0}',
    '.cg-sr mark{background:rgba(201,162,75,.28);color:inherit;padding:0 1px}',
    '.cg-sr-more,.cg-sr-empty{display:block;padding:12px 16px;font-size:.84rem;color:#0B2818!important;background:#FAF8F3}',
    '.cg-sr-more{font-weight:700;text-decoration:none!important}',
    '.cg-sr-empty a{color:#A8581F;font-weight:700}',
    '@media (max-width:780px){.gnb>ul>li.gnb-search-li.cg-has-search{display:block!important;order:-1;padding:14px 16px 6px!important;margin:0!important;border:0!important;background:transparent!important}}',
    '@media (max-width:900px){.cg-search input[type=search]{width:100%}.cg-search input[type=search]:focus{width:100%}.cg-search-dd{position:static;width:auto;max-width:none;margin-top:6px;box-shadow:none}}'
  ].join('');

  function esc(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s || '').toLowerCase().replace(/[\s\-_·,()&/]/g, ''); }
  function toks(s) { return String(s || '').toLowerCase().split(/[\s\-_·,()/]+/).filter(function (x) { return x.length > 0; }); }

  function score(p, q) {
    var qn = norm(q); if (!qn) return 0;
    var t = norm(p.t), k = norm(p.k), d = norm(p.d), s = 0;
    if (t === qn) s += 100; else if (t.indexOf(qn) > -1) s += 50;
    if (k.indexOf(qn) > -1) s += 20;
    if (d.indexOf(qn) > -1) s += 6;
    var ts = toks(q);
    if (ts.length > 1) {
      var all = t + ' ' + k + ' ' + d;
      var hit = ts.filter(function (x) { return all.indexOf(norm(x)) > -1; }).length;
      s = hit === ts.length ? s + 25 : s * (hit / ts.length) + hit * 4;
    }
    if (s > 0 && p.c === '상품') s += 5;
    return s;
  }
  function search(q) {
    var idx = window.CARGO_SEARCH_INDEX || [];
    return idx.map(function (p) { return { p: p, s: score(p, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 8);
  }
  function hl(text, q) {
    var out = esc(text);
    toks(q).filter(function (t) { return t.length > 1; }).forEach(function (t) {
      out = out.replace(new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    });
    return out;
  }
  function n2nibUrl(q) { return 'https://n2nib.com/search?q=' + encodeURIComponent(q); }

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'cg-search';
    wrap.innerHTML = '<input type="search" id="cgSearchInput" placeholder="상품·키워드 검색…" autocomplete="off" aria-label="cargoinsu 상품·키워드 검색">' +
      '<div class="cg-search-dd" id="cgSearchDd" role="listbox"></div>';
    return wrap;
  }

  function mount() {
    if (document.getElementById('cgSearchInput')) return null;
    var box = build();
    var slot = document.querySelector('.gnb-search-li');
    if (slot) { slot.classList.add('cg-has-search'); slot.appendChild(box); return box; }
    var ul = document.querySelector('.navi_wrap .gnb > ul');
    if (ul) {
      var li = document.createElement('li');
      li.className = 'gnb-search-li cg-has-search';
      li.style.cssText = 'margin-left:auto;flex:0 0 auto;align-self:center;';
      li.appendChild(box); ul.appendChild(li); return box;
    }
    var right = document.querySelector('.nav .nav__right');
    if (right) { box.style.marginRight = '12px'; right.parentNode.insertBefore(box, right); return box; }
    return null;
  }

  function init() {
    var box = mount(); if (!box) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var input = box.querySelector('input'), dd = box.querySelector('.cg-search-dd');
    var timer, results = [], active = -1;

    function render() {
      var q = input.value.trim();
      if (!q) { dd.classList.remove('open'); dd.innerHTML = ''; return; }
      results = search(q); active = -1;
      var html;
      if (!results.length) {
        html = '<div class="cg-sr-empty">cargoinsu에서 찾지 못했습니다. <a href="' + n2nibUrl(q) + '">n2nib.com 기업보험 110여 종에서 검색</a>하거나 <a href="/consult.html?ref=search&amp;product=' + encodeURIComponent(q) + '">상담 신청</a>해 주세요.</div>';
      } else {
        html = results.map(function (r, i) {
          return '<a class="cg-sr" data-i="' + i + '" href="' + esc(r.p.u) + '"><span class="cg-sr-c">' + esc(r.p.c) + '</span>' +
            '<div class="cg-sr-t">' + hl(r.p.t, q) + '</div>' +
            (r.p.d ? '<p class="cg-sr-d">' + hl(r.p.d.length > 110 ? r.p.d.slice(0, 110) + '…' : r.p.d, q) + '</p>' : '') + '</a>';
        }).join('') + '<a class="cg-sr-more" href="' + n2nibUrl(q) + '">n2nib.com 기업보험 110여 종에서 “' + esc(q) + '” 검색 →</a>';
      }
      dd.innerHTML = html; dd.classList.add('open');
    }
    function move(d) {
      var items = dd.querySelectorAll('.cg-sr'); if (!items.length) return;
      if (active > -1) items[active].classList.remove('active');
      active = (active + d + items.length) % items.length;
      items[active].classList.add('active'); items[active].scrollIntoView({ block: 'nearest' });
    }
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(render, 120); });
    input.addEventListener('focus', function () { if (input.value.trim()) render(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape') { dd.classList.remove('open'); input.blur(); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var q = input.value.trim(); if (!q) return;
        if (!results.length) results = search(q);
        var pick = results[active > -1 ? active : 0];
        location.href = pick ? pick.p.u : n2nibUrl(q);
      }
    });
    document.addEventListener('click', function (e) { if (!box.contains(e.target)) dd.classList.remove('open'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
