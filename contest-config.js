/* 대회용 설정 (공공 AI 대전환 챌린지 출품용 사본)
   - 배포한 대회용 Apps Script 웹앱 주소를 WEBAPP_URL 한 곳에만 넣으면 모든 화면이 그 주소를 씁니다.
   - 운영 서버 주소를 넣지 마십시오.
   - SIMPLE: 심사용 단순 화면(d1, 2026-10-16 결정). 홈·강의실 메뉴를 숨기고 첫 화면을 강의배정으로,
     로그인은 비밀번호 없이 [로그인] 버튼 하나로, 강사 승인은 확인창으로 줄입니다. false로 바꾸면 원래 화면으로 돌아갑니다(코드는 지우지 않음). */
window.CONTEST_CONFIG = {
  WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbzYdVSZsLnSw3JN01aIDuXa1Ubxh6ERWYC-0TEQxu6tRYrcI9-WNYEoKv3Cfk9qyUvJ/exec',
  VERSION: '대회용 d2',
  ORG_NAME: '○○소방학교',
  SIMPLE: true,
  DEMO_PW: '0000',      // 심사용 담당자 권한(모의 데이터 전용). 운영판은 개인 비밀번호 사용
  DEMO_ADMIN: '1111',   // 심사용 승인 권한(화면에서는 묻지 않고 확인창만 표시)
  // 강의배정 첫 화면에 먼저 보여 줄 과정(ai: 강사 미배정 → AI 일괄 배정, copy: 편성 전 → 지난 기수 불러오기, cell: 빈 칸 1개)
  DEMO_COURSES: { '소방관계법규 실무과정 8기': 'ai', '구급역량 향상과정 10기': 'copy', '화재조사 전문과정 12기': 'cell' },
  // 평가관리 첫 화면에 보여 줄 과정(반영 대기 2 + 반영 완료 1)
  DEMO_EVAL: ['신임 관리자 리더십과정 16기', '구조역량 강화과정 13기', '소방관계법규 실무과정 7기']
};
(function () {
  var C = window.CONTEST_CONFIG;
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (C.SIMPLE && (page === 'home.html' || page === 'index.html' || page === '')) {
    location.replace('lecture-assignment.html#v=table');
    return;
  }
  function banner() {
    if (document.getElementById('contestBanner')) return;
    var b = document.createElement('div');
    b.id = 'contestBanner';
    b.setAttribute('role', 'note');
    b.textContent = '대회용 · 모의데이터 — 실제 인물·연락처가 아닙니다. 메일·문자는 실제로 발송되지 않습니다(시연 모드).';
    b.style.cssText = 'background:#7A2E0E;color:#fff;font-size:12.5px;font-weight:700;text-align:center;padding:6px 12px;line-height:1.4;letter-spacing:-0.2px;';
    document.body.insertBefore(b, document.body.firstChild);
    var v = document.createElement('div');
    v.id = 'contestVersion';
    v.textContent = C.VERSION;
    v.style.cssText = 'text-align:center;color:#9AA5B1;font-size:11px;padding:10px 0 14px;';
    document.body.appendChild(v);
  }
  function simple() {
    if (!C.SIMPLE) return;
    // 상단 메뉴: 강의배정 · 강사관리 · 평가관리만
    Array.prototype.forEach.call(document.querySelectorAll('.gnav a.gnav-i'), function (a) {
      var h = a.getAttribute('href') || '';
      if (/home\.html/.test(h) || /#v=room/.test(h) || a.id === 'gnavRoom') a.style.display = 'none';
    });
    // 홈을 숨겼으므로 '홈 ›' 경로 표시도 숨김
    Array.prototype.forEach.call(document.querySelectorAll('#crumb, .crumb'), function (c) { c.style.display = 'none'; });
    var br = document.querySelector('.gnav-brand');
    if (br) { br.style.cursor = 'pointer'; br.onclick = function () { location.href = 'lecture-assignment.html#v=table'; }; }
    // 로그인: 비밀번호 칸 없이 [로그인] 버튼(담당자 권한으로 입장)
    var form = document.getElementById('loginForm'), btn = document.getElementById('loginBtn');
    var pins = document.querySelectorAll('#loginForm .pin-box');
    if (form && btn && pins.length) {
      Array.prototype.forEach.call(pins, function (p) { p.parentNode.style.display = 'none'; });
      btn.textContent = '로그인';
      var sub = document.querySelector('#loginCard .sub');
      if (sub) sub.textContent = '담당자 로그인 · 심사용 사본은 비밀번호 없이 들어갑니다';
      var fill = function () { Array.prototype.forEach.call(pins, function (p, i) { p.value = String(C.DEMO_PW).charAt(i) || ''; }); };
      btn.addEventListener('click', fill, true);
      form.addEventListener('submit', fill, true);
    }
  }
  function ready() { banner(); simple(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
