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
})();
