/* cargoinsu.com — site-wide UI script */
(function () {
  'use strict';

  // ───── Mobile GNB hamburger toggle ─────
  var toggle = document.querySelector('.menu-toggle');
  var gnbList = document.querySelector('.gnb > ul');
  if (toggle && gnbList) {
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      gnbList.classList.toggle('open');
      toggle.classList.toggle('is-active');
    });

    // 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', function (e) {
      if (!gnbList.contains(e.target) && !toggle.contains(e.target)) {
        gnbList.classList.remove('open');
        toggle.classList.remove('is-active');
      }
    });
  }

  // ───── Active GNB highlight (현재 페이지 메뉴 강조) ─────
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var liNodes = document.querySelectorAll('.gnb > ul > li');
  for (var i = 0; i < liNodes.length; i++) {
    var li = liNodes[i];
    var link = li.querySelector('a');
    if (!link) continue;
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href === path) li.classList.add('active');
    var d2links = li.querySelectorAll('.depth2 a, .depth2--mega a');
    for (var j = 0; j < d2links.length; j++) {
      var h2 = (d2links[j].getAttribute('href') || '').toLowerCase();
      if (h2 === path) {
        li.classList.add('active');
        break;
      }
    }
  }

  // ───── Right-quick To-Top 스크롤 ─────
  var toTop = document.querySelector('.rq-totop');
  if (toTop) {
    toTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ───── Product detail page: tab switching ─────
  var tabBtns = document.querySelectorAll('.pd-tab-btn');
  var tabPanes = document.querySelectorAll('.pd-tab-pane');
  if (tabBtns.length && tabPanes.length) {
    for (var k = 0; k < tabBtns.length; k++) {
      tabBtns[k].addEventListener('click', function (e) {
        e.preventDefault();
        var btn = e.currentTarget;
        var target = btn.getAttribute('data-tab');
        for (var m = 0; m < tabBtns.length; m++) tabBtns[m].classList.remove('active');
        for (var n = 0; n < tabPanes.length; n++) tabPanes[n].classList.remove('active');
        btn.classList.add('active');
        var pane = document.getElementById(target);
        if (pane) pane.classList.add('active');
        if (history.replaceState) history.replaceState(null, '', '#' + target);
      });
    }
    // hash로 진입 시 해당 탭 활성화
    var hash = (location.hash || '').replace('#', '');
    if (hash) {
      var hashBtn = document.querySelector('.pd-tab-btn[data-tab="' + hash + '"]');
      if (hashBtn) hashBtn.click();
    }
  }

  // =====================================================
  // Quick Win 1 — 푸터 신뢰 블록 자동 주입 (모든 페이지)
  // =====================================================
  function injectFooterTrust() {
    var footer = document.querySelector('footer.site-footer');
    if (!footer) return;
    if (footer.querySelector('.footer-trust')) return;
    var bottom = footer.querySelector('.footer-bottom');
    var trust = document.createElement('div');
    trust.className = 'footer-trust';
    trust.style.cssText = 'border-top:1px solid rgba(244,240,232,.15);margin-top:1.5rem;padding-top:1rem;font-size:.78rem;line-height:1.6;color:rgba(244,240,232,.7)';
    trust.innerHTML = '\n  <div class="container">\n    <strong style="color:rgba(244,240,232,.85)">예금자보호</strong> 본 사이트의 모든 손해보험 상품은 예금자보호법에 따라 1인당 최고 <strong>1억원</strong>까지 보호됩니다.<br>\n    <strong style="color:rgba(244,240,232,.85)">보험사기 신고</strong> 금융감독원 ☎1332 · 보험사기방지센터 <a href="https://www.fss.or.kr/insec" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">www.fss.or.kr/insec</a><br>\n    <strong style="color:rgba(244,240,232,.85)">분쟁조정</strong> 금융분쟁조정위원회 ☎1332 · 한국소비자원 ☎1372<br>\n    <span style="opacity:.75">본 광고는 보험상품 안내자료이며, 계약내용은 약관·증권이 우선합니다. 광고는 자율준수 원칙에 따라 게재되었습니다.</span>\n  </div>\n';
    if (bottom && bottom.parentNode === footer) {
      footer.insertBefore(trust, bottom);
    } else if (bottom) {
      bottom.parentNode.insertBefore(trust, bottom);
    } else {
      footer.appendChild(trust);
    }
  }
  injectFooterTrust();

  // =====================================================
  // Quick Win 6 — 상품 페이지 통일 CTA 자동 주입
  // =====================================================
  function injectProductCTA() {
    var p = location.pathname.toLowerCase();
    if (p.indexOf('/products/') === -1) return;
    if (document.querySelector('.pd-cta-final')) return;
    var existing = document.querySelector('.pd-cta-bar');
    if (!existing) return;
    var productName = '';
    var link = existing.querySelector('a[href*="consult.html"]');
    if (link) {
      var href = link.getAttribute('href') || '';
      var m = href.match(/[?&]product=([^&]+)/);
      if (m) {
        try { productName = decodeURIComponent(m[1]); } catch(e) { productName = m[1]; }
      }
    }
    if (!productName) {
      var h1 = document.querySelector('h1');
      if (h1) productName = (h1.textContent || '').trim();
    }
    var encoded = encodeURIComponent(productName || '');
    var final = document.createElement('section');
    final.className = 'pd-cta-final';
    final.style.cssText = 'margin:24px 0;padding:20px;background:linear-gradient(135deg,#0B2818,#1a4a35);color:#F4F0E8;border-radius:8px;text-align:center';
    final.innerHTML =
      '<h3 style="margin:0 0 8px;color:#F4F0E8">이 상품으로 견적받기</h3>' +
      '<p style="margin:0 0 16px;opacity:.85;font-size:.9rem">엔투엔보험중개의 ACIU 보유 전문가가 6개 원수사 비교견적을 제공합니다.</p>' +
      '<a href="../consult.html?product=' + encoded + '" style="display:inline-block;padding:10px 24px;background:#F4F0E8;color:#0B2818;text-decoration:none;border-radius:6px;font-weight:700">무료 상담신청 →</a>' +
      '<a href="tel:010-5755-6465" style="display:inline-block;margin-left:8px;padding:10px 24px;background:transparent;color:#F4F0E8;text-decoration:none;border-radius:6px;font-weight:700;border:1px solid rgba(244,240,232,.4)">☎ 010-5755-6465</a>';
    existing.parentNode.insertBefore(final, existing.nextSibling);
  }
  injectProductCTA();

  // =====================================================
  // 모바일 상단 sticky 헤더 자동 주입 (cargoinsu, 모바일 전용)
  // 햄버거 + 로고 + 상담CTA (스크롤 시 항상 노출)
  // =====================================================
  function injectMobileStickyHeader() {
    if (document.querySelector('.mobile-sticky-header')) return;
    var p = location.pathname.toLowerCase();
    var isInProducts = p.indexOf('/products/') !== -1;
    var homeHref = isInProducts ? '../index.html' : 'index.html';
    var consultHref = isInProducts ? '../consult.html' : 'consult.html';
    var logoSrc = isInProducts ? '../assets/logo-horizontal.svg' : 'assets/logo-horizontal.svg';
    var header = document.createElement('header');
    header.className = 'mobile-sticky-header';
    header.setAttribute('role', 'banner');
    header.innerHTML =
      '<button type="button" class="msh-menu" aria-label="메뉴 열기"><span></span></button>' +
      '<a class="msh-logo" href="' + homeHref + '" aria-label="cargoinsu 홈">' +
        '<img src="' + logoSrc + '" alt="N2N Insurance Brokerage / cargoinsu.com">' +
      '</a>' +
      '<a class="msh-cta" href="' + consultHref + '">상담신청</a>';
    document.body.insertBefore(header, document.body.firstChild);
    var newMenuBtn = header.querySelector('.msh-menu');
    if (newMenuBtn) {
      newMenuBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        var gnbList = document.querySelector('.gnb > ul');
        var origToggle = document.querySelector('.menu-toggle');
        var isOpen = gnbList && gnbList.classList.contains('open');
        if (gnbList) gnbList.classList.toggle('open');
        if (origToggle) origToggle.classList.toggle('is-active');
        document.body.classList.toggle('mobile-menu-open', !isOpen);
        newMenuBtn.classList.toggle('is-open', !isOpen);
        newMenuBtn.setAttribute('aria-label', !isOpen ? '메뉴 닫기' : '메뉴 열기');
        if (!isOpen) window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
  injectMobileStickyHeader();

  // 모바일 GNB 펼침 시 하단에 전화·카톡 버튼 자동 주입 (모바일 전용)
  // ★ FIX: 데스크톱(≥781px)에서는 절대 주입 안 함
  function injectMobileMenuFooterCTAs() {
    if (window.matchMedia && window.matchMedia('(min-width: 781px)').matches) return;
    var gnbList = document.querySelector('.gnb > ul');
    if (!gnbList || gnbList.querySelector('.mmf-cta')) return;
    var li = document.createElement('li');
    li.className = 'mmf-cta';
    li.style.cssText = 'list-style:none;padding:14px 20px 18px;display:flex;flex-direction:column;gap:10px;border-top:1px solid rgba(244,240,232,0.18);margin-top:8px';
    li.innerHTML =
      '<a href="tel:010-5755-6465" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:transparent;border:1px solid rgba(244,240,232,0.6);border-radius:6px;color:#F4F0E8;text-decoration:none;font-weight:700">☎ 전화상담 010-5755-6465</a>' +
      '<a href="https://pf.kakao.com/_xlxkxdTX/chat" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#FEE500;color:#3C1E1E;border-radius:6px;text-decoration:none;font-weight:700">💬 카카오톡 1:1 상담</a>';
    gnbList.appendChild(li);
  }
  injectMobileMenuFooterCTAs();

  // =====================================================
  // 데스크톱 sticky 헤더 — 로고 영역을 .gnb 좌측에 주입 (cargoinsu)
  // =====================================================
  function injectDesktopHeaderLogo() {
    var gnb = document.querySelector('.gnb');
    if (!gnb) return;
    if (gnb.querySelector('.gnb-logo')) return;
    var p = location.pathname.toLowerCase();
    var isInProducts = p.indexOf('/products/') !== -1;
    var homeHref = isInProducts ? '../index.html' : 'index.html';
    var logoSrc = isInProducts ? '../assets/logo-horizontal-dark.svg' : 'assets/logo-horizontal-dark.svg';
    var logoAnchor = document.createElement('a');
    logoAnchor.className = 'gnb-logo';
    logoAnchor.href = homeHref;
    logoAnchor.setAttribute('aria-label', 'cargoinsu.com 홈');
    logoAnchor.innerHTML =
      '<img src="' + logoSrc + '" alt="N2N Insurance Brokerage">';
    gnb.insertBefore(logoAnchor, gnb.firstChild);
  }
  injectDesktopHeaderLogo();

  // =====================================================
  // 푸터 CTA 클러스터 — 상담신청 + 전화 + 카톡 (cargoinsu)
  // =====================================================
  function injectFooterCTACluster() {
    var footer = document.querySelector('footer.site-footer');
    if (!footer) return;
    if (document.querySelector('.footer-cta-cluster')) return;
    var p = location.pathname.toLowerCase();
    var isInProducts = p.indexOf('/products/') !== -1;
    var consultHref = isInProducts ? '../consult.html' : 'consult.html';
    var section = document.createElement('section');
    section.className = 'footer-cta-cluster';
    section.setAttribute('aria-label', '빠른 상담 안내');
    section.innerHTML =
      '<div class="fcc-inner">' +
        '<h3>전문 보험중개사가 직접 상담합니다</h3>' +
        '<p class="fcc-sub">ACIU 자격 보유 · 6개 원수사 비교견적<br>평균 1영업일 회신</p>' +
        '<div class="fcc-buttons">' +
          '<a class="fcc-primary" href="' + consultHref + '">✎ 상담신청</a>' +
          '<a class="fcc-phone" href="tel:010-5755-6465">☎ 010-5755-6465</a>' +
          '<a class="fcc-kakao" href="https://pf.kakao.com/_xlxkxdTX/chat" target="_blank" rel="noopener">💬 카톡상담</a>' +
        '</div>' +
      '</div>';
    footer.parentNode.insertBefore(section, footer);
  }
  injectFooterCTACluster();

  // =====================================================
  // 모바일 하단 sticky CTA 바 자동 주입 (cargoinsu, 모바일 전용)
  // index.html에서는 "자동견적"으로, 그 외 페이지에서는 "상담신청"으로 분기
  // =====================================================
  function injectMobileCTABar() {
    if (document.querySelector('.mobile-cta-bar')) return;
    var p = location.pathname.toLowerCase();
    var isProductDetail = p.indexOf('/products/') !== -1;
    var isIndex = p === '/' || p.endsWith('/index.html') || p.endsWith('cargoinsu.com/');
    var primaryHref, primaryLabel, primaryIcon;
    if (isIndex) {
      primaryHref = '#calc-section'; primaryLabel = '자동견적'; primaryIcon = '⚡';
    } else if (isProductDetail) {
      primaryHref = '../consult.html'; primaryLabel = '상담신청'; primaryIcon = '✎';
    } else {
      primaryHref = 'consult.html'; primaryLabel = '상담신청'; primaryIcon = '✎';
    }
    var bar = document.createElement('nav');
    bar.className = 'mobile-cta-bar';
    bar.setAttribute('aria-label', '빠른 연락');
    bar.innerHTML =
      '<a href="tel:010-5755-6465" aria-label="전화상담"><span class="ico">☎</span><span>전화</span></a>' +
      '<a class="cta-kakao" href="https://pf.kakao.com/_xlxkxdTX/chat" target="_blank" rel="noopener" aria-label="카카오톡 상담"><span class="ico">💬</span><span>카톡</span></a>' +
      '<a class="cta-primary" href="' + primaryHref + '" aria-label="' + primaryLabel + '"><span class="ico">' + primaryIcon + '</span><span>' + primaryLabel + '</span></a>';
    document.body.appendChild(bar);
    document.body.classList.add('has-mobile-cta');
  }
  // 하단 CTA 바 비활성화 — 벤치마크 매칭
  // injectMobileCTABar();

})();

// =====================================================
// Quick Win 7 — GTM dataLayer 이벤트 자동 트래킹
// =====================================================
window.dataLayer = window.dataLayer || [];

document.addEventListener('DOMContentLoaded', function() {
  // 1. 전화 클릭
  document.querySelectorAll('a[href^="tel:"]').forEach(function(el){
    el.addEventListener('click', function(){
      window.dataLayer.push({event:'phone_click', phone_number:el.href.replace('tel:','')});
    });
  });
  // 2. 이메일 클릭 — GTM 이벤트 + 클립보드 복사 폴백 (PC 메일앱 미설정 대응)
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(el){
    el.addEventListener('click', function(e){
      var email = el.href.replace('mailto:','').split('?')[0];
      window.dataLayer.push({event:'email_click', email:email});
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function(){
          showToast('이메일 주소를 복사했습니다: ' + email);
        }).catch(function(){});
      }
    });
  });
  // ---- 토스트 알림 ----
  function showToast(msg){
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;bottom:32px;transform:translateX(-50%);background:#0B2818;color:#F4F0E8;padding:12px 20px;border-radius:8px;font-size:.9rem;font-weight:600;box-shadow:0 4px 16px rgba(0,0,0,.25);z-index:99999;opacity:0;transition:opacity .3s';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.opacity='1'; });
    setTimeout(function(){
      t.style.opacity='0';
      setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, 2700);
  }
  // 3. 카카오 클릭
  document.querySelectorAll('a[href*="pf.kakao.com"]').forEach(function(el){
    el.addEventListener('click', function(){
      window.dataLayer.push({event:'kakao_click'});
    });
  });
  // 4. 폼 제출 (consult/quote)
  document.querySelectorAll('form').forEach(function(f){
    f.addEventListener('submit', function(){
      window.dataLayer.push({event:'form_submit', form_id:f.id||f.name||'unknown'});
    });
  });
  // 5. 자동견적 사용 (cargoinsu)
  document.querySelectorAll('[data-calculator], #calcSubmit').forEach(function(el){
    el.addEventListener('click', function(){
      window.dataLayer.push({event:'calculator_use'});
    });
  });
});
